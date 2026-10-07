package com.prodhive_core.service;

import com.prodhive_core.entity.*;
import com.prodhive_core.repository.IssueRepository;
import com.prodhive_core.repository.IssueStatusHistoryRepository;
import com.prodhive_core.repository.SprintRepository;
import com.prodhive_core.repository.PullRequestRepository;
import com.prodhive_core.repository.ReviewRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private final IssueRepository issueRepository;
    private final IssueStatusHistoryRepository historyRepository;
    private final SprintRepository sprintRepository;
    private final PullRequestRepository pullRequestRepository;
    private final ReviewRepository reviewRepository;

    public AnalyticsService(IssueRepository issueRepository, IssueStatusHistoryRepository historyRepository, SprintRepository sprintRepository, PullRequestRepository pullRequestRepository, ReviewRepository reviewRepository) {
        this.issueRepository = issueRepository;
        this.historyRepository = historyRepository;
        this.sprintRepository = sprintRepository;
        this.pullRequestRepository = pullRequestRepository;
        this.reviewRepository = reviewRepository;
    }

    //	1.	Burndown:	remaining	(not-DONE)	issue	count	per	day	of	the	sprint
    public List<Map<String,	Object>> burndown(Long sprintId) {
        Sprint sprint = sprintRepository.findById(sprintId).orElseThrow();
        List<Issue>	issues = issueRepository.findBySprintId(sprintId);
        List<Map<String, Object>> result = new ArrayList<>();
        LocalDate day =	sprint.getStartDate();
        while (!day.isAfter(sprint.getEndDate())) {
            Instant cutoff = day.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant();
            long remaining = issues.stream()
                    .filter(issue	->	!wasDoneBefore(issue, cutoff))
                    .count();
            result.add(Map.of("date",	day.toString(),	"remaining",	remaining));
            day	= day.plusDays(1);
        }
        return	result;
    }

    private	boolean	wasDoneBefore(Issue	issue,	Instant	cutoff)	{
        return	historyRepository.findByIssueIdOrderByChangedAtAsc(issue.getId()).stream()
                .anyMatch(h	->	h.getToStatus()	==	IssueStatus.DONE &&	h.getChangedAt().isBefore(cutoff));
    }

    //	2.	Velocity:	issues	completed	per	sprint,	last	N	sprints	on	a	board
    public List<Map<String,	Object>> velocity(Long	boardId, int	lastNSprints) {
        List<Sprint> sprints = sprintRepository.findByBoardId(boardId).stream()
                .filter(s	->	s.getStatus() == SprintStatus.COMPLETED)
                .sorted(Comparator.comparing(Sprint::getEndDate).reversed())
                .limit(lastNSprints)
                .collect(Collectors.toList());
        List<Map<String, Object>> result = new ArrayList<>();
        for	(Sprint	sprint : sprints) {
            long completed = issueRepository.findBySprintId(sprint.getId()).stream()
                    .filter(i -> i.getStatus() == IssueStatus.DONE)
                    .count();
            result.add(Map.of("sprint",	sprint.getName(),"completed", completed));
        }
        Collections.reverse(result);	//	oldest	first	for	charting
        return	result;
    }

    //	3.	Cycle	time:	avg	hours	from	IN_PROGRESS	->	DONE	per	issue	on	a	board
    public	double	avgCycleTimeHours(Long	boardId)	{
        List<Issue> issues = issueRepository.findByBoardId(boardId);
        List<Double> cycleHours	= new ArrayList<>();

        for (Issue issue : issues) {
            var	history	= historyRepository.findByIssueIdOrderByChangedAtAsc(issue.getId());
            Instant	startedAt =	history.stream()
                    .filter(h -> h.getToStatus() ==	IssueStatus.IN_PROGRESS)
                    .map(IssueStatusHistory::getChangedAt).findFirst().orElse(null);
            Instant	doneAt	=	history.stream()
                    .filter(h -> h.getToStatus() ==	IssueStatus.DONE)
                    .map(IssueStatusHistory::getChangedAt)
                    .reduce((first,second) ->	second).orElse(null);	//	last	DONE	transition
            if (startedAt != null && doneAt	!= null	&& doneAt.isAfter(startedAt))	{
                cycleHours.add((double)	ChronoUnit.HOURS.between(startedAt,	doneAt));
            }
        }
        return	cycleHours.isEmpty() ? 0.0 : cycleHours.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
    }

    //	4.Lead time: avg hours from	issue creation -> DONE per issue on	a board
    public double avgLeadTimeHours(Long	boardId) {
        List<Issue> issues = issueRepository.findByBoardId(boardId);
        List<Double> leadHours = new ArrayList<>();
        for (Issue issue : issues) {
            var	history	= historyRepository.findByIssueIdOrderByChangedAtAsc(issue.getId());
            Instant	doneAt = history.stream()
                    .filter(h -> h.getToStatus() ==	IssueStatus.DONE)
                    .map(IssueStatusHistory::getChangedAt)
                    .reduce((first,	second)	->	second).orElse(null);
            if (doneAt != null) {
                leadHours.add((double) ChronoUnit.HOURS.between(issue.getCreatedAt(), doneAt));
            }
        }
        return leadHours.isEmpty() ? 0.0 : leadHours.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
    }
    public Map<String, Object> advancedSummary(Long boardId) {
        List<Issue> issues = issueRepository.findByBoardId(boardId);
        long todo = issues.stream().filter(i -> i.getStatus() == IssueStatus.TODO).count();
        long inProgress = issues.stream().filter(i -> i.getStatus() == IssueStatus.IN_PROGRESS).count();
        long inReview = issues.stream().filter(i -> i.getStatus() == IssueStatus.IN_REVIEW).count();
        long done = issues.stream().filter(i -> i.getStatus() == IssueStatus.DONE).count();
        long reopened = issues.stream().filter(i -> i.getStatus() == IssueStatus.REOPENED).count();
        Instant staleCutoff = Instant.now().minus(7, ChronoUnit.DAYS);
        long stale = issues.stream().filter(i -> i.getStatus() != IssueStatus.DONE && i.getUpdatedAt() != null && i.getUpdatedAt().isBefore(staleCutoff)).count();

        Long projectId = issues.stream().findFirst().map(i -> i.getBoard().getProject().getId()).orElse(null);
        List<PullRequest> prs = projectId == null ? List.of() : pullRequestRepository.findByProjectId(projectId);
        long openPrs = prs.stream().filter(p -> p.getStatus() == PrStatus.OPEN).count();
        long mergedPrs = prs.stream().filter(p -> p.getStatus() == PrStatus.MERGED).count();
        long changesRequested = 0;
        double reviewResponseHours = 0.0;
        int reviewedPrs = 0;
        for (PullRequest pr : prs) {
            List<Review> reviews = reviewRepository.findByPullRequestIdOrderBySubmittedAtAsc(pr.getId());
            if (!reviews.isEmpty() && pr.getCreatedAt() != null && reviews.get(0).getSubmittedAt() != null) {
                reviewResponseHours += ChronoUnit.MINUTES.between(pr.getCreatedAt(), reviews.get(0).getSubmittedAt()) / 60.0;
                reviewedPrs++;
            }
            changesRequested += reviews.stream().filter(r -> r.getState() == ReviewState.CHANGES_REQUESTED).count();
        }
        if (reviewedPrs > 0) reviewResponseHours /= reviewedPrs;

        return Map.of(
                "issues", Map.of("total", issues.size(), "todo", todo, "inProgress", inProgress, "inReview", inReview, "done", done, "reopened", reopened, "stale", stale),
                "pullRequests", Map.of("total", prs.size(), "open", openPrs, "merged", mergedPrs, "changesRequested", changesRequested),
                "reviews", Map.of("averageResponseHours", Math.round(reviewResponseHours * 10.0) / 10.0, "reviewedPullRequests", reviewedPrs)
        );
    }

}
