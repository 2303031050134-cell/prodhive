package com.prodhive_core.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.util.Map;

@Service
public class AIService {

    private final RestClient restClient;
    private final String apiKey;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AIService(
            @Value("${openrouter.api.key}") String apiKey
    ) {
        this.apiKey = apiKey;

        this.restClient = RestClient.builder()
                .baseUrl("https://openrouter.ai/api/v1")
                .build();
    }

    /** Returns just the model's written analysis — not the full OpenRouter response envelope
     *  (id, model, token usage, etc.) that the raw API call returns. */
    public String analyzeIssue(
            String title,
            String description,
            String priority,
            String type,
            String status
    ) {

        String prompt = """
                Analyze the following software project issue.

                Title: %s
                Description: %s
                Type: %s
                Priority: %s
                Status: %s

                Provide:
                1. A concise summary
                2. Suggested priority
                3. Main risk factors
                4. Recommended action

                Keep the response concise and practical for a software development team.
                """.formatted(
                title,
                description == null || description.isBlank() ? "(no description provided)" : description,
                type,
                priority,
                status
        );

        Map<String, Object> body = Map.of(
                "model", "openrouter/free",
                "messages", new Object[]{
                        Map.of(
                                "role", "user",
                                "content", prompt
                        )
                }
        );

        String raw = restClient.post()
                .uri("/chat/completions")
                .header(
                        "Authorization",
                        "Bearer " + apiKey
                )
                .header(
                        "Content-Type",
                        MediaType.APPLICATION_JSON_VALUE
                )
                .body(body)
                .retrieve()
                .body(String.class);

        return extractContent(raw);
    }

    private String extractContent(String raw) {
        try {
            JsonNode root = objectMapper.readTree(raw);
            JsonNode error = root.get("error");
            if (error != null) {
                String message = error.has("message") ? error.get("message").asText() : "Unknown error from AI provider";
                throw new IllegalStateException("AI analysis failed: " + message);
            }
            JsonNode content = root.path("choices").path(0).path("message").path("content");
            if (content.isMissingNode() || content.asText().isBlank()) {
                throw new IllegalStateException("AI provider returned an empty response");
            }
            return content.asText();
        } catch (IllegalStateException e) {
            throw e;
        } catch (Exception e) {
            throw new IllegalStateException("Could not parse AI provider response", e);
        }
    }
}