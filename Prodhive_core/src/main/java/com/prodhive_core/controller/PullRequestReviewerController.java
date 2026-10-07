package com.prodhive_core.controller;

import com.prodhive_core.entity.PullRequestReviewer;
import com.prodhive_core.security.CurrentUser;
import com.prodhive_core.service.PullRequestReviewerService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/core/pull-requests/{prId}/reviewers")
public class PullRequestReviewerController {

    private final PullRequestReviewerService reviewerService;
    private final CurrentUser currentUser;

    public PullRequestReviewerController(PullRequestReviewerService reviewerService, CurrentUser currentUser) {
        this.reviewerService = reviewerService;
        this.currentUser = currentUser;
    }

    @GetMapping
    public ResponseEntity<List<PullRequestReviewer>> list(@PathVariable Long prId) {
        return ResponseEntity.ok(reviewerService.listForPullRequest(prId));
    }

    @PostMapping
    public ResponseEntity<?> request(@PathVariable Long prId, @RequestBody RequestReviewerRequest req, HttpServletRequest http) {
        Long requestedBy = currentUser.getUserId(http);
        var result = reviewerService.requestReviewer(prId, req.userId(), req.githubUsername(), requestedBy);
        return ResponseEntity.ok(Map.of(
                "reviewer", result.reviewer(),
                "githubSynced", result.githubSynced(),
                "githubError", result.githubError() == null ? "" : result.githubError()
        ));
    }

    @DeleteMapping("/{reviewerId}")
    public ResponseEntity<Void> remove(@PathVariable Long prId, @PathVariable Long reviewerId) {
        reviewerService.removeReviewer(prId, reviewerId);
        return ResponseEntity.noContent().build();
    }

    public record RequestReviewerRequest(Long userId, String githubUsername) {}
}
