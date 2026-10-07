package com.prodhive_core.service;

import com.prodhive_core.entity.Notification;
import com.prodhive_core.entity.NotificationType;
import com.prodhive_core.repository.NotificationRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    private	final NotificationRepository notificationRepository;
    private	final SimpMessagingTemplate messagingTemplate;

    public NotificationService(NotificationRepository notificationRepository, SimpMessagingTemplate	messagingTemplate) {
        this.notificationRepository	= notificationRepository;
        this.messagingTemplate = messagingTemplate;
    }


    public void	notify(Long	recipientUserId, NotificationType type, String message, String entityType, Long	entityId) {
        if (recipientUserId	==	null)	return;	//	e.g.	unassigned	issue
        Notification n = new Notification();
        n.setRecipientUserId(recipientUserId);
        n.setType(type);
        n.setMessage(message);
        n.setEntityType(entityType);
        n.setEntityId(entityId);
        Notification saved = notificationRepository.save(n);
        //	real-time	push	to	a	per-user	topic
        messagingTemplate.convertAndSend("/topic/user/"	+	recipientUserId	+	"/notifications",	saved);
    }

    public List<Notification> myNotifications(Long	userId)	{
        return	notificationRepository.findByRecipientUserIdOrderByCreatedAtDesc(userId);
    }

    public void markRead(Long notificationId) {
        Notification n = notificationRepository.findById(notificationId).orElseThrow();
        n.setRead(true);
        notificationRepository.save(n);
    }

    public void	markAllRead(Long userId) {
        notificationRepository.findByRecipientUserIdAndReadFalse(userId)
                .forEach(n -> { n.setRead(true);	notificationRepository.save(n);	});
    }
}