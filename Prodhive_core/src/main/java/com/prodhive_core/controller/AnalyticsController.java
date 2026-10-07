package com.prodhive_core.controller;

import com.prodhive_core.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/core/boards/{boardId}/analytics")
public class AnalyticsController {
    private	final AnalyticsService analyticsService;

    public	AnalyticsController(AnalyticsService analyticsService)	{
        this.analyticsService =	analyticsService;
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> summary(@PathVariable Long boardId) {
        return ResponseEntity.ok(analyticsService.advancedSummary(boardId));
    }

    @GetMapping("/burndown")
    public ResponseEntity<List<Map<String, Object>>>burndown(@PathVariable Long	boardId, @RequestParam Long sprintId) {
        return	ResponseEntity.ok(analyticsService.burndown(sprintId));
    }


    @GetMapping("/velocity")
    public ResponseEntity<List<Map<String, Object>>> velocity(@PathVariable	Long boardId, @RequestParam(defaultValue = "5")	int	last) {
        return	ResponseEntity.ok(analyticsService.velocity(boardId, last));
    }


    @GetMapping("/cycle-time")
    public ResponseEntity<Map<String, Double>> cycleTime(@PathVariable Long	boardId) {
        return ResponseEntity.ok(Map.of("avgHours",	analyticsService.avgCycleTimeHours(boardId)));
    }

    @GetMapping("/lead-time")
    public	ResponseEntity<Map<String, Double>> leadTime(@PathVariable Long	boardId) {
        return	ResponseEntity.ok(Map.of("avgHours", analyticsService.avgLeadTimeHours(boardId)));
    }
}