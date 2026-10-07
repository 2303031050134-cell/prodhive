package com.prodhive_core.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

/**
 * A code review submitted against a pull request by a team member.
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "pull_request_id", nullable = false)
    private PullRequest pullRequest;

    @Column(nullable = false)
    private Long reviewerUserId;

    @Column(length = 255)
    private String reviewerUsername;

    @Column(unique = true)
    private String githubReviewId;

    @Column(length = 2000)
    private String body;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReviewState state = ReviewState.PENDING;

    @Column(length = 2000)
    private String comment;

    @Column(nullable = false, updatable = false)
    private Instant submittedAt = Instant.now();
}