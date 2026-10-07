package com.prodhive_core.dto;

import com.prodhive_core.entity.GithubIntegration;

import java.time.Instant;

/**
 * Safe-to-expose view of a GithubIntegration. Deliberately omits accessToken —
 * returning the raw entity previously leaked PAT-based access tokens (and would
 * leak any future token field) straight into the browser's network response.
 */
public record GithubIntegrationSummary(
        Long id,
        String repoFullName,
        Long installationId,
        String accountLogin,
        String accountType,
        Long connectedBy,
        Instant connectedAt,
        Instant lastSyncedAt
) {
    public static GithubIntegrationSummary from(GithubIntegration i) {
        return new GithubIntegrationSummary(
                i.getId(), i.getRepoFullName(), i.getInstallationId(), i.getAccountLogin(),
                i.getAccountType(), i.getConnectedBy(), i.getConnectedAt(), i.getLastSyncedAt()
        );
    }
}
