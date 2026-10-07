package com.prodhive_core.controller;

import com.prodhive_core.dto.SprintRequest;
import com.prodhive_core.entity.Sprint;
import com.prodhive_core.entity.SprintCapacity;
import com.prodhive_core.security.CurrentUser;
import com.prodhive_core.service.SprintService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/core/sprints")
public class SprintController {

    private final SprintService sprintService;
    private final CurrentUser currentUser;

    public SprintController(SprintService sprintService, CurrentUser currentUser) {
        this.sprintService = sprintService;
        this.currentUser = currentUser;
    }

    @PostMapping
    public ResponseEntity<Sprint> create(@RequestBody SprintRequest req, HttpServletRequest http) {
        return ResponseEntity.ok(sprintService.create(req, currentUser.getRole(http), currentUser.getOrgRole(http)));
    }

    @GetMapping
    public ResponseEntity<List<Sprint>> listByBoard(@RequestParam Long boardId) {
        return ResponseEntity.ok(sprintService.findByBoard(boardId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Sprint> getOne(@PathVariable Long id) {
        return ResponseEntity.ok(sprintService.findById(id));
    }

    @PatchMapping("/{id}/start")
    public ResponseEntity<Sprint> start(@PathVariable Long id) {
        return ResponseEntity.ok(sprintService.start(id));
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<Sprint> complete(@PathVariable Long id) {
        return ResponseEntity.ok(sprintService.complete(id));
    }

    @PutMapping("/{id}/capacity")
    public ResponseEntity<SprintCapacity> setCapacity(@PathVariable Long id, @RequestBody CapacityRequest req) {
        return ResponseEntity.ok(sprintService.setCapacity(id, req.capacity()));
    }

    @GetMapping("/{id}/capacity")
    public ResponseEntity<Map<String, Object>> capacity(@PathVariable Long id) {
        return ResponseEntity.ok(sprintService.capacityStatus(id));
    }

    public record CapacityRequest(double capacity) {}
}