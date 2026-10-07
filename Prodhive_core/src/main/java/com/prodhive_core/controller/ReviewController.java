package com.prodhive_core.controller;

import com.prodhive_core.entity.Review;
import com.prodhive_core.entity.ReviewState;
import com.prodhive_core.security.CurrentUser;
import com.prodhive_core.service.ReviewService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/core/pull-requests/{prId}/reviews")
public class ReviewController {

    private final ReviewService reviewService;
    private final CurrentUser currentUser;

    public ReviewController(ReviewService reviewService, CurrentUser currentUser) {
        this.reviewService = reviewService;
        this.currentUser = currentUser;
    }

    @GetMapping
    public ResponseEntity<List<Review>> list(@PathVariable Long prId) {
        return ResponseEntity.ok(reviewService.listForPullRequest(prId));
    }

    @GetMapping("/summary")
    public ResponseEntity<ReviewService.ReviewSummary> summary(@PathVariable Long prId) {
        return ResponseEntity.ok(reviewService.summary(prId));
    }

    @PostMapping
    public ResponseEntity<Review> submit(@PathVariable Long prId,
                                         @RequestBody ReviewRequest req,
                                         HttpServletRequest http) {
        Long userId = currentUser.getUserId(http);
        return ResponseEntity.ok(
            reviewService.submit(prId, userId, ReviewState.valueOf(req.state()), req.comment())
        );
    }

    public record ReviewRequest(String state, String comment) {}
}
