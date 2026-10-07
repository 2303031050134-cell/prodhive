package com.prodhive_core.service;

import com.prodhive_core.entity.*;
import com.prodhive_core.repository.IssueRepository;
import com.prodhive_core.repository.PullRequestRepository;
import com.prodhive_core.repository.PullRequestReviewerRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class NeedsAttentionService {

    private final IssueRepository issueRepository;
    private final PullRequestRepository pullRequestRepository;
    private final PullRequestReviewerRepository reviewerRepository;

    public NeedsAttentionService(IssueRepository issueRepository, PullRequestRepository pullRequestRepository,
                                  PullRequestReviewerRepository reviewerRepository) {
        this.issueRepository = issueRepository;
        this.pullRequestRepository = pullRequestRepository;
        this.reviewerRepository = reviewerRepository;
    }

    public List<AttentionItem> forUser(Long userId) {
        List<AttentionItem> items = new ArrayList<>();

        // 1. PRs where I was requested as a reviewer and haven't responded yet.
        for (PullRequestReviewer r : reviewerRepository.findByUserIdAndStatus(userId, ReviewerStatus.REQUESTED)) {
            PullRequest pr = r.getPullRequest();
            if (pr.getStatus() != PrStatus.OPEN) continue;
            items.add(AttentionItem.of("REVIEW_REQUESTED", pr, "A review was requested from you"));
        }

        // 2 & 3: my in-review issues — either changes were requested on the linked PR, or no reviewer
        // has been assigned yet.
        List<Issue> myInReview = issueRepository.findByAssigneeId(userId).stream()
                .filter(i -> i.getStatus() == IssueStatus.IN_REVIEW)
                .toList();

        for (Issue issue : myInReview) {
            List<PullRequest> prs = pullRequestRepository.findByIssueId(issue.getId());
            PullRequest openPr = prs.stream().filter(p -> p.getStatus() == PrStatus.OPEN).findFirst().orElse(null);
            if (openPr == null) continue;

            List<PullRequestReviewer> reviewers = reviewerRepository.findByPullRequestId(openPr.getId());
            boolean hasChangesRequested = reviewers.stream().anyMatch(r -> r.getStatus() == ReviewerStatus.CHANGES_REQUESTED);

            if (hasChangesRequested) {
                items.add(AttentionItem.of("CHANGES_REQUESTED", openPr, "A reviewer requested changes"));
            } else if (reviewers.isEmpty()) {
                items.add(AttentionItem.of("AWAITING_REVIEWER", openPr, "No reviewer assigned yet"));
            }
        }

        return items;
    }

    public record AttentionItem(String type, Long projectId, Long pullRequestId, Long ghNumber, String prTitle,
                                 Long issueId, String issueKey, String issueTitle, String message) {
        static AttentionItem of(String type, PullRequest pr, String message) {
            Issue issue = pr.getIssue();
            return new AttentionItem(
                    type,
                    pr.getProject().getId(),
                    pr.getId(),
                    pr.getGhNumber(),
                    pr.getTitle(),
                    issue != null ? issue.getId() : null,
                    issue != null ? issue.getIssueKey() : null,
                    issue != null ? issue.getTitle() : null,
                    message
            );
        }
    }
}
