package com.prodhive_core.repository;

import com.prodhive_core.entity.SavedFilter;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public	interface SavedFilterRepository	extends JpaRepository<SavedFilter,	Long> {
    List<SavedFilter> findByUserIdAndProjectId(Long	userId, Long projectId);
}