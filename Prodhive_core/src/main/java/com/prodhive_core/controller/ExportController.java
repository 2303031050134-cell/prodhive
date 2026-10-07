package com.prodhive_core.controller;

import com.prodhive_core.entity.Issue;
import com.prodhive_core.repository.IssueRepository;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.io.PrintWriter;

@RestController
@RequestMapping("/api/core/boards/{boardId}/export")
public class ExportController {

    private final IssueRepository issueRepository;

    public ExportController(IssueRepository issueRepository) {
        this.issueRepository = issueRepository;
    }

    @GetMapping
    public void exportCsv(@PathVariable Long boardId, HttpServletResponse response) throws IOException {
        response.setContentType("text/csv");
        response.setHeader("Content-Disposition", "attachment; filename=issues.csv");
        PrintWriter writer = response.getWriter();
        writer.println("Key,Title,Status,Priority,Assignee,Sprint");
        for (Issue issue : issueRepository.findByBoardId(boardId)) {
            writer.printf("%s,%s,%s,%s,%s,%s%n",
                    issue.getIssueKey(),
                    issue.getTitle().replace(",", " "),
                    issue.getStatus(),
                    issue.getPriority(),
                    issue.getAssigneeId(),
                    issue.getSprint() != null ? issue.getSprint().getName() : "");
        }
    }
}