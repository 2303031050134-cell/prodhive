package com.prodhive_core.repository;

import com.prodhive_core.entity.GithubInstallation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface GithubInstallationRepository extends JpaRepository<GithubInstallation, Long> {
    Optional<GithubInstallation> findByInstallationId(Long installationId);
}
