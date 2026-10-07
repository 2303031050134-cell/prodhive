package com.prodhive_core.repository;

import com.prodhive_core.entity.Label;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LabelRepository	extends JpaRepository<Label,Long> {
    List<Label> findByProjectId(Long projectId);
}