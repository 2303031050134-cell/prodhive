package com.prodhive_core.service;

import com.prodhive_core.entity.PullRequest;
import com.prodhive_core.entity.ReviewState;
import com.prodhive_core.entity.ReviewerStatus;
import com.prodhive_core.entity.WebhookDelivery;
import com.prodhive_core.repository.GitHubIntegrationRepository;
import com.prodhive_core.repository.IssueStatusHistoryRepository;
import com.prodhive_core.entity.IssueStatus;
import com.prodhive_core.entity.PrStatus;
import com.prodhive_core.service.ActivityLogService;
import com.prodhive_core.repository.WebhookDeliveryRepository;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import tools.jackson.databind.JsonNode;

@Service
public class GitHubWebhookProcessingService {

    private final PrLinkingService prLinkingService;
    private final ReviewService reviewService;
    private final WebhookDeliveryRepository deliveryRepository;
    private final GitHubIntegrationRepository integrationRepository;
    private final IssueStatusHistoryRepository issueStatusHistoryRepository;
    private final ActivityLogService activityLogService;
    private final GitHubAppService gitHubAppService;
    private final com.prodhive_core.repository.GithubInstallationRepository installationRepository;
    private final PullRequestReviewerService pullRequestReviewerService;

    public GitHubWebhookProcessingService(
            PrLinkingService prLinkingService,
            ReviewService reviewService,
            WebhookDeliveryRepository deliveryRepository,
            GitHubIntegrationRepository integrationRepository,
            IssueStatusHistoryRepository issueStatusHistoryRepository,
            ActivityLogService activityLogService, GitHubAppService gitHubAppService,
            com.prodhive_core.repository.GithubInstallationRepository installationRepository,
            PullRequestReviewerService pullRequestReviewerService) {

        this.prLinkingService = prLinkingService;
        this.reviewService = reviewService;
        this.deliveryRepository = deliveryRepository;
        this.integrationRepository = integrationRepository;
        this.issueStatusHistoryRepository = issueStatusHistoryRepository;
        this.activityLogService = activityLogService;
        this.gitHubAppService = gitHubAppService;
        this.installationRepository = installationRepository;
        this.pullRequestReviewerService = pullRequestReviewerService;
    }

    @Async
    public void processAsync(Long deliveryDbId, String eventType, JsonNode payload) {

        WebhookDelivery delivery =
                deliveryRepository.findById(deliveryDbId).orElseThrow();

        try {
            switch (eventType) {
                case "pull_request" -> handlePullRequest(payload);
                case "pull_request_review" -> handleReview(payload);
                case "installation", "installation_repositories" -> handleInstallation(payload);
                default -> {
                    
                }
            }

            delivery.setProcessed(true);

        } catch (Exception e) {

            delivery.setError(e.getMessage());
        }

        deliveryRepository.save(delivery);
    }

    private void handleInstallation(JsonNode payload) {
        long installationId = payload.path("installation").path("id").asLong(payload.path("installation_id").asLong(0));
        if (installationId == 0) return;
        String action = payload.path("action").asText("");
        if ("deleted".equalsIgnoreCase(action)) {
            integrationRepository.findByInstallationId(installationId).forEach(integrationRepository::delete);
            installationRepository.findByInstallationId(installationId).ifPresent(installationRepository::delete);
        } else {
            gitHubAppService.syncInstallation(installationId);
        }
    }

