package com.prodhive_core.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.Instant;
import java.util.*;
@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Issue {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String issueKey;

    @Column(nullable = false)
    private String title;


    @Column(length = 4000)
    private String description;


    @Enumerated(EnumType.STRING)
    private IssueType type = IssueType.TASK;


    @Enumerated(EnumType.STRING)
    private IssueStatus status = IssueStatus.TODO;


    @Enumerated(EnumType.STRING)
    private IssuePriority priority = IssuePriority.MEDIUM;


    @ManyToOne @JoinColumn(name = "board_id", nullable = false)
    private Board board;


    @ManyToOne @JoinColumn(name = "sprint_id")
    private Sprint sprint; // nullable — issue may be in the backlog

    private Long assigneeId; // userId, nullable

    @Column(nullable = false)
    private Long reporterId; // userId, from X-User-Id

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    private Instant updatedAt = Instant.now();

    // Frontend fetches comments via GET /issues/{id}/comments, never nested inside an Issue payload.
    // Same cycle risk as Project.boards above: Comment -> issue -> comments[] -> Comment -> issue -> ...
    @JsonIgnore
    @OneToMany(mappedBy = "issue", cascade = CascadeType.ALL)
    private List<Comment> comments = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name="parent_issue_id")
    private	Issue parentIssue;	//	null	for	top-level	issues

    @ManyToMany
    @JoinTable(name="issue_labels",
            joinColumns=@JoinColumn(name="issue_id"),
            inverseJoinColumns=@JoinColumn(name="label_id"))
    private	Set<Label> labels =	new	HashSet<>();

    @Column(nullable = false)
    private Double rank = 0.0;
}