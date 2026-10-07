package com.prodhive_core.controller;

import com.prodhive_core.entity.PullRequest;
import com.prodhive_core.repository.PullRequestRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class PullRequestController {

    private final PullRequestRepository pullRequestRepository;

    public PullRequestController(PullRequestRepository pullRequestRepository) {
        this.pullRequestRepository = pullRequestRepository;
    }

    @GetMapping("/api/core/projects/{projectId}/pull-requests")
    public ResponseEntity<List<PullRequest>> list(@PathVariable Long projectId) {
        return ResponseEntity.ok(pullRequestRepository.findByProjectId(projectId));
    }

    @GetMapping("/api/core/projects/{projectId}/pull-requests/pending-review")
    public ResponseEntity<List<PullRequest>> pendingReview(@PathVariable Long projectId) {
        return ResponseEntity.ok(pullRequestRepository.findByProjectIdAndStatus(projectId, com.prodhive_core.entity.PrStatus.OPEN));
    }

    @GetMapping("/api/core/pull-requests/{prId}")
    public ResponseEntity<PullRequest> get(@PathVariable Long prId) {
        return pullRequestRepository.findById(prId).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/api/core/issues/{issueId}/pull-requests")
    public ResponseEntity<List<PullRequest>> byIssue(@PathVariable Long issueId) {
        return ResponseEntity.ok(pullRequestRepository.findByIssueId(issueId));
    }
}