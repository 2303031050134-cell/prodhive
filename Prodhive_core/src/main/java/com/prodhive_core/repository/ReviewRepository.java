package com.prodhive_core.repository;

import com.prodhive_core.entity.Review;
import com.prodhive_core.entity.ReviewState;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByPullRequestIdOrderBySubmittedAtAsc(Long pullRequestId);
    List<Review> findByReviewerUserId(Long reviewerUserId);
    java.util.Optional<Review> findByGithubReviewId(String githubReviewId);
    long countByPullRequestIdAndState(Long pullRequestId, ReviewState state);
}