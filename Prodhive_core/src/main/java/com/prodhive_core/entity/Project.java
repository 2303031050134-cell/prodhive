package com.prodhive_core.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Project {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String key; // e.g. "PROJ"

    private String description;

    @Column(nullable = false)
    private Long ownerId; // userId of the PM who created it

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    // Frontend always fetches boards via GET /boards?projectId=, never nested inside a Project payload.
    // Without @JsonIgnore here, serializing a Board (which nests its Project) recurses forever:
    // Board -> project -> boards[] -> Board -> project -> boards[]... until Jackson's depth limit trips.
    @JsonIgnore
    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL)
    private List<Board> boards = new ArrayList<>();

    @Column(nullable = false)
    private Long organizationId;

    @Column(nullable = false)
    private boolean archived=false;
}