package com.prodhive_core.controller;

import com.prodhive_core.service.WorkloadService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/core/boards/{boardId}/workload")
public class WorkloadController {

    private final WorkloadService workloadService;

    public WorkloadController(WorkloadService workloadService) {
        this.workloadService = workloadService;
    }

    @GetMapping("/by-assignee")
    public ResponseEntity<Map<Long, Long>> byAssignee(@PathVariable Long boardId) {
        return ResponseEntity.ok(workloadService.workloadByAssignee(boardId));
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Integer>> health(@PathVariable Long boardId) {
        return ResponseEntity.ok(Map.of("score", workloadService.projectHealthScore(boardId)));
    }
}