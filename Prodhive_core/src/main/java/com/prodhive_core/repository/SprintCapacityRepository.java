package com.prodhive_core.repository;

import com.prodhive_core.entity.SprintCapacity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SprintCapacityRepository extends JpaRepository<SprintCapacity, Long> {
    Optional<SprintCapacity> findBySprintId(Long sprintId);
}