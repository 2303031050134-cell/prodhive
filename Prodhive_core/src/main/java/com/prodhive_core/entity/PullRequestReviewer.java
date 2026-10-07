package com.prodhive_core.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

/**
 * A reviewer requested on a pull request. Created either explicitly via ProdHive's
 * "+ Add reviewer" action, or implicitly when a review arrives via webhook from someone
 * who was never formally requested (e.g. they were added directly on GitHub).
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(uniqueConstraints = @UniqueConstraint(columnNames = {"pull_request_id", "github_username"}))
public class PullRequestReviewer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "pull_request_id", nullable = false)
    private PullRequest pullRequest;

    /** Internal ProdHive user id, when the reviewer was requested from within the app. May be null
     *  for a reviewer who only exists on GitHub's side (added directly there, not via ProdHive). */
    private Long userId;

    @Column(name = "github_username", nullable = false)
    private String githubUsername;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReviewerStatus status = ReviewerStatus.REQUESTED;

    private Long requestedBy;

    @Column(nullable = false, updatable = false)
    private Instant requestedAt = Instant.now();

    private Instant respondedAt;
}
