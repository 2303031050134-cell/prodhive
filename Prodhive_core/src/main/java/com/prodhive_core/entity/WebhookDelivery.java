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
public class WebhookDelivery {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String deliveryId;

    @Column(nullable = false)
    private String eventType;

    @Column(nullable = false)
    private Long repositoryId;

    @Column(nullable = false)
    private boolean processed = false;

    @Column(length = 1000)
    private String error;

    @Column(nullable = false, updatable = false)
    private Instant receivedAt = Instant.now();


}