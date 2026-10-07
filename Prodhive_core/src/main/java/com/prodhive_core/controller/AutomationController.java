package com.prodhive_core.controller;

import com.prodhive_core.entity.AutomationAction;
import com.prodhive_core.entity.AutomationRule;
import com.prodhive_core.entity.AutomationTrigger;
import com.prodhive_core.service.AutomationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/core/projects/{projectId}/automations")
public class AutomationController {
    private final AutomationService automationService;

    public AutomationController(AutomationService automationService) {
        this.automationService = automationService;
    }

    @GetMapping
    public ResponseEntity<List<AutomationRule>> list(@PathVariable Long projectId) {
        return ResponseEntity.ok(automationService.list(projectId));
    }

    @GetMapping("/options")
    public ResponseEntity<Map<String, Object>> options() {
        return ResponseEntity.ok(Map.of("triggers", AutomationTrigger.values(), "actions", AutomationAction.values()));
    }

    @PostMapping
    public ResponseEntity<AutomationRule> create(@PathVariable Long projectId, @RequestBody RuleRequest request) {
        return ResponseEntity.ok(automationService.create(projectId, request.name(), request.trigger(), request.action()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AutomationRule> update(@PathVariable Long id, @RequestBody RuleRequest request) {
        return ResponseEntity.ok(automationService.update(id, request.name(), request.trigger(), request.action(), request.enabled()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        automationService.delete(id);
        return ResponseEntity.noContent().build();
    }

    public record RuleRequest(String name, AutomationTrigger trigger, AutomationAction action, boolean enabled) {}
}
