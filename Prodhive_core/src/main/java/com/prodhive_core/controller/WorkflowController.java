package com.prodhive_core.controller;

import com.prodhive_core.entity.IssueStatus;
import com.prodhive_core.entity.Project;
import com.prodhive_core.entity.WorkflowTransition;
import com.prodhive_core.repository.ProjectRepository;
import com.prodhive_core.repository.WorkflowRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/core/projects/{projectId}/workflow")
public class WorkflowController {

    private final WorkflowRepository workflowRepository;
    private final ProjectRepository projectRepository;

    public WorkflowController(WorkflowRepository workflowRepository, ProjectRepository projectRepository) {
        this.workflowRepository = workflowRepository;
        this.projectRepository = projectRepository;
    }

    @GetMapping
    public ResponseEntity<List<WorkflowTransition>> list(@PathVariable Long projectId) {
        return ResponseEntity.ok(workflowRepository.findByProjectId(projectId));
    }

    @PostMapping
    public ResponseEntity<WorkflowTransition> add(@PathVariable Long projectId,
                                                  @RequestBody TransitionRequest req) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found: " + projectId));
        WorkflowTransition transition = new WorkflowTransition();
        transition.setProject(project);
        transition.setFromStatus(IssueStatus.valueOf(req.fromStatus()));
        transition.setToStatus(IssueStatus.valueOf(req.toStatus()));
        return ResponseEntity.ok(workflowRepository.save(transition));
    }

    @DeleteMapping
    public ResponseEntity<Void> remove(@PathVariable Long projectId,
                                       @RequestBody TransitionRequest req) {
        workflowRepository.deleteByProjectIdAndFromStatusAndToStatus(
                projectId, IssueStatus.valueOf(req.fromStatus()), IssueStatus.valueOf(req.toStatus()));
        return ResponseEntity.noContent().build();
    }

    /**
     * Convenience: returns grouped transitions, plus which statuses are allowed
     * from each status. Useful for rendering a workflow editor.
     */
    @GetMapping("/map")
    public ResponseEntity<Map<String, List<String>>> map(@PathVariable Long projectId) {
        Map<String, List<String>> result = new LinkedHashMap<>();
        for (IssueStatus status : IssueStatus.values()) {
            List<String> targets = new ArrayList<>();
            for (WorkflowTransition transition : workflowRepository.findByProjectIdAndFromStatus(projectId, status)) {
                targets.add(transition.getToStatus().name());
            }
            result.put(status.name(), targets);
        }
        return ResponseEntity.ok(result);
    }

    public record TransitionRequest(String fromStatus, String toStatus) {}
}