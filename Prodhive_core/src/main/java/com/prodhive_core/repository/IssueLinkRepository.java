package com.prodhive_core.repository;

import com.prodhive_core.entity.IssueLink;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IssueLinkRepository extends JpaRepository<IssueLink, Long>{
    List<IssueLink> findBySourceIssueIdOrTargetIssueId(Long	sourceId, Long	targetId);
}