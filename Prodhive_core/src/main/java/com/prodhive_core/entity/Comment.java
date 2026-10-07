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
@AllArgsConstructor
@NoArgsConstructor
public class Comment {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @Column(nullable = false, length = 2000)
    private String body;


    @Column(nullable = false)
    private Long authorId; // userId


    @ManyToOne @JoinColumn(name = "issue_id", nullable = false)
    private Issue issue;


    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

}