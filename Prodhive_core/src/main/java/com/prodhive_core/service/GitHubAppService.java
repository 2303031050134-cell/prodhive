package com.prodhive_core.service;

import com.prodhive_core.entity.GithubInstallation;
import com.prodhive_core.repository.GithubInstallationRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.nio.charset.StandardCharsets;
import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.Signature;
import java.security.spec.PKCS8EncodedKeySpec;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;

@Service
public class GitHubAppService {
    private final GithubInstallationRepository installationRepository;
    private final RestClient github;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${github.app.id:}") private String appId;
    @Value("${github.app.private-key:}") private String privateKeyPem;
    @Value("${github.app.slug:prodhive}") private String appSlug;
    @Value("${github.app.webhook-secret:}") private String appWebhookSecret;

    public GitHubAppService(GithubInstallationRepository installationRepository) {
        this.installationRepository = installationRepository;
        this.github = RestClient.builder().baseUrl("https://api.github.com").build();
    }

    public boolean configured() {
        return appId != null && !appId.isBlank() && privateKeyPem != null && !privateKeyPem.isBlank();
    }

    public String installationUrl(Long projectId, String frontendUrl) {
        String state = createState(projectId);
        return "https://github.com/apps/" + appSlug + "/installations/new?state=" + state;
    }

    public String getWebhookSecret() { return appWebhookSecret; }
    public String createState(Long projectId) {
        String value = projectId + ":" + Instant.now().getEpochSecond();
        String signature = hmac(value, appWebhookSecret == null ? "" : appWebhookSecret);
        return Base64.getUrlEncoder().withoutPadding().encodeToString((value + ":" + signature).getBytes(StandardCharsets.UTF_8));
    }

    public Long parseState(String state) {
        try {
            String decoded = new String(Base64.getUrlDecoder().decode(state), StandardCharsets.UTF_8);
            String[] parts = decoded.split(":", 3);
            if (parts.length != 3) throw new IllegalArgumentException("Invalid state");
            String expected = hmac(parts[0] + ":" + parts[1], appWebhookSecret == null ? "" : appWebhookSecret);
            if (!java.security.MessageDigest.isEqual(expected.getBytes(StandardCharsets.UTF_8), parts[2].getBytes(StandardCharsets.UTF_8))) throw new IllegalArgumentException("Invalid state signature");
            long issued = Long.parseLong(parts[1]);
            if (Math.abs(Instant.now().getEpochSecond() - issued) > 900) throw new IllegalArgumentException("Expired state");
            return Long.parseLong(parts[0]);
        } catch (Exception e) { throw new IllegalArgumentException("Invalid or expired GitHub state", e); }
    }

    private String hmac(String value, String secret) {
        try {
            javax.crypto.Mac mac = javax.crypto.Mac.getInstance("HmacSHA256");
            mac.init(new javax.crypto.spec.SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(mac.doFinal(value.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) { throw new IllegalStateException(e); }
    }


    public GithubInstallation upsertInstallation(JsonNode payload) {
        long installationId = payload.path("installation_id").asLong(0);
        if (installationId == 0) throw new IllegalArgumentException("Missing GitHub installation_id");
        JsonNode account = payload.path("account");
        GithubInstallation entity = installationRepository.findByInstallationId(installationId).orElseGet(GithubInstallation::new);
        entity.setInstallationId(installationId);
        entity.setAccountId(account.path("id").asLong(0));
        entity.setAccountLogin(account.path("login").asText("unknown"));
        entity.setAccountType(account.path("type").asText("User"));
        entity.setUpdatedAt(Instant.now());
        return installationRepository.save(entity);
    }

    public GithubInstallation syncInstallation(long installationId) {
        try {
            JsonNode payload = objectMapper.readTree(github.get().uri("/app/installations/{id}", installationId)
                    .header("Authorization", "Bearer " + createAppJwt())
                    .header("Accept", MediaType.APPLICATION_JSON_VALUE)
                    .header("X-GitHub-Api-Version", "2026-03-10")
                    .retrieve().body(String.class));
            GithubInstallation entity = installationRepository.findByInstallationId(installationId).orElseGet(GithubInstallation::new);
            entity.setInstallationId(installationId);
            entity.setAccountId(payload.path("account").path("id").asLong(0));
            entity.setAccountLogin(payload.path("account").path("login").asText("unknown"));
            entity.setAccountType(payload.path("account").path("type").asText("User"));
            entity.setUpdatedAt(Instant.now());
            return installationRepository.save(entity);
        } catch (Exception e) {
            throw new IllegalStateException("Unable to load GitHub installation", e);
        }
    }

    public GithubInstallation getInstallation(long installationId) {
        return installationRepository.findByInstallationId(installationId).orElseThrow(() -> new IllegalArgumentException("GitHub installation not found"));
    }

    public String createInstallationToken(long installationId) {
        String jwt = createAppJwt();
        String response = github.post()
                .uri("/app/installations/{id}/access_tokens", installationId)
                .header("Authorization", "Bearer " + jwt)
                .header("Accept", MediaType.APPLICATION_JSON_VALUE)
                .header("X-GitHub-Api-Version", "2026-03-10")
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of())
                .retrieve().body(String.class);
        return objectMapper.readTree(response).path("token").asText();
    }

    public String listRepositories(long installationId) {
        String token = createInstallationToken(installationId);
        return github.get().uri("/installation/repositories?per_page=100")
                .header("Authorization", "Bearer " + token)
                .header("Accept", MediaType.APPLICATION_JSON_VALUE)
                .header("X-GitHub-Api-Version", "2026-03-10")
                .retrieve().body(String.class);
    }

    public String createAppJwt() {
        if (!configured()) throw new IllegalStateException("GitHub App is not configured");
        try {
            long now = Instant.now().getEpochSecond();
            String header = base64Url("{\"alg\":\"RS256\",\"typ\":\"JWT\"}");
            String payload = base64Url("{\"iat\":" + (now - 60) + ",\"exp\":" + (now + 540) + ",\"iss\":\"" + escapeJson(appId) + "\"}");
            String input = header + "." + payload;
            Signature signature = Signature.getInstance("SHA256withRSA");
            signature.initSign(readPrivateKey(privateKeyPem));
            signature.update(input.getBytes(StandardCharsets.UTF_8));
            return input + "." + Base64.getUrlEncoder().withoutPadding().encodeToString(signature.sign());
        } catch (Exception e) {
            throw new IllegalStateException("Unable to create GitHub App JWT", e);
        }
    }

    private PrivateKey readPrivateKey(String pem) throws Exception {
        String cleaned = pem.replace("\\n", "\n").trim();
        boolean isPkcs1 = cleaned.contains("RSA PRIVATE KEY");
        String normalized = cleaned
                .replace("-----BEGIN RSA PRIVATE KEY-----", "")
                .replace("-----END RSA PRIVATE KEY-----", "")
                .replace("-----BEGIN PRIVATE KEY-----", "")
                .replace("-----END PRIVATE KEY-----", "")
                .replaceAll("\\s", "");
        byte[] decoded = Base64.getDecoder().decode(normalized);
        if (isPkcs1) {
            decoded = pkcs1ToPkcs8(decoded);
        }
        return KeyFactory.getInstance("RSA").generatePrivate(new PKCS8EncodedKeySpec(decoded));
    }

    private byte[] pkcs1ToPkcs8(byte[] pkcs1) {
        byte[] pkcs8Header = new byte[] {
            0x30, (byte) 0x82, 0, 0,
            0x02, 0x01, 0x00,
            0x30, 0x0d,
            0x06, 0x09, 0x2a, (byte) 0x86, 0x48, (byte) 0x86, (byte) 0xf7, 0x0d, 0x01, 0x01, 0x01,
            0x05, 0x00,
            0x04, (byte) 0x82, 0, 0
        };
        int pkcs1Len = pkcs1.length;
        int totalLen = pkcs1Len + 22;
        pkcs8Header[2] = (byte) ((totalLen >> 8) & 0xff);
        pkcs8Header[3] = (byte) (totalLen & 0xff);
        pkcs8Header[20] = (byte) ((pkcs1Len >> 8) & 0xff);
        pkcs8Header[21] = (byte) (pkcs1Len & 0xff);

        byte[] result = new byte[pkcs8Header.length + pkcs1Len];
        System.arraycopy(pkcs8Header, 0, result, 0, pkcs8Header.length);
        System.arraycopy(pkcs1, 0, result, pkcs8Header.length, pkcs1Len);
        return result;
    }

    private String base64Url(String value) { return Base64.getUrlEncoder().withoutPadding().encodeToString(value.getBytes(StandardCharsets.UTF_8)); }
    private String escapeJson(String value) { return value.replace("\\", "\\\\").replace("\"", "\\\""); }
}
