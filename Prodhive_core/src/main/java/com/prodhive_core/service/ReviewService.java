package com.prodhive_core.service;

import com.prodhive_core.entity.PullRequest;
import com.prodhive_core.entity.Review;
import com.prodhive_core.entity.ReviewState;
import com.prodhive_core.entity.ReviewerStatus;
import com.prodhive_core.repository.PullRequestRepository;
import com.prodhive_core.repository.ReviewRepository;
import com.prodhive_core.service.ActivityLogService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final PullRequestRepository pullRequestRepository;
    private final ActivityLogService activityLogService;
    private final IssueService issueService;
    private final PullRequestReviewerService pullRequestReviewerService;

    public ReviewService(ReviewRepository reviewRepository, PullRequestRepository pullRequestRepository,
                         ActivityLogService activityLogService, IssueService issueService,
                         PullRequestReviewerService pullRequestReviewerService) {
        this.reviewRepository = reviewRepository;
        this.pullRequestRepository = pullRequestRepository;
        this.activityLogService = activityLogService;
        this.issueService = issueService;
        this.pullRequestReviewerService = pullRequestReviewerService;
    }

    public Review submit(Long pullRequestId, Long reviewerUserId, ReviewState state, String comment) {
        return submit(pullRequestId, reviewerUserId, null, state, comment);
    }

    public Review submit(Long pullRequestId, Long reviewerUserId, String reviewerUsername, ReviewState state, String comment) {
        return submit(pullRequestId, reviewerUserId, reviewerUsername, null, state, comment);
    }

    public Review submit(Long pullRequestId, Long reviewerUserId, String reviewerUsername, String githubReviewId, ReviewState state, String comment) {
        PullRequest pr = pullRequestRepository.findById(pullRequestId).orElseThrow();
        if (githubReviewId != null) {
            var existing = reviewRepository.findByGithubReviewId(githubReviewId);
            if (existing.isPresent()) return existing.get();
        }
        Review review = new Review();
        review.setPullRequest(pr);
        review.setReviewerUserId(reviewerUserId);
        review.setReviewerUsername(reviewerUsername);
        review.setGithubReviewId(githubReviewId);
        review.setState(state);
        review.setComment(comment);
        review.setBody(comment);
        review.setSubmittedAt(java.time.Instant.now());
        Review saved = reviewRepository.save(review);

        ReviewerStatus reviewerStatus = switch (state) {
            case APPROVED -> ReviewerStatus.APPROVED;
            case CHANGES_REQUESTED -> ReviewerStatus.CHANGES_REQUESTED;
            default -> ReviewerStatus.COMMENTED;
        };
        pullRequestReviewerService.updateStatusByUserId(pullRequestId, reviewerUserId, reviewerStatus);
        pullRequestReviewerService.updateStatusByLogin(pullRequestId, reviewerUsername, reviewerStatus);

        if (pr.getIssue() != null) {
            String action = switch (state) {
                case APPROVED -> "REVIEW_APPROVED";
                case CHANGES_REQUESTED -> "CHANGES_REQUESTED";
                default -> "REVIEW_SUBMITTED";
            };
            String detail = comment == null || comment.isBlank() ? state.name().replace('_', ' ') : comment;
            activityLogService.log(pr.getProject().getId(), "ISSUE", pr.getIssue().getId(),
                    action, reviewerUserId, detail);
            if (state == ReviewState.CHANGES_REQUESTED && pr.getIssue().getStatus() == com.prodhive_core.entity.IssueStatus.IN_REVIEW) {
                issueService.updateStatus(pr.getIssue().getId(), "IN_PROGRESS", reviewerUserId);
            }
        }
        return saved;
    }

    public List<Review> listForPullRequest(Long pullRequestId) {
        return reviewRepository.findByPullRequestIdOrderBySubmittedAtAsc(pullRequestId);
    }

    public ReviewSummary summary(Long pullRequestId) {
        return new ReviewSummary(
                reviewRepository.countByPullRequestIdAndState(pullRequestId, ReviewState.APPROVED),
                reviewRepository.countByPullRequestIdAndState(pullRequestId, ReviewState.CHANGES_REQUESTED),
                reviewRepository.countByPullRequestIdAndState(pullRequestId, ReviewState.PENDING)
        );
    }

    public record ReviewSummary(long approved, long changesRequested, long pending) {}
}