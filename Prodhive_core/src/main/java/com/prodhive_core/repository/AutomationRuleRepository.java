package com.prodhive_core.repository;

import com.prodhive_core.entity.AutomationRule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AutomationRuleRepository extends JpaRepository<AutomationRule, Long> {
    List<AutomationRule> findByProjectIdOrderByCreatedAtAsc(Long projectId);
    List<AutomationRule> findByProjectIdAndEnabledTrue(Long projectId);
}
