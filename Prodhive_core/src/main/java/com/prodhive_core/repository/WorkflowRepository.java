package com.prodhive_core.repository;

import com.prodhive_core.entity.IssueStatus;
import com.prodhive_core.entity.WorkflowTransition;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WorkflowRepository extends JpaRepository<WorkflowTransition, Long> {

    List<WorkflowTransition> findByProjectId(Long projectId);

    List<WorkflowTransition> findByProjectIdAndFromStatus(Long projectId, IssueStatus fromStatus);

    Optional<WorkflowTransition> findByProjectIdAndFromStatusAndToStatus(Long projectId, IssueStatus fromStatus, IssueStatus toStatus);

    void deleteByProjectIdAndFromStatusAndToStatus(Long projectId, IssueStatus fromStatus, IssueStatus toStatus);
}