package com.prodhive_core.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

/**
 * Links a GitHub pull request to a Prodhive project (and optionally an issue).
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PullRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long ghNumber;

    @Column(nullable = false, unique = true)
    private String ghId;        // GitHub PR id

    @Column(nullable = false)
    private String title;

    @Column(length = 5000)
    private String body;

    @Column(length = 500)
    private String repoFullName;

    @Column(length = 1000)
    private String prUrl;

    @Column(length = 255)
    private String authorUsername;

    @Column(length = 255)
    private String branchName;

    @Column(length = 255)
    private String baseBranch;

    @Column(nullable = false)
    private String state;       // raw PR state from GitHub API

    private Integer additions;
    private Integer deletions;
    private Integer changedFiles;

    private Instant createdAt;
    private Instant updatedAt;
    private Instant mergedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PrStatus status = PrStatus.OPEN;

    @ManyToOne
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne
    @JoinColumn(name = "issue_id")
    private Issue issue;        // nullable — PR may not be linked to an issue yet

    @Column(nullable = false, updatable = false)
    private Instant linkedAt = Instant.now();
}