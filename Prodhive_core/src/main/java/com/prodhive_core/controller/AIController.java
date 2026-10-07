package com.prodhive_core.controller;

import com.prodhive_core.entity.Issue;
import com.prodhive_core.repository.IssueRepository;
import com.prodhive_core.service.AIService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/core/ai")
public class AIController {

    private final AIService aiService;
    private final IssueRepository issueRepository;

    public AIController(
            AIService aiService,
            IssueRepository issueRepository
    ) {
        this.aiService = aiService;
        this.issueRepository = issueRepository;
    }

    @GetMapping("/issues/{issueId}/analyze")
    public ResponseEntity<Map<String, String>> analyzeIssue(@PathVariable Long issueId) {

        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new IllegalArgumentException("Issue not found: " + issueId));

        String analysis = aiService.analyzeIssue(
                issue.getTitle(),
                issue.getDescription(),
                issue.getPriority().name(),
                issue.getType().name(),
                issue.getStatus().name()
        );

        return ResponseEntity.ok(Map.of("analysis", analysis));
    }
}