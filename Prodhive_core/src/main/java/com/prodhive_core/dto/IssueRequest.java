package com.prodhive_core.dto;

public record IssueRequest(
        String title,
        String description,
        String type,       // EPIC, STORY, TASK, BUG
        String priority,    // LOW, MEDIUM, HIGH, CRITICAL
        Long boardId,
        Long sprintId        // nullable
) {}