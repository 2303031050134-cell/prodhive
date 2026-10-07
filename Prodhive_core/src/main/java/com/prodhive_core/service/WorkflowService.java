package com.prodhive_core.service;

import com.prodhive_core.entity.IssueStatus;
import com.prodhive_core.entity.WorkflowTransition;
import com.prodhive_core.exception.InvalidTransitionException;
import com.prodhive_core.repository.WorkflowRepository;
import org.springframework.stereotype.Service;

import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class WorkflowService {

    private final WorkflowRepository workflowRepository;

    public WorkflowService(WorkflowRepository workflowRepository) {
        this.workflowRepository = workflowRepository;
    }

    private static final Map<IssueStatus, Set<IssueStatus>> DEFAULT_ALLOWED_TRANSITIONS = Map.of(
            IssueStatus.BACKLOG,
            EnumSet.of(IssueStatus.TODO),
            IssueStatus.TODO,
            EnumSet.of(IssueStatus.IN_PROGRESS, IssueStatus.BACKLOG),
            IssueStatus.IN_PROGRESS,     EnumSet.of(IssueStatus.IN_REVIEW, IssueStatus.TODO),
            IssueStatus.IN_REVIEW,       EnumSet.of(IssueStatus.DONE, IssueStatus.IN_PROGRESS),
            IssueStatus.DONE,            EnumSet.of(IssueStatus.REOPENED),
            IssueStatus.REOPENED,        EnumSet.of(IssueStatus.TODO, IssueStatus.IN_PROGRESS)
            );

    public void validateTransition(IssueStatus from, IssueStatus to) {
        if (from == to) return;
        Set<IssueStatus> allowed = DEFAULT_ALLOWED_TRANSITIONS.getOrDefault(from, Set.of());
        if (!allowed.contains(to)) {
            throw new InvalidTransitionException("Cannot move issue from " + from + " to " + to);
        }
    }

    /**
     * Validates a transition, honouring any project-specific workflow overrides.
     * If a workflow is configured for the project, the allowed "to" set is built
     * from the stored transitions; otherwise the default workflow applies.
     */
    public void validateTransition(Long projectId, IssueStatus from, IssueStatus to) {
        if (from == to) return;
        List<WorkflowTransition> overrides = workflowRepository.findByProjectIdAndFromStatus(projectId, from);
        if (!overrides.isEmpty()) {
            boolean allowed = overrides.stream().anyMatch(t -> t.getToStatus() == to);
            if (!allowed) {
                throw new InvalidTransitionException("Cannot move issue from " + from + " to " + to + " in this project's workflow");
            }
            return;
        }
        validateTransition(from, to);
    }
}