package com.prodhive_core.repository;

import com.prodhive_core.entity.PullRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PullRequestRepository extends JpaRepository<PullRequest, Long> {
    List<PullRequest> findByProjectId(Long projectId);
    List<PullRequest> findByIssueId(Long issueId);
    Optional<PullRequest> findByGhId(String ghId);
    Optional<PullRequest> findByGhNumberAndProjectId(Long ghNumber, Long projectId);
    List<PullRequest> findByProjectIdAndStatus(Long projectId, com.prodhive_core.entity.PrStatus status);
}