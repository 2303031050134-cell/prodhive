package com.prodhive_core.repository;

import com.prodhive_core.entity.GithubIntegration;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public	interface	GitHubIntegrationRepository	extends JpaRepository<GithubIntegration,	Long> {
    Optional<GithubIntegration>	findByProjectId(Long	projectId);
    Optional<GithubIntegration> findByRepoFullName(String	repoFullName);
    Optional<GithubIntegration> findByRepoFullNameIgnoreCase(String repoFullName);
    java.util.List<GithubIntegration> findByInstallationId(Long installationId);
}
