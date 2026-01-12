package com.example.SpringAIDemo;

import org.springframework.ai.image.ImagePrompt;
import org.springframework.ai.image.ImageResponse;
import org.springframework.ai.openai.OpenAiImageModel;
import org.springframework.ai.openai.OpenAiImageOptions;
import org.springframework.stereotype.Service;

@Service
public class ImageService {

    private final OpenAiImageModel openaiImageModel;


    public ImageService(OpenAiImageModel openaiImageModel) {
        this.openaiImageModel = openaiImageModel;
    }
    public ImageResponse generateImage(String prompt, String quality,int n, int width,int height)
    {
       ImageResponse imageResponse = openaiImageModel.call(
                new ImagePrompt(prompt,
                        OpenAiImageOptions.builder()
                                .model("dall-e-2")
                        .quality(quality)
                        .N(n)
                        .height(height)
                        .width(width).build())
        );
       return imageResponse;
    }
}
