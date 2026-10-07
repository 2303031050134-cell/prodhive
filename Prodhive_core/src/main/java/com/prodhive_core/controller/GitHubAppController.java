package com.prodhive_core.controller;

import com.prodhive_core.dto.GithubIntegrationSummary;
import com.prodhive_core.entity.GithubInstallation;
import com.prodhive_core.entity.GithubIntegration;
import com.prodhive_core.entity.Project;
import com.prodhive_core.repository.GitHubIntegrationRepository;
import com.prodhive_core.repository.GithubInstallationRepository;
import com.prodhive_core.repository.ProjectRepository;
import com.prodhive_core.service.GitHubAppService;
import com.prodhive_core.security.CurrentUser;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.util.*;

@RestController
@RequestMapping("/api/core")
public class GitHubAppController {
    private final GitHubAppService appService;
    private final GithubInstallationRepository installationRepository;
    private final GitHubIntegrationRepository integrationRepository;
    private final ProjectRepository projectRepository;
    private final CurrentUser currentUser;
    private final ObjectMapper objectMapper = new ObjectMapper();
    @Value("${github.app.setup-redirect:http://localhost:5173}") private String setupRedirect;

    public GitHubAppController(GitHubAppService appService, GithubInstallationRepository installationRepository,
                               GitHubIntegrationRepository integrationRepository, ProjectRepository projectRepository, CurrentUser currentUser) {
        this.appService = appService;
        this.installationRepository = installationRepository;
        this.integrationRepository = integrationRepository;
        this.projectRepository = projectRepository;
        this.currentUser = currentUser;
    }

    @GetMapping("/projects/{projectId}/github/app/install-url")
    public ResponseEntity<?> installUrl(@PathVariable Long projectId) {
        if (!appService.configured()) return ResponseEntity.status(503).body(Map.of("message", "GitHub App is not configured on this server"));
        return ResponseEntity.ok(Map.of("url", appService.installationUrl(projectId, setupRedirect)));
    }

    @GetMapping("/github/app/setup")
    public ResponseEntity<Void> setup(@RequestParam("installation_id") long installationId,
                                      @RequestParam("state") String state,
                                      @RequestParam(value = "setup_action", required = false) String setupAction) {
        long projectId;
        try {
            projectId = appService.parseState(state);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
        appService.syncInstallation(installationId);
        String location = setupRedirect + "/projects/" + projectId + "/settings?tab=GitHub&github_installation=" + installationId;
        return ResponseEntity.status(302).header("Location", location).build();
    }

    @GetMapping("/github/installations/{installationId}/repositories")
    public ResponseEntity<?> repositories(@PathVariable long installationId) {
        return ResponseEntity.ok(objectMapper.readTree(appService.listRepositories(installationId)));
    }

    @PostMapping("/projects/{projectId}/github/app/connect")
    public ResponseEntity<?> connect(@PathVariable Long projectId, @RequestBody ConnectAppRequest request, jakarta.servlet.http.HttpServletRequest http) {
        Project project = projectRepository.findById(projectId).orElseThrow();
        GithubInstallation installation = appService.getInstallation(request.installationId());
        JsonNode repos = objectMapper.readTree(appService.listRepositories(request.installationId()));
        boolean found = false;
        for (JsonNode repo : repos.path("repositories")) {
            if (request.repoFullName().equalsIgnoreCase(repo.path("full_name").asText())) { found = true; break; }
        }
        if (!found) return ResponseEntity.badRequest().body(Map.of("message", "Repository is not accessible through this GitHub App installation"));

        GithubIntegration integration = integrationRepository.findByProjectId(projectId).orElseGet(GithubIntegration::new);
        integration.setProject(project);
        integration.setRepoFullName(request.repoFullName());
        integration.setAccessToken(null); // Installation tokens are short-lived; never persist them.
        integration.setInstallationId(installation.getInstallationId());
        integration.setAccountLogin(installation.getAccountLogin());
        integration.setAccountType(installation.getAccountType());
        Long callerId;
        try { callerId = currentUser.getUserId(http); } catch (Exception ignored) { callerId = project.getOwnerId(); }
        integration.setConnectedBy(callerId);
        GithubIntegration saved = integrationRepository.save(integration);
        return ResponseEntity.ok(GithubIntegrationSummary.from(saved));
    }

    @GetMapping("/github/installations/{installationId}")
    public ResponseEntity<GithubInstallation> installation(@PathVariable long installationId) {
        return installationRepository.findByInstallationId(installationId).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    public record ConnectAppRequest(long installationId, String repoFullName, Long connectedBy) {}
}
