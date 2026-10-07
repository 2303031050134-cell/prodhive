package com.prodhive_core.controller;


import com.prodhive_core.dto.ProjectRequest;
import com.prodhive_core.entity.ActivityLog;
import com.prodhive_core.entity.Project;
import com.prodhive_core.security.CurrentUser;
import com.prodhive_core.service.ActivityLogService;
import com.prodhive_core.service.IssueService;
import com.prodhive_core.service.ProjectService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/api/core/projects")
public class ProjectController {

    private final ProjectService projectService;
    private final CurrentUser currentUser;
    private final ActivityLogService activityLogService;

    public ProjectController(ProjectService projectService, CurrentUser currentUser, ActivityLogService activityLogService) {
        this.projectService = projectService;
        this.currentUser = currentUser;
        this.activityLogService = activityLogService;
    }


    @PostMapping
    public ResponseEntity<Project> create(@RequestBody ProjectRequest req, HttpServletRequest http) {
        Long userId = currentUser.getUserId(http);
        String role = currentUser.getRole(http);
        String orgRole = currentUser.getOrgRole(http);
        Long organizationId = currentUser.getOrganizationId(http);
        if (organizationId == null || !organizationId.equals(req.organizationId())) {
            throw new IllegalArgumentException("Project organization must match your active workspace — try switching to it first");
        }
        return ResponseEntity.ok(projectService.create(req, userId, role, orgRole));
    }


    /** Scoped to the caller's active organization — a member of Org A can never see Org B's projects. */
    @GetMapping
    public ResponseEntity<List<Project>> listAll(HttpServletRequest http) {
        Long organizationId = currentUser.getOrganizationId(http);
        return ResponseEntity.ok(projectService.findForOrganization(organizationId));
    }


    @GetMapping("/{id}")
    public ResponseEntity<Project> getOne(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.findById(id));
    }


    @PatchMapping("/{id}")
    public ResponseEntity<Project> update(@PathVariable Long id, @RequestBody ProjectRequest req) {
        return ResponseEntity.ok(projectService.update(id, req.name(), req.description()));
    }

    @PatchMapping("/{id}/archive")
    public ResponseEntity<Project> archive(@PathVariable Long id) { return ResponseEntity.ok(projectService.archive(id)); }

    @GetMapping("/{id}/activity")
    public	ResponseEntity<List<ActivityLog>>	activity(@PathVariable	Long	id)	{
        return	ResponseEntity.ok(activityLogService.getProjectActivity(id));
    }

    // dto: public record StatusUpdateRequest(String status) {}
}
