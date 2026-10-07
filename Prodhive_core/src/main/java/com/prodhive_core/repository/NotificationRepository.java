package com.prodhive_core.repository;

import com.prodhive_core.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository	extends JpaRepository<Notification,	Long> {
    List<Notification> findByRecipientUserIdOrderByCreatedAtDesc(Long userId);
    List<Notification>	findByRecipientUserIdAndReadFalse(Long userId);
}
