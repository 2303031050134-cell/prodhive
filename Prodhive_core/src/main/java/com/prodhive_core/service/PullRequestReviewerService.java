package com.prodhive_core.service;

import com.prodhive_core.entity.*;
import com.prodhive_core.repository.GitHubIntegrationRepository;
import com.prodhive_core.repository.PullRequestRepository;
import com.prodhive_core.repository.PullRequestReviewerRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class PullRequestReviewerService {

    private final PullRequestReviewerRepository reviewerRepository;
    private final PullRequestRepository pullRequestRepository;
    private final GitHubIntegrationRepository integrationRepository;
    private final GitHubApiClient gitHubApiClient;
    private final ActivityLogService activityLogService;

    public PullRequestReviewerService(PullRequestReviewerRepository reviewerRepository,
                                       PullRequestRepository pullRequestRepository,
                                       GitHubIntegrationRepository integrationRepository,
                                       GitHubApiClient gitHubApiClient,
                                       ActivityLogService activityLogService) {
        this.reviewerRepository = reviewerRepository;
        this.pullRequestRepository = pullRequestRepository;
        this.integrationRepository = integrationRepository;
        this.gitHubApiClient = gitHubApiClient;
        this.activityLogService = activityLogService;
    }

    /**
     * Requests a reviewer on a PR. The GitHub-side request (which requires the reviewer to already
     * be a collaborator on the repo, and a token with write access) is attempted but is not allowed
     * to block the in-app workflow — if it fails (missing permissions, reviewer not a collaborator,
     * legacy PAT with read-only scope, etc.) we still record the request locally so the team can keep
     * working, and surface the GitHub-side outcome back to the caller for an honest UI message.
     */
    public RequestResult requestReviewer(Long pullRequestId, Long userId, String githubUsername, Long requestedByUserId) {
        PullRequest pr = pullRequestRepository.findById(pullRequestId).orElseThrow();

        PullRequestReviewer reviewer = reviewerRepository
                .findByPullRequestIdAndGithubUsernameIgnoreCase(pullRequestId, githubUsername)
                .orElseGet(PullRequestReviewer::new);
        reviewer.setPullRequest(pr);
        reviewer.setUserId(userId);
        reviewer.setGithubUsername(githubUsername);
        if (reviewer.getId() == null) {
            reviewer.setStatus(ReviewerStatus.REQUESTED);
            reviewer.setRequestedBy(requestedByUserId);
            reviewer.setRequestedAt(Instant.now());
        }
        PullRequestReviewer saved = reviewerRepository.save(reviewer);

        boolean githubRequestSucceeded = false;
        String githubError = null;
        try {
            var integration = integrationRepository.findByProjectId(pr.getProject().getId()).orElse(null);
            if (integration != null) {
                gitHubApiClient.requestReviewers(integration, pr.getGhNumber(), List.of(githubUsername));
                githubRequestSucceeded = true;
            } else {
                githubError = "No GitHub integration connected for this project";
            }
        } catch (Exception e) {
            githubError = e.getMessage();
        }

        if (pr.getIssue() != null) {
            activityLogService.log(pr.getProject().getId(), "ISSUE", pr.getIssue().getId(),
                    "REVIEW_REQUESTED", requestedByUserId,
                    "Requested " + githubUsername + " to review PR #" + pr.getGhNumber()
                            + (githubRequestSucceeded ? "" : " (not synced to GitHub)"));
        }

        return new RequestResult(saved, githubRequestSucceeded, githubError);
    }

    public List<PullRequestReviewer> listForPullRequest(Long pullRequestId) {
        return reviewerRepository.findByPullRequestId(pullRequestId);
    }

    public void removeReviewer(Long pullRequestId, Long reviewerId) {
        reviewerRepository.findById(reviewerId)
                .filter(r -> r.getPullRequest().getId().equals(pullRequestId))
                .ifPresent(reviewerRepository::delete);
    }

    /** Called from the in-app review submission flow — updates the matching requested-reviewer row, if any. */
    public void updateStatusByUserId(Long pullRequestId, Long userId, ReviewerStatus status) {
        reviewerRepository.findByPullRequestId(pullRequestId).stream()
                .filter(r -> userId.equals(r.getUserId()))
                .findFirst()
                .ifPresent(r -> {
                    r.setStatus(status);
                    r.setRespondedAt(Instant.now());
                    reviewerRepository.save(r);
                });
    }

    /**
     * Called from webhook-sourced reviews — matches by GitHub login since that's all a webhook payload
     * gives us. Creates an implicit "reviewer" row if this person was never formally requested through
     * ProdHive (e.g. they were added as a reviewer directly on GitHub), so the reviewer list still
     * reflects reality.
     */
    public void updateStatusByLogin(Long pullRequestId, String githubUsername, ReviewerStatus status) {
        if (githubUsername == null || githubUsername.isBlank()) return;
        PullRequestReviewer reviewer = reviewerRepository
                .findByPullRequestIdAndGithubUsernameIgnoreCase(pullRequestId, githubUsername)
                .orElseGet(() -> {
                    PullRequestReviewer r = new PullRequestReviewer();
                    r.setPullRequest(pullRequestRepository.findById(pullRequestId).orElseThrow());
                    r.setGithubUsername(githubUsername);
                    r.setStatus(ReviewerStatus.REQUESTED);
                    return r;
                });
        reviewer.setStatus(status);
        reviewer.setRespondedAt(Instant.now());
        reviewerRepository.save(reviewer);
    }

    public record RequestResult(PullRequestReviewer reviewer, boolean githubSynced, String githubError) {}
}
