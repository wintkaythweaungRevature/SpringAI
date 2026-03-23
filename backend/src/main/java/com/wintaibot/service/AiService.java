package com.wintaibot.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@Service
public class AiService {

    @Value("${openai.api-key}")
    private String openAiApiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public String askAi(String prompt) throws Exception {
        if (prompt == null || prompt.isBlank()) {
            return "Please enter a question.";
        }
        if (openAiApiKey == null || openAiApiKey.isBlank()) {
            throw new RuntimeException("OpenAI API key not configured. Set OPENAI_API_KEY.");
        }
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(openAiApiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> body = new HashMap<>();
        body.put("model", "gpt-4o");
        body.put("messages", List.of(
                Map.of("role", "system", "content", "You are a helpful AI assistant. Be concise and helpful."),
                Map.of("role", "user", "content", prompt)
        ));

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
        ResponseEntity<Map> response = restTemplate.postForEntity(
                "https://api.openai.com/v1/chat/completions", request, Map.class);

        if (!response.getStatusCode().is2xxSuccessful()) {
            throw new RuntimeException("OpenAI API error: " + response.getStatusCode());
        }

        List<Map<String, Object>> choices = (List<Map<String, Object>>) response.getBody().get("choices");
        Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
        return (String) message.get("content");
    }

    public Map<String, Object> prepareInterview(MultipartFile file, String jd) throws Exception {
        String resumeText = extractPdfText(file);
        String prompt = buildPrompt(resumeText, jd);
        String aiResponse = callOpenAi(prompt);
        return parseAiResponse(aiResponse);
    }

    private String extractPdfText(MultipartFile file) throws Exception {
        byte[] pdfBytes = file.getBytes();
        try (PDDocument doc = Loader.loadPDF(pdfBytes)) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(doc);
        }
    }

    private String buildPrompt(String resumeText, String jd) {
        return """
                You are an expert career coach and technical interviewer.
                Analyze the resume against the job description and return a JSON object.

                Return ONLY a valid JSON object with this exact structure (no markdown, no extra text):
                {
                  "match_percentage": <integer 0-100>,
                  "analysis": "<2-3 paragraphs: keyword matches found, skill gaps, overall assessment>",
                  "questions": [
                    {"q": "<interview question>", "guidance": "<concise tip on how to answer>"}
                  ],
                  "flashcards": [
                    {"front": "<key term or concept from JD>", "back": "<definition or explanation>"}
                  ]
                }

                Requirements:
                - match_percentage: percentage of JD keywords/skills found in resume (integer)
                - analysis: detailed text analysis of keyword matches, gaps, and strengths
                - questions: exactly 30 interview questions tailored to this role and candidate
                - flashcards: exactly 20 study flashcards for key terms and technologies from the JD

                JOB DESCRIPTION:
                %s

                RESUME:
                %s
                """.formatted(jd, resumeText);
    }

    @SuppressWarnings("unchecked")
    private String callOpenAi(String prompt) throws Exception {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(openAiApiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> body = new HashMap<>();
        body.put("model", "gpt-4o");
        body.put("response_format", Map.of("type", "json_object"));
        body.put("messages", List.of(
                Map.of("role", "system", "content", "You are an expert career coach. Always respond with valid JSON only."),
                Map.of("role", "user", "content", prompt)
        ));

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
        ResponseEntity<Map> response = restTemplate.postForEntity(
                "https://api.openai.com/v1/chat/completions", request, Map.class);

        if (!response.getStatusCode().is2xxSuccessful()) {
            throw new RuntimeException("OpenAI API error: " + response.getStatusCode());
        }

        List<Map<String, Object>> choices = (List<Map<String, Object>>) response.getBody().get("choices");
        Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
        return (String) message.get("content");
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> parseAiResponse(String text) throws Exception {
        int start = text.indexOf('{');
        int end = text.lastIndexOf('}');
        if (start == -1 || end == -1) {
            throw new RuntimeException("No JSON found in AI response");
        }
        return objectMapper.readValue(text.substring(start, end + 1), Map.class);
    }
}
