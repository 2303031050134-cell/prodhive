package com.prodhive_core.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long recipientUserId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;    //	MENTIONED,	ASSIGNED,	STATUS_CHANGED,	PR_LINKED,	REVIEW_REQUESTED

    @Column(nullable = false, length = 500)
    private String message;

    @Column(nullable = false)
    private String entityType;    //	"ISSUE",	"COMMENT",	"PULL_REQUEST"

    @Column(nullable = false)
    private Long entityId;

    @Column(nullable = false)
    private boolean read = false;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

}