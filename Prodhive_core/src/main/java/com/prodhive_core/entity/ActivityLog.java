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
public	class	ActivityLog	{
    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    private	Long id;

    @Column(nullable=false)
    private	Long	projectId;

    @Column(nullable=false)
    private	String	entityType;	//	"ISSUE",	"SPRINT",	"BOARD",	"PROJECT"

    @Column(nullable=false)
    private	Long	entityId;

    @Column(nullable=false)
    private	String	action;//	"CREATED",	"STATUS_CHANGED",	"COMMENTED",	etc.

    @Column(nullable=false)
    private	Long	actorId;

    @Column(length=1000)
    private	String	detail;	//	free-text,	e.g.	"TODO	->	IN_PROGRESS"

    @Column(nullable=false,	updatable=false)
    private Instant createdAt=Instant.now();
}
