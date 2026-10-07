package com.prodhive_core.controller;
import com.prodhive_core.entity.*;
import com.prodhive_core.service.LabelService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
public class LabelController {
    private final LabelService labels;
    public LabelController(LabelService labels) { this.labels=labels; }
    @PostMapping("/api/core/projects/{projectId}/labels") public ResponseEntity<Label> create(@PathVariable Long projectId, @RequestBody Label body) { return ResponseEntity.ok(labels.create(projectId, body.getName(), body.getColor())); }
    @GetMapping("/api/core/projects/{projectId}/labels") public ResponseEntity<List<Label>> list(@PathVariable Long projectId) { return ResponseEntity.ok(labels.list(projectId)); }
    @DeleteMapping("/api/core/projects/{projectId}/labels/{id}") public ResponseEntity<Void> delete(@PathVariable Long id) { labels.delete(id); return ResponseEntity.noContent().build(); }
    @PostMapping("/api/core/issues/{issueId}/labels/{labelId}") public ResponseEntity<Issue> add(@PathVariable Long issueId, @PathVariable Long labelId) { return ResponseEntity.ok(labels.addToIssue(issueId,labelId)); }
    @DeleteMapping("/api/core/issues/{issueId}/labels/{labelId}") public ResponseEntity<Issue> remove(@PathVariable Long issueId, @PathVariable Long labelId) { return ResponseEntity.ok(labels.removeFromIssue(issueId,labelId)); }
}
