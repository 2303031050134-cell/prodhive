package com.prodhive_core.entity;

import	jakarta.persistence.*;
import	lombok.*;

import java.time.Instant;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(uniqueConstraints = @UniqueConstraint(columnNames = {"project_id", "user_id"}))
public	class ProjectMember	{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private	Long id;

    @ManyToOne
    @JoinColumn(name = "project_id", nullable =	false)
    private	Project	project;

    @Column(nullable = false)
    private	Long userId;
    //	references	User.id	in	Prodhive_auth
    @Enumerated(EnumType.STRING)
    @Column(nullable =	false)
    private	ProjectRole	role =	ProjectRole.MEMBER;	//	PM,	MEMBER

    @Column(nullable = false,updatable = false)
    private Instant joinedAt = Instant.now();
}