package com.prodhive_core.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class GithubIntegration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "project_id",nullable = false)
    private Project project;


    @Column(nullable = false)
    private String repoFullName;

    @Column(length = 500)
    private String accessToken;

    /** GitHub App installation that owns this repository connection. */
    private Long installationId;

    @Column(length = 255)
    private String accountLogin;

    @Column(length = 50)
    private String accountType;

    @Column(nullable = false)
    private Long connectedBy;

    @Column(nullable = false,updatable = false)
    private Instant connectedAt = Instant.now();

    private Instant lastSyncedAt;
}
