package com.prodhive_core.controller;

import com.prodhive_core.dto.IssueRequest;
import com.prodhive_core.entity.Issue;
import com.prodhive_core.security.CurrentUser;
import com.prodhive_core.service.IssueService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/core/boards/{boardId}/import")
public class ImportController {

    private final IssueService issueService;
    private final CurrentUser currentUser;

    public ImportController(IssueService issueService, CurrentUser currentUser) {
        this.issueService = issueService;
        this.currentUser = currentUser;
    }

    @PostMapping
    public ResponseEntity<List<Issue>> importCsv(@PathVariable Long boardId,
                                                 @RequestParam("file") MultipartFile file,
                                                 HttpServletRequest http) throws IOException {
        Long reporterId = currentUser.getUserId(http);
        List<Issue> created = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            reader.readLine(); // skip header
            String line;
            while ((line = reader.readLine()) != null) {
                if (line.trim().isEmpty()) {
                    continue;
                }
                String[] cols = line.split(",", -1);
                String title = cols.length > 0 ? cols[0] : "";
                String priority = cols.length > 3 && !cols[3].isBlank() ? cols[3] : "MEDIUM";
                IssueRequest req = new IssueRequest(title, "", "TASK", priority, boardId, null);
                created.add(issueService.create(req, reporterId));
            }
        }
        return ResponseEntity.ok(created);
    }
}