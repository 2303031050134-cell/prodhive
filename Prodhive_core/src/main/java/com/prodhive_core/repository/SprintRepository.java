package com.prodhive_core.repository;

import com.prodhive_core.entity.Sprint;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SprintRepository extends JpaRepository<Sprint, Long> {
    List<Sprint> findByBoardId(Long boardId);
}