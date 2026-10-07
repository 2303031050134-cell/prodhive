package com.prodhive_core.repository;

import com.prodhive_core.entity.Roadmap;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RoadmapRepository extends JpaRepository<Roadmap, Long> {
    List<Roadmap> findByProjectIdOrderByTargetDateAsc(Long projectId);
}