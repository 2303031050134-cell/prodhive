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
public class Attachment{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "issue_id",nullable = false)
    private Issue issue;

    @Column(nullable=false)
    private	String	fileName;

    @Column(nullable=false)
    private	String	fileUrl;			//	path/URL	to	fetch	it

    @Column(nullable=false)
    private	Long uploadedBy;

    @Column(nullable = false, updatable = false)
    private Instant uploadedAt = Instant.now();
}
