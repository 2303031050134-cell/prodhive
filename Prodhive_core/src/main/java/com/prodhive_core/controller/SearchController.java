package com.prodhive_core.controller;

import com.prodhive_core.entity.Issue;
import com.prodhive_core.repository.IssueRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/core/search")
public	class SearchController {

    private	final IssueRepository issueRepository;
    public SearchController(IssueRepository	issueRepository) {
        this.issueRepository = issueRepository;
    }


    @GetMapping
    public ResponseEntity<List<Issue>> search(@RequestParam Long projectId, @RequestParam String q)	{
        return	ResponseEntity.ok(issueRepository.search(projectId,	q));
    }
}