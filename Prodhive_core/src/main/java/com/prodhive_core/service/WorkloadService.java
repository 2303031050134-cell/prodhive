package com.prodhive_core.service;

import com.prodhive_core.entity.Issue;
import com.prodhive_core.entity.IssueStatus;
import com.prodhive_core.repository.IssueRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public	class	WorkloadService	{

    private	final IssueRepository issueRepository;
    public	WorkloadService(IssueRepository	issueRepository)	{
        this.issueRepository	=	issueRepository;
    }
    //	open	issue	count	per	assignee,	for	a	board
    public Map<Long, Long> workloadByAssignee(Long	boardId) {
        return	issueRepository.findByBoardId(boardId).stream()
                .filter(i	->	i.getStatus() != IssueStatus.DONE && i.getAssigneeId() != null)
                .collect(Collectors.groupingBy(Issue::getAssigneeId,	Collectors.counting()));
    }
    //	simple	0-100	health	score:	%	done,	penalized	by	overdue-looking	stale	issues
    public	int	projectHealthScore(Long	boardId)	{
        List<Issue> issues	=	issueRepository.findByBoardId(boardId);
        if	(issues.isEmpty())	return	100;
        long	done	=	issues.stream().filter(i	->	i.getStatus()	==	IssueStatus.DONE).count();
        double	doneRatio	=	(double)	done	/	issues.size();
        long	stale	=	issues.stream()
                .filter(i	->	i.getStatus()	==	IssueStatus.IN_PROGRESS)
                .filter(i	->	i.getUpdatedAt().isBefore(java.time.Instant.now().minus(7,	java.time.temporal.ChronoUnit.DAYS)))
                .count();
        int	score	=	(int)	(doneRatio	*	100)	-	(int)	(stale	*	5);
        return	Math.max(0,	Math.min(100,	score));
    }
}