package com.prodhive_core.service;

import com.prodhive_core.entity.Issue;
import com.prodhive_core.entity.PrStatus;
import com.prodhive_core.entity.Project;
import com.prodhive_core.entity.PullRequest;
import com.prodhive_core.repository.IssueRepository;
import com.prodhive_core.repository.ProjectRepository;
import com.prodhive_core.repository.PullRequestRepository;
import org.springframework.stereotype.Service;

/**
 * Links a GitHub pull request to a Prodhive project (and optionally an issue).
 * Matching is keyed on the "ghNumber" within the connected repo's project, or
 * by deriving an issue from the PR title when it follows the "KEY-<id>" convention.
 */
@Service
public class PrLinkingService {

    private final PullRequestRepository pullRequestRepository;
    private final IssueRepository issueRepository;
    private final ProjectRepository projectRepository;

    public PrLinkingService(PullRequestRepository pullRequestRepository, IssueRepository issueRepository,
                            ProjectRepository projectRepository) {
        this.pullRequestRepository = pullRequestRepository;
        this.issueRepository = issueRepository;
        this.projectRepository = projectRepository;
    }

    /**
     * Returns the PR if already linked/saved for this project, or creates one.
     * Uses the GitHub PR number; if one is already known, it is reused.
     */
    public PullRequest findOrCreate(Long projectId, Long ghNumber, String ghId, String title, String state) {
        return pullRequestRepository.findByGhNumberAndProjectId(ghNumber, projectId)
                .orElseGet(() -> {
                    PullRequest pr = new PullRequest();
                    pr.setGhNumber(ghNumber);
                    pr.setGhId(ghId);
                    pr.setTitle(title);
                    pr.setState(state);
                    pr.setStatus(PrStatus.OPEN);
                    return pr;
                });
    }

    public PullRequest linkToIssue(PullRequest pr, Issue issue) {
        pr.setIssue(issue);
        return pullRequestRepository.save(pr);
    }

    public Issue resolveIssueForPr(PullRequest pr) {
        if (pr.getIssue() != null) {
            return pr.getIssue();
        }
        java.util.regex.Pattern keyPattern = java.util.regex.Pattern.compile("([A-Z]+-\\d+)");

        // 1. Try to find key in PR title
        String title = pr.getTitle();
        if (title != null) {
            java.util.regex.Matcher matcher = keyPattern.matcher(title);
            if (matcher.find()) {
                String key = matcher.group(1);
                Issue found = issueRepository.findAll().stream()
                        .filter(i -> key.equalsIgnoreCase(i.getIssueKey()))
                        .findFirst().orElse(null);
                if (found != null) return found;
            }
        }

        // 2. Fall back: try branch name (e.g. "PROJ-1-create-a-dashboard")
        String branch = pr.getBranchName();
        if (branch != null) {
            java.util.regex.Matcher matcher = keyPattern.matcher(branch.toUpperCase());
            if (matcher.find()) {
                String key = matcher.group(1);
                Issue found = issueRepository.findAll().stream()
                        .filter(i -> key.equalsIgnoreCase(i.getIssueKey()))
                        .findFirst().orElse(null);
                if (found != null) return found;
            }
        }

        return null;
    }

    public Issue saveIssue(Issue issue) {
        return issueRepository.save(issue);
    }

    public PullRequest save(PullRequest pr, Long projectId) {
        if (pr.getProject() == null) {
            Project project = projectRepository.findById(projectId).orElseThrow();
            pr.setProject(project);
        }
        return pullRequestRepository.save(pr);
    }
}