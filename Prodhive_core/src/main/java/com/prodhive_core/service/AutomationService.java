package com.prodhive_core.service;

import com.prodhive_core.entity.*;
import com.prodhive_core.repository.*;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class AutomationService {
    private final AutomationRuleRepository ruleRepository;
    private final ProjectRepository projectRepository;
    private final IssueRepository issueRepository;
    private final IssueStatusHistoryRepository historyRepository;
    private final NotificationService notificationService;
    private final ActivityLogService activityLogService;
    private final SimpMessagingTemplate messagingTemplate;

    public AutomationService(AutomationRuleRepository ruleRepository, ProjectRepository projectRepository,
                             IssueRepository issueRepository, IssueStatusHistoryRepository historyRepository,
                             NotificationService notificationService, ActivityLogService activityLogService,
                             SimpMessagingTemplate messagingTemplate) {
        this.ruleRepository = ruleRepository;
        this.projectRepository = projectRepository;
        this.issueRepository = issueRepository;
        this.historyRepository = historyRepository;
        this.notificationService = notificationService;
        this.activityLogService = activityLogService;
        this.messagingTemplate = messagingTemplate;
    }

    public List<AutomationRule> list(Long projectId) {
        return ruleRepository.findByProjectIdOrderByCreatedAtAsc(projectId);
    }

    @Transactional
    public AutomationRule create(Long projectId, String name, AutomationTrigger trigger, AutomationAction action) {
        validateRule(trigger, action);
        Project project = projectRepository.findById(projectId).orElseThrow(() -> new IllegalArgumentException("Project not found"));
        AutomationRule rule = new AutomationRule();
        rule.setProject(project);
        rule.setName(name == null || name.isBlank() ? trigger.name() + " → " + action.name() : name.trim());
        rule.setTrigger(trigger);
        rule.setAction(action);
        rule.setEnabled(true);
        return ruleRepository.save(rule);
    }

    @Transactional
    public AutomationRule update(Long id, String name, AutomationTrigger trigger, AutomationAction action, boolean enabled) {
        validateRule(trigger, action);
        AutomationRule rule = ruleRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Automation rule not found"));
        rule.setName(name == null || name.isBlank() ? rule.getName() : name.trim());
        rule.setTrigger(trigger);
        rule.setAction(action);
        rule.setEnabled(enabled);
        rule.setUpdatedAt(Instant.now());
        return ruleRepository.save(rule);
    }

    public void delete(Long id) {
        ruleRepository.deleteById(id);
    }

    @EventListener
    @Transactional
    public void onActivity(ActivityCreatedEvent event) {
        ActivityLog activity = event.activity();
        AutomationTrigger trigger = triggerFor(activity.getAction());
        if (trigger == null) return;

        for (AutomationRule rule : ruleRepository.findByProjectIdAndEnabledTrue(activity.getProjectId())) {
            if (rule.getTrigger() != trigger) continue;
            execute(rule.getAction(), activity);
        }
    }

    private AutomationTrigger triggerFor(String action) {
        return switch (action) {
            case "PR_OPENED" -> AutomationTrigger.PR_OPENED;
            case "REVIEW_APPROVED" -> AutomationTrigger.REVIEW_APPROVED;
            case "CHANGES_REQUESTED" -> AutomationTrigger.CHANGES_REQUESTED;
            case "PR_MERGED" -> AutomationTrigger.PR_MERGED;
            case "CREATED" -> AutomationTrigger.ISSUE_CREATED;
            case "ASSIGNED" -> AutomationTrigger.ISSUE_ASSIGNED;
            default -> null;
        };
    }

    private void execute(AutomationAction action, ActivityLog activity) {
        if (!"ISSUE".equalsIgnoreCase(activity.getEntityType())) return;
        Issue issue = issueRepository.findById(activity.getEntityId()).orElse(null);
        if (issue == null) return;

        switch (action) {
            case MOVE_ISSUE_TO_IN_REVIEW -> move(issue, IssueStatus.IN_REVIEW, activity.getActorId(), "Automation: PR opened");
            case MOVE_ISSUE_TO_IN_PROGRESS -> move(issue, IssueStatus.IN_PROGRESS, activity.getActorId(), "Automation: changes requested");
            case MOVE_ISSUE_TO_DONE -> move(issue, IssueStatus.DONE, activity.getActorId(), "Automation: PR merged");
            case NOTIFY_ASSIGNEE -> notificationService.notify(issue.getAssigneeId(), NotificationType.STATUS_CHANGED,
                    "Automation triggered by " + activity.getAction().toLowerCase().replace('_', ' ') + " on " + issue.getIssueKey(),
                    "ISSUE", issue.getId());
        }
    }

    private void move(Issue issue, IssueStatus target, Long actorId, String detail) {
        if (issue.getStatus() == target) return;
        IssueStatus old = issue.getStatus();
        issue.setStatus(target);
        issue.setUpdatedAt(Instant.now());
        issueRepository.save(issue);

        IssueStatusHistory history = new IssueStatusHistory();
        history.setIssue(issue);
        history.setFromStatus(old);
        history.setToStatus(target);
        history.setChangedBy(actorId == null ? 0L : actorId);
        historyRepository.save(history);

        messagingTemplate.convertAndSend("/topic/board/" + issue.getBoard().getId(), issue);
        activityLogService.log(issue.getBoard().getProject().getId(), "ISSUE", issue.getId(),
                "STATUS_CHANGED", actorId == null ? 0L : actorId, old + " → " + target + " (" + detail + ")");
    }

    private void validateRule(AutomationTrigger trigger, AutomationAction action) {
        if (trigger == null || action == null) throw new IllegalArgumentException("Trigger and action are required");
        if (trigger == AutomationTrigger.PR_OPENED && action == AutomationAction.MOVE_ISSUE_TO_IN_PROGRESS)
            throw new IllegalArgumentException("PR_OPENED cannot move an issue back to IN_PROGRESS");
        if (trigger == AutomationTrigger.PR_MERGED && action == AutomationAction.MOVE_ISSUE_TO_IN_REVIEW)
            throw new IllegalArgumentException("PR_MERGED cannot move an issue to IN_REVIEW");
    }
}
