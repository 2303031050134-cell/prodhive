package com.prodhive_core.controller;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import com.prodhive_core.entity.WebhookDelivery;
import com.prodhive_core.repository.WebhookDeliveryRepository;
import com.prodhive_core.security.GitHubSignatureVerifier;
import com.prodhive_core.service.GitHubWebhookProcessingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/api/core/webhooks/github")
public class GitHubWebhookController {
    private final GitHubSignatureVerifier signatureVerifier;
    private final WebhookDeliveryRepository deliveryRepository;
    private final GitHubWebhookProcessingService processingService;
    private final com.prodhive_core.service.GitHubAppService appService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public GitHubWebhookController(GitHubSignatureVerifier signatureVerifier,
                                   WebhookDeliveryRepository deliveryRepository,
                                   GitHubWebhookProcessingService processingService, com.prodhive_core.service.GitHubAppService appService) {
        this.signatureVerifier = signatureVerifier;
        this.deliveryRepository = deliveryRepository;
        this.processingService = processingService;
        this.appService = appService;
    }

    private boolean isAppSignatureValid(String payload, String signature) {
        String secret = appService.getWebhookSecret();
        if (secret == null || secret.isBlank() || signature == null || !signature.startsWith("sha256=")) return false;
        try {
            javax.crypto.Mac mac = javax.crypto.Mac.getInstance("HmacSHA256");
            mac.init(new javax.crypto.spec.SecretKeySpec(secret.getBytes(java.nio.charset.StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] hash = mac.doFinal(payload.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder("sha256=");
            for (byte b : hash) sb.append(String.format("%02x", b));
            return java.security.MessageDigest.isEqual(sb.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8), signature.getBytes(java.nio.charset.StandardCharsets.UTF_8));
        } catch (Exception e) { return false; }
    }

    @PostMapping
    public ResponseEntity<String> receive(@RequestHeader("X-GitHub-Event") String eventType,
                                          @RequestHeader("X-GitHub-Delivery") String deliveryId,
                                          @RequestHeader("X-Hub-Signature-256") String signature,
                                          @RequestBody String rawPayload) {
        if (!signatureVerifier.isValid(rawPayload, signature) && !isAppSignatureValid(rawPayload, signature)) {
            return ResponseEntity.status(401).body("invalid signature");
        }
        if (deliveryRepository.findByDeliveryId(deliveryId).isPresent()) {
            return ResponseEntity.ok("duplicate delivery ignored");
        }
        WebhookDelivery delivery = new WebhookDelivery();
        delivery.setDeliveryId(deliveryId);
        delivery.setEventType(eventType);
        delivery.setRepositoryId(0L);
        delivery.setProcessed(false);
        deliveryRepository.save(delivery);
        try {
            JsonNode payload = objectMapper.readTree(rawPayload);
            processingService.processAsync(delivery.getId(), eventType, payload);
        } catch (Exception e) {
            delivery.setError(e.getMessage());
            deliveryRepository.save(delivery);
            return ResponseEntity.status(500).body("processing error");
        }
        return ResponseEntity.ok("accepted");
    }
}