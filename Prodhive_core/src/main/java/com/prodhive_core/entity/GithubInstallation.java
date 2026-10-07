package com.prodhive_core.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@Table(name = "github_installation")
public class GithubInstallation {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Long installationId;

    @Column(nullable = false)
    private Long accountId;

    @Column(nullable = false)
    private String accountLogin;

    @Column(nullable = false)
    private String accountType;

    @Column(nullable = false, updatable = false)
    private Instant installedAt = Instant.now();

    private Instant updatedAt = Instant.now();
}
