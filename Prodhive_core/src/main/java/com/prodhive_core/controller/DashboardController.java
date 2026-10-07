package com.prodhive_core.controller;

import com.prodhive_core.entity.ActivityLog;
import com.prodhive_core.entity.Issue;
import com.prodhive_core.repository.ActivityLogRepository;
import com.prodhive_core.repository.IssueRepository;
import com.prodhive_core.repository.ProjectMemberRepository;
import com.prodhive_core.security.CurrentUser;
import com.prodhive_core.service.NeedsAttentionService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/core/dashboard")
public class DashboardController {

    private final IssueRepository issueRepository;
    private final ActivityLogRepository activityLogRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final CurrentUser currentUser;
    private final NeedsAttentionService needsAttentionService;

    public DashboardController(IssueRepository issueRepository, ActivityLogRepository activityLogRepository,
                               ProjectMemberRepository projectMemberRepository, CurrentUser currentUser,
                               NeedsAttentionService needsAttentionService) {
        this.issueRepository = issueRepository;
        this.activityLogRepository = activityLogRepository;
        this.projectMemberRepository = projectMemberRepository;
        this.currentUser = currentUser;
        this.needsAttentionService = needsAttentionService;
    }

    @GetMapping("/needs-attention")
    public ResponseEntity<List<NeedsAttentionService.AttentionItem>> needsAttention(HttpServletRequest http) {
        return ResponseEntity.ok(needsAttentionService.forUser(currentUser.getUserId(http)));
    }

    @GetMapping("/my-issues")
    public ResponseEntity<List<Issue>> myIssues(HttpServletRequest http) {
        return ResponseEntity.ok(issueRepository.findByAssigneeId(currentUser.getUserId(http)));
    }

    @GetMapping("/recent-activity")
    public ResponseEntity<List<ActivityLog>> recentActivity(HttpServletRequest http) {
        Long userId = currentUser.getUserId(http);
        List<Long> myProjectIds = projectMemberRepository.findProjectIdsByUserId(userId);
        if (myProjectIds == null || myProjectIds.isEmpty()) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(activityLogRepository.findByProjectIdInOrderByCreatedAtDesc(myProjectIds));
    }
}