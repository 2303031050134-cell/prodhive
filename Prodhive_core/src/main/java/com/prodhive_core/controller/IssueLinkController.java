package com.prodhive_core.controller;
import com.prodhive_core.dto.LinkRequest;
import com.prodhive_core.entity.*;
import com.prodhive_core.service.IssueLinkService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/api/core/issues/{issueId}/links")
public class IssueLinkController {
    private final IssueLinkService service;
    public IssueLinkController(IssueLinkService service) { this.service=service; }
    @PostMapping public ResponseEntity<IssueLink> create(@PathVariable Long issueId, @RequestBody LinkRequest req) { return ResponseEntity.ok(service.create(issueId, req.targetIssueId(), LinkType.valueOf(req.linkType()))); }
    @GetMapping public ResponseEntity<List<IssueLink>> list(@PathVariable Long issueId) { return ResponseEntity.ok(service.list(issueId)); }
}
