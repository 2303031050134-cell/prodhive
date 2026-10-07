package com.prodhive_core.service;

import com.prodhive_core.entity.GithubIntegration;
import com.prodhive_core.entity.Issue;
import com.prodhive_core.entity.PullRequest;
import com.prodhive_core.repository.GitHubIntegrationRepository;
import com.prodhive_core.repository.PullRequestRepository;
import com.prodhive_core.repository.ReviewRepository;
import com.prodhive_core.entity.ReviewState;
import org.springframework.stereotype.Service;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

@Service
public class GitHubSyncService {

    private final GitHubIntegrationRepository integrationRepository;
    private final PullRequestRepository pullRequestRepository;
    private final GitHubApiClient gitHubApiClient;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final PrLinkingService prLinkingService;
    private final ReviewRepository reviewRepository;
    private final ReviewService reviewService;

    public GitHubSyncService(
            GitHubIntegrationRepository integrationRepository,
            PullRequestRepository pullRequestRepository,
            GitHubApiClient gitHubApiClient, PrLinkingService prLinkingService, ReviewRepository reviewRepository, ReviewService reviewService) {

        this.integrationRepository = integrationRepository;
        this.pullRequestRepository = pullRequestRepository;
        this.gitHubApiClient = gitHubApiClient;
        this.prLinkingService = prLinkingService;
        this.reviewRepository = reviewRepository;
        this.reviewService = reviewService;
    }

    public int syncPullRequests(Long projectId) {

        GithubIntegration integration = integrationRepository
                .findByProjectId(projectId)
                .orElseThrow();

        try {
            String response = gitHubApiClient.getPullRequests(integration);

            JsonNode pullRequests = objectMapper.readTree(response);

            int synced = 0;

            for (JsonNode ghPr : pullRequests) {

                Long ghNumber = ghPr.get("number").asLong();
                String ghId = String.valueOf(ghPr.get("id").asLong());
                String title = ghPr.get("title").asText();
                String state = ghPr.get("state").asText();

                PullRequest pullRequest =
                        pullRequestRepository
                                .findByGhNumberAndProjectId(ghNumber, projectId)
                                .orElseGet(PullRequest::new);

                pullRequest.setGhNumber(ghNumber);
                pullRequest.setGhId(ghId);
                pullRequest.setTitle(title);
                pullRequest.setState(state);
                pullRequest.setRepoFullName(integration.getRepoFullName());
                pullRequest.setPrUrl(ghPr.path("html_url").asText(null));
                pullRequest.setAuthorUsername(ghPr.path("user").path("login").asText(null));
                pullRequest.setBranchName(ghPr.path("head").path("ref").asText(null));
                pullRequest.setBaseBranch(ghPr.path("base").path("ref").asText(null));
                pullRequest.setBody(ghPr.path("body").isNull() ? null : ghPr.path("body").asText());
                pullRequest.setCreatedAt(parseInstant(ghPr.path("created_at").asText(null)));
                pullRequest.setUpdatedAt(parseInstant(ghPr.path("updated_at").asText(null)));
                pullRequest.setMergedAt(parseInstant(ghPr.path("merged_at").asText(null)));
                pullRequest.setAdditions(ghPr.path("additions").isNumber() ? ghPr.path("additions").asInt() : null);
                pullRequest.setDeletions(ghPr.path("deletions").isNumber() ? ghPr.path("deletions").asInt() : null);
                pullRequest.setChangedFiles(ghPr.path("changed_files").isNumber() ? ghPr.path("changed_files").asInt() : null);
                if (ghPr.path("merged_at").isTextual()) {
                    pullRequest.setStatus(com.prodhive_core.entity.PrStatus.MERGED);
                } else if ("closed".equalsIgnoreCase(state)) {
                    pullRequest.setStatus(com.prodhive_core.entity.PrStatus.CLOSED);
                } else {
                    pullRequest.setStatus(com.prodhive_core.entity.PrStatus.OPEN);
                }

                if (pullRequest.getStatus() == null) {
                    pullRequest.setStatus(
                            com.prodhive_core.entity.PrStatus.OPEN
                    );
                }

                pullRequest.setProject(integration.getProject());

                Issue issue = prLinkingService.resolveIssueForPr(pullRequest);

                if (issue != null) {
                    prLinkingService.linkToIssue(pullRequest, issue);
                }

                pullRequestRepository.save(pullRequest);
                syncReviews(integration, pullRequest);

                synced++;
            }

            integration.setLastSyncedAt(java.time.Instant.now());
            integrationRepository.save(integration);

            return synced;

        } catch (Exception e) {
            throw new RuntimeException(
                    "Failed to sync GitHub pull requests", e
            );
        }
    }

    private void syncReviews(GithubIntegration integration, PullRequest pullRequest) {
        try {
            JsonNode reviews = objectMapper.readTree(gitHubApiClient.getPullRequestReviews(integration, pullRequest.getGhNumber()));
            for (JsonNode ghReview : reviews) {
                String githubReviewId = ghReview.path("id").asText(null);
                if (githubReviewId == null || reviewRepository.findByGithubReviewId(githubReviewId).isPresent()) continue;
                String stateValue = ghReview.path("state").asText("PENDING").toUpperCase();
                ReviewState state;
                try { state = ReviewState.valueOf(stateValue); } catch (IllegalArgumentException e) { state = ReviewState.PENDING; }
                Long reviewerId = ghReview.path("user").path("id").isNumber() ? ghReview.path("user").path("id").asLong() : 0L;
                String reviewerUsername = ghReview.path("user").path("login").asText(null);
                String body = ghReview.path("body").asText("");
                reviewService.submit(pullRequest.getId(), reviewerId, reviewerUsername, githubReviewId, state, body);
            }
        } catch (Exception ignored) {
            // PR sync should not fail if the token cannot read review details.
        }
    }

    private java.time.Instant parseInstant(String value) {
        if (value == null || value.isBlank() || "null".equalsIgnoreCase(value)) return null;
        try { return java.time.Instant.parse(value); } catch (Exception ignored) { return null; }
    }
}