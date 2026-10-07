package com.prodhive_core.service;

import com.prodhive_core.entity.GithubIntegration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class GitHubApiClient {
    private final RestClient restClient;
    private final GitHubAppService gitHubAppService;

    public GitHubApiClient(GitHubAppService gitHubAppService) {
        this.gitHubAppService = gitHubAppService;
        this.restClient = RestClient.builder().baseUrl("https://api.github.com").build();
    }

    public String getPullRequests(GithubIntegration integration) {
        String token = tokenFor(integration);
        return restClient.get()
                .uri("/repos/{repo}/pulls?state=all&per_page=100", integration.getRepoFullName())
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .header(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
                .header("X-GitHub-Api-Version", "2026-03-10")
                .retrieve().body(String.class);
    }

    public String getPullRequestReviews(GithubIntegration integration, long prNumber) {
        String token = tokenFor(integration);
        return restClient.get()
                .uri("/repos/{repo}/pulls/{number}/reviews", integration.getRepoFullName(), prNumber)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .header(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
                .header("X-GitHub-Api-Version", "2026-03-10")
                .retrieve().body(String.class);
    }

    /** Requests one or more reviewers on a PR via GitHub's API. Returns the raw JSON response. */
    public String requestReviewers(GithubIntegration integration, long prNumber, java.util.List<String> reviewerLogins) {
        String token = tokenFor(integration);
        return restClient.post()
                .uri("/repos/{repo}/pulls/{number}/requested_reviewers", integration.getRepoFullName(), prNumber)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .header(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
                .header("X-GitHub-Api-Version", "2026-03-10")
                .contentType(MediaType.APPLICATION_JSON)
                .body(java.util.Map.of("reviewers", reviewerLogins))
                .retrieve().body(String.class);
    }

    public String getAuthenticatedUser(GithubIntegration integration) {
        String token = tokenFor(integration);
        return restClient.get().uri("/user")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .header(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
                .header("X-GitHub-Api-Version", "2026-03-10")
                .retrieve().body(String.class);
    }

    private String tokenFor(GithubIntegration integration) {
        if (integration.getInstallationId() != null) {
            return gitHubAppService.createInstallationToken(integration.getInstallationId());
        }
        if (integration.getAccessToken() != null && !integration.getAccessToken().isBlank()) {
            return integration.getAccessToken();
        }
        throw new IllegalStateException("GitHub integration has no App installation or legacy access token");
    }
}
