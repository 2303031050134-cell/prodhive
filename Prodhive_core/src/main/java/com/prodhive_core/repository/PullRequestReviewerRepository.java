package com.prodhive_core.repository;

import com.prodhive_core.entity.PullRequestReviewer;
import com.prodhive_core.entity.ReviewerStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PullRequestReviewerRepository extends JpaRepository<PullRequestReviewer, Long> {
    List<PullRequestReviewer> findByPullRequestId(Long pullRequestId);
    Optional<PullRequestReviewer> findByPullRequestIdAndGithubUsernameIgnoreCase(Long pullRequestId, String githubUsername);
    List<PullRequestReviewer> findByUserIdAndStatus(Long userId, ReviewerStatus status);
    List<PullRequestReviewer> findByPullRequestIdAndStatus(Long pullRequestId, ReviewerStatus status);
}
