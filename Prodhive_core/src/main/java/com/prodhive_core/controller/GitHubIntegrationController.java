package com.prodhive_core.controller;

import com.prodhive_core.dto.GithubIntegrationSummary;
import com.prodhive_core.entity.GithubIntegration;
import com.prodhive_core.entity.Project;
import com.prodhive_core.repository.GitHubIntegrationRepository;
import com.prodhive_core.repository.ProjectRepository;
import com.prodhive_core.security.CurrentUser;
import com.prodhive_core.service.GitHubApiClient;
import com.prodhive_core.service.GitHubSyncService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/core/projects/{projectId}/github")
public class GitHubIntegrationController {

    private final GitHubIntegrationRepository integrationRepository;
    private final ProjectRepository projectRepository;
    private final CurrentUser currentUser;
    private final GitHubApiClient gitHubApiClient;
    private final GitHubSyncService gitHubSyncService;

    public GitHubIntegrationController(GitHubIntegrationRepository integrationRepository,
                                       ProjectRepository projectRepository, CurrentUser currentUser, GitHubApiClient gitHubApiClient, GitHubSyncService gitHubSyncService) {
        this.integrationRepository = integrationRepository;
        this.projectRepository = projectRepository;
        this.currentUser = currentUser;
        this.gitHubApiClient = gitHubApiClient;
        this.gitHubSyncService = gitHubSyncService;
    }

    @GetMapping
    public ResponseEntity<GithubIntegrationSummary> get(@PathVariable Long projectId) {
        return integrationRepository.findByProjectId(projectId)
                .map(i -> ResponseEntity.ok(GithubIntegrationSummary.from(i)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/connect")
    public ResponseEntity<GithubIntegrationSummary> connect(@PathVariable Long projectId,
                                                     @RequestBody ConnectRequest req,
                                                     HttpServletRequest http) {
        Project project = projectRepository.findById(projectId).orElseThrow();
        GithubIntegration integration = integrationRepository.findByProjectId(projectId)
                .orElse(new GithubIntegration());
        integration.setProject(project);
        integration.setRepoFullName(req.repoFullName());
        integration.setAccessToken(req.accessToken());
        integration.setConnectedBy(currentUser.getUserId(http));
        GithubIntegration saved = integrationRepository.save(integration);
        return ResponseEntity.ok(GithubIntegrationSummary.from(saved));
    }


    @PostMapping("/sync")
    public ResponseEntity<Integer> sync(@PathVariable Long projectId) {
        int synced = gitHubSyncService.syncPullRequests(projectId);
        return ResponseEntity.ok(synced);
    }



    @DeleteMapping
    public ResponseEntity<Void> disconnect(@PathVariable Long projectId) {
        integrationRepository.findByProjectId(projectId)
                .ifPresent(integrationRepository::delete);
        return ResponseEntity.noContent().build();
    }


    public record ConnectRequest(String repoFullName, String accessToken) {}
}