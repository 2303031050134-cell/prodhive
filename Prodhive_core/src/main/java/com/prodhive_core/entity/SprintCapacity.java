package com.prodhive_core.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Records a sprint's planning capacity and committed work so the team can
 * judge whether a sprint is over-committed and plan accordingly.
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SprintCapacity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "sprint_id", nullable = false)
    private Sprint sprint;

    @Column(nullable = false)
    private double capacity;        // planned capacity (story points / hours)

    @Column(nullable = false)
    private double committed;       // total committed effort in the sprint

    public boolean isOverCommitted() {
        return committed > capacity;
    }
}