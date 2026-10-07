package com.prodhive_core.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public	class	IssueLink	{
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private	Long id;

    @ManyToOne
    @JoinColumn(name="source_issue_id",	nullable=false)
    private	Issue sourceIssue;

    @ManyToOne
    @JoinColumn(name="target_issue_id",	nullable=false)
    private	Issue targetIssue;

    @Enumerated(EnumType.STRING)
    @Column(nullable=false)
    private	LinkType linkType;	//	BLOCKS,	RELATES_TO,	DUPLICATES
}