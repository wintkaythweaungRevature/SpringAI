package com.wintaibot.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@Service
public class AiService {

    @Value("${openai.api-key:}")
    private String openaiApiKey;

    @Value("${openai.model:gpt-4o}")
    private String openaiModel;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public boolean isOpenAiConfigured() {
        return openaiApiKey != null && !openaiApiKey.isBlank();
    }

    public String getOpenaiModel() {
        return openaiModel != null ? openaiModel : "gpt-4o";
    }

    // Ask AI (free)
    public String askAi(String prompt) throws Exception {
        requireApiKey();
        return callOpenAIText(prompt);
    }

    // Generate Image (member)
    @SuppressWarnings("unchecked")
    public String generateImage(String prompt) throws Exception {
        requireApiKey();
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + openaiApiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> body = new HashMap<>();
        body.put("model", "dall-e-3");
        body.put("prompt", prompt);
        body.put("n", 1);
        body.put("size", "1024x1024");

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    "https://api.openai.com/v1/images/generations", request, Map.class);
            Map respBody = response.getBody();
            if (respBody == null) throw new RuntimeException("Empty response from image API");
            List<Map<String, Object>> data = (List<Map<String, Object>>) respBody.get("data");
            if (data == null || data.isEmpty()) throw new RuntimeException("No image in response");
            return (String) data.get(0).get("url");
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            throw new RuntimeException("Image API error: " + e.getStatusCode() + " - " + e.getResponseBodyAsString());
        }
    }

    // Transcribe Audio (member)
    @SuppressWarnings("unchecked")
    public String transcribeAudio(MultipartFile file) throws Exception {
        requireApiKey();
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + openaiApiKey);
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        String filename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "audio.mp3";
        final byte[] bytes = file.getBytes();
        ByteArrayResource resource = new ByteArrayResource(bytes) {
            @Override
            public String getFilename() { return filename; }
        };

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", resource);
        body.add("model", "whisper-1");
        body.add("language", "en");

        HttpEntity<MultiValueMap<String, Object>> request = new HttpEntity<>(body, headers);
        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    "https://api.openai.com/v1/audio/transcriptions", request, Map.class);
            Map respBody = response.getBody();
            if (respBody == null) throw new RuntimeException("Empty response from transcription API");
            Object text = respBody.get("text");
            return text != null ? text.toString() : "";
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            throw new RuntimeException("Transcription API error: " + e.getStatusCode() + " - " + e.getResponseBodyAsString());
        }
    }

    // Analyze PDF (member)
    @SuppressWarnings("unchecked")
    public Map<String, Object> analyzePdf(MultipartFile file, String userPrompt) throws Exception {
        requireApiKey();
        String pdfText = extractPdfText(file);
        String focus = (userPrompt != null ? userPrompt : "Analyze this document and extract all important information.")
                .replace("%", "%%");
        String content = pdfText.replace("%", "%%");

        String aiPrompt = "You are a data extraction assistant. Analyze the following document and return ONLY a valid minified JSON object.\n"
                + "Structure:\n"
                + "{\n"
                + "  \"summary\": \"2-3 sentence summary\",\n"
                + "  \"table_headers\": [\"Column1\", \"Column2\"],\n"
                + "  \"table_rows\": [[\"val1\", \"val2\"]],\n"
                + "  \"insights\": [\"Insight 1\"]\n"
                + "}\n"
                + "No markdown code blocks, no extra text.\n"
                + "Focus: " + focus + "\n"
                + "Content: " + content;

        String aiResponse = callOpenAIText(aiPrompt);
        return parseAiResponse(aiResponse);
    }

    // Email Reply (member)
    public String generateEmailReply(String emailContent, String tone) throws Exception {
        requireApiKey();
        String t = (tone != null && !tone.isBlank()) ? tone : "professional";
        String prompt = "Generate a " + t + " reply to the following email: " + emailContent;
        return callOpenAIText(prompt);
    }

    // Interview Prep (member)
    public Map<String, Object> prepareInterview(MultipartFile file, String jd) throws Exception {
        requireApiKey();
        String resumeText = extractPdfText(file);
        if (resumeText == null || resumeText.isBlank()) {
            throw new RuntimeException("Could not extract text from PDF. The file may be empty or corrupted.");
        }
        String aiResponse = callOpenAIText(buildInterviewPrompt(resumeText, jd));
        return parseAiResponse(aiResponse);
    }

    // Private helpers

    private void requireApiKey() {
        if (openaiApiKey == null || openaiApiKey.isBlank()) {
            throw new RuntimeException("OpenAI API key not configured.");
        }
    }

    private String extractPdfText(MultipartFile file) throws Exception {
        byte[] pdfBytes = file.getBytes();
        try (PDDocument doc = Loader.loadPDF(pdfBytes)) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(doc);
        }
    }

    private String buildInterviewPrompt(String resumeText, String jd) {
        return "You are an expert career coach and technical interviewer.\n"
                + "Return ONLY a valid JSON object with this exact structure (no markdown, no extra text):\n"
                + "{\n"
                + "  \"match_percentage\": <integer 0-100>,\n"
                + "  \"analysis\": \"<2-3 paragraphs>\",\n"
                + "  \"questions\": [{\"q\": \"<question>\", \"guidance\": \"<tip>\"}],\n"
                + "  \"flashcards\": [{\"front\": \"<term>\", \"back\": \"<definition>\"}]\n"
                + "}\n"
                + "Requirements: match_percentage is integer, exactly 30 questions, exactly 20 flashcards.\n\n"
                + "JOB DESCRIPTION:\n" + jd + "\n\nRESUME:\n" + resumeText;
    }

    @SuppressWarnings("unchecked")
    private String callOpenAIText(String prompt) throws Exception {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + openaiApiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> body = new HashMap<>();
        body.put("model", openaiModel);
        body.put("max_tokens", 8096);
        body.put("messages", List.of(Map.of("role", "user", "content", prompt)));

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    "https://api.openai.com/v1/chat/completions", request, Map.class);
            Map respBody = response.getBody();
            if (respBody == null) throw new RuntimeException("Empty response from OpenAI API");
            List<Map<String, Object>> choices = (List<Map<String, Object>>) respBody.get("choices");
            if (choices == null || choices.isEmpty()) throw new RuntimeException("No content in OpenAI API response");
            Map<String, Object> msg = (Map<String, Object>) choices.get(0).get("message");
            Object content = msg != null ? msg.get("content") : null;
            return content != null ? content.toString() : "";
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            throw new RuntimeException("OpenAI API error: " + e.getStatusCode() + " - " + e.getResponseBodyAsString());
        } catch (org.springframework.web.client.RestClientException e) {
            throw new RuntimeException("OpenAI API request failed: " + e.getMessage());
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> parseAiResponse(String text) throws Exception {
        if (text == null || text.isBlank()) throw new RuntimeException("Empty response from AI");
        int start = text.indexOf('{');
        int end = text.lastIndexOf('}');
        if (start == -1 || end == -1) throw new RuntimeException("No JSON found in AI response");
        return objectMapper.readValue(text.substring(start, end + 1), Map.class);
    }
}