    private PullRequest resolveOrCreatePr(JsonNode payload) {
        JsonNode pr = payload.get("pull_request");
        JsonNode repo = payload.get("repository");
        Long ghNumber = pr.get("number").asLong();
        String ghId = String.valueOf(pr.get("id").asLong());
        String title = pr.get("title").asText();
        String state = pr.get("state").asText();

        Long projectId = integrationRepository.findByRepoFullName(repo.get("full_name").asText())
                .map(i -> i.getProject().getId())
                .orElse(null);

        if (projectId == null) return null;

        PullRequest pullRequest = prLinkingService.findOrCreate(projectId, ghNumber, ghId, title, state);
        String eventAction = payload.path("action").asText("");
        if ("closed".equalsIgnoreCase(eventAction)) {
            pullRequest.setStatus(payload.path("pull_request").path("merged").asBoolean(false) ? PrStatus.MERGED : PrStatus.CLOSED);
        } else if ("opened".equalsIgnoreCase(eventAction) || "reopened".equalsIgnoreCase(eventAction) || "synchronize".equalsIgnoreCase(eventAction)) {
            pullRequest.setStatus(PrStatus.OPEN);
        }
        pullRequest.setRepoFullName(repo.path("full_name").asText(null));
        pullRequest.setPrUrl(pr.path("html_url").asText(null));
        pullRequest.setAuthorUsername(pr.path("user").path("login").asText(null));
        pullRequest.setBranchName(pr.path("head").path("ref").asText(null));
        pullRequest.setBaseBranch(pr.path("base").path("ref").asText(null));
        pullRequest.setBody(pr.path("body").isNull() ? null : pr.path("body").asText());
        pullRequest.setCreatedAt(parseInstant(pr.path("created_at").asText(null)));
        pullRequest.setUpdatedAt(parseInstant(pr.path("updated_at").asText(null)));
        pullRequest.setMergedAt(parseInstant(pr.path("merged_at").asText(null)));
        pullRequest = prLinkingService.save(pullRequest, projectId);

        
        if (pullRequest.getIssue() == null) {
            var issue = prLinkingService.resolveIssueForPr(pullRequest);
            if (issue != null) prLinkingService.linkToIssue(pullRequest, issue);
        }

        if (pullRequest.getIssue() != null) {
            var issue = pullRequest.getIssue();
            String activityAction = switch (eventAction.toLowerCase()) {
                case "opened" -> "PR_OPENED";
                case "closed" -> pullRequest.getStatus() == PrStatus.MERGED ? "PR_MERGED" : "PR_CLOSED";
                default -> "PR_UPDATED";
            };
            activityLogService.log(projectId, "ISSUE", issue.getId(), activityAction,
                    payload.path("sender").path("id").asLong(0),
                    "PR #" + ghNumber + " — " + title);

            IssueStatus target = null;
            String statusDetail = null;
            if ("opened".equalsIgnoreCase(eventAction) && issue.getStatus() != IssueStatus.IN_REVIEW) {
                target = IssueStatus.IN_REVIEW;
                statusDetail = "PR opened";
            } else if ("closed".equalsIgnoreCase(eventAction) && pullRequest.getStatus() == PrStatus.MERGED && issue.getStatus() != IssueStatus.DONE) {
                target = IssueStatus.DONE;
                statusDetail = "PR merged";
            } else if ("closed".equalsIgnoreCase(eventAction) && pullRequest.getStatus() == PrStatus.CLOSED && issue.getStatus() == IssueStatus.IN_REVIEW) {
                target = IssueStatus.REOPENED;
                statusDetail = "PR closed without merge";
            }

            if (target != null) {
                IssueStatus oldStatus = issue.getStatus();
                issue.setStatus(target);
                issue.setUpdatedAt(java.time.Instant.now());
                prLinkingService.saveIssue(issue);
                var history = new com.prodhive_core.entity.IssueStatusHistory();
                history.setIssue(issue);
                history.setFromStatus(oldStatus);
                history.setToStatus(target);
                history.setChangedBy(payload.path("sender").path("id").asLong(0));
                issueStatusHistoryRepository.save(history);
                activityLogService.log(projectId, "ISSUE", issue.getId(), "STATUS_CHANGED",
                        payload.path("sender").path("id").asLong(0), oldStatus + " → " + target + " (" + statusDetail + ")");
            }
        }
        return pullRequest;
    }

    private void handlePullRequest(JsonNode payload) {
        PullRequest pullRequest = resolveOrCreatePr(payload);
        if (pullRequest == null) return;

        String eventAction = payload.path("action").asText("");
        if ("review_requested".equalsIgnoreCase(eventAction)) {
            String login = payload.path("requested_reviewer").path("login").asText(null);
            if (login != null) {
                pullRequestReviewerService.updateStatusByLogin(pullRequest.getId(), login, ReviewerStatus.REQUESTED);
            }
        }
    }

    private void handleReview(JsonNode payload) {
        PullRequest pullRequest = resolveOrCreatePr(payload);
        if (pullRequest == null) return;

        JsonNode review = payload.get("review");
        String stateStr = review.get("state").asText().toUpperCase();
        String body = review.path("body").asText("");

        ReviewState reviewState;
        try {
            reviewState = ReviewState.valueOf(stateStr);
        } catch (IllegalArgumentException e) {
            reviewState = ReviewState.PENDING;
        }

        
        Long reviewerUserId = review.get("user").get("id").asLong();
        reviewService.submit(pullRequest.getId(), reviewerUserId, review.path("user").path("login").asText(null), review.path("id").asText(null), reviewState, body);
    }

    private java.time.Instant parseInstant(String value) {
        if (value == null || value.isBlank() || "null".equalsIgnoreCase(value)) return null;
        try { return java.time.Instant.parse(value); } catch (Exception ignored) { return null; }
    }
}