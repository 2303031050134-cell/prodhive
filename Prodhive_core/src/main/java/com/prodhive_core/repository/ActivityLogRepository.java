package com.prodhive_core.repository;

import com.prodhive_core.entity.ActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public	interface	ActivityLogRepository	extends JpaRepository<ActivityLog,	Long> {
    List<ActivityLog> findByProjectIdOrderByCreatedAtDesc(Long projectId);

    List<ActivityLog> findByEntityTypeAndEntityIdOrderByCreatedAtAsc(String entityType, Long entityId);
@Query("SELECT a FROM ActivityLog a WHERE a.projectId in :projectIds ORDER BY a.createdAt DESC")
    List<ActivityLog> findByProjectIdInOrderByCreatedAtDesc(@Param("projectIds") List<Long> projectIds);
}