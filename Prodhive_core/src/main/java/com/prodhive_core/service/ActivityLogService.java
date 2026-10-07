package com.prodhive_core.service;

import com.prodhive_core.entity.ActivityLog;
import com.prodhive_core.repository.ActivityLogRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ActivityLogService {

    private final ActivityLogRepository repository;
    private final SimpMessagingTemplate messagingTemplate;
    private final ApplicationEventPublisher eventPublisher;

    public ActivityLogService(ActivityLogRepository repository, SimpMessagingTemplate messagingTemplate, ApplicationEventPublisher eventPublisher) {
        this.repository = repository;
        this.messagingTemplate = messagingTemplate;
        this.eventPublisher = eventPublisher;
    }

    public void log(Long projectId, String entityType, Long entityId, String action, Long actorId, String detail) {
        ActivityLog entry = new ActivityLog();
        entry.setProjectId(projectId);
        entry.setEntityType(entityType);
        entry.setEntityId(entityId);
        entry.setAction(action);
        entry.setActorId(actorId);
        entry.setDetail(detail);
        ActivityLog saved = repository.save(entry);
        messagingTemplate.convertAndSend("/topic/project/" + projectId + "/activity", saved);
        eventPublisher.publishEvent(new ActivityCreatedEvent(saved));
    }

    public List<ActivityLog> getProjectActivity(Long projectId) {
        return repository.findByProjectIdOrderByCreatedAtDesc(projectId);
    }

    public List<ActivityLog> getIssueActivity(Long issueId) {
        return repository.findByEntityTypeAndEntityIdOrderByCreatedAtAsc("ISSUE", issueId);
    }
}
