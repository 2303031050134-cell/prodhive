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
public	class	IssueStatusHistory	{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private	Long id;

    @ManyToOne
    @JoinColumn(name = "issue_id", nullable = false)
    private	Issue issue;

    @Enumerated(EnumType.STRING)
    private	IssueStatus	fromStatus;

    @Enumerated(EnumType.STRING)
    private	IssueStatus	toStatus;

    @Column(nullable = false)
    private	Long changedBy;

    @Column(nullable = false, updatable = false)
    private Instant changedAt = Instant.now();
}