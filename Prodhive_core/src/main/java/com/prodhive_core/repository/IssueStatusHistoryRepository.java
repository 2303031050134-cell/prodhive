package com.prodhive_core.repository;

import com.prodhive_core.entity.IssueStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;

public interface IssueStatusHistoryRepository extends JpaRepository<IssueStatusHistory,	Long> {

    List<IssueStatusHistory> findByIssueIdOrderByChangedAtAsc(Long issueId);
    List<IssueStatusHistory> findByIssue_Board_IdAndChangedAtBetween(Long boardId, Instant from, Instant to);
}