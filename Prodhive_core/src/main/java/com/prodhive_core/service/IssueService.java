package com.prodhive_core.service;
import com.prodhive_core.dto.IssueRequest;
import com.prodhive_core.entity.*;
import com.prodhive_core.repository.BoardRepository;
import com.prodhive_core.repository.IssueRepository;
import com.prodhive_core.repository.IssueStatusHistoryRepository;
import com.prodhive_core.repository.SprintRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.util.List;

@Service
public class IssueService {

    private final IssueRepository issueRepository;
    private final BoardRepository boardRepository;
    private final SprintRepository sprintRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final WorkflowService workflowService;
    private final IssueStatusHistoryRepository historyRepository;
    private final ActivityLogService activityLogService;

    public IssueService(IssueRepository issueRepository, BoardRepository boardRepository,
                        SprintRepository sprintRepository, SimpMessagingTemplate messagingTemplate, WorkflowService workflowService, IssueStatusHistoryRepository historyRepository, ActivityLogService activityLogService) {
        this.issueRepository = issueRepository;
        this.boardRepository = boardRepository;
        this.sprintRepository = sprintRepository;
        this.messagingTemplate = messagingTemplate;
        this.workflowService = workflowService;
        this.historyRepository = historyRepository;
        this.activityLogService = activityLogService;
    }

    public Issue create(IssueRequest req, Long reporterId) {
        if (req.boardId() == null) {
            throw new IllegalArgumentException("Board is required to create an issue — the board may not have finished loading yet, try refreshing");
        }
        Board board = boardRepository.findById(req.boardId())
                .orElseThrow(() -> new IllegalArgumentException("Board not found: " + req.boardId()));

        Issue issue = new Issue();
        issue.setTitle(req.title());
        issue.setDescription(req.description());
        issue.setType(IssueType.valueOf(req.type() != null ? req.type() : "TASK"));
        issue.setPriority(IssuePriority.valueOf(req.priority() != null ? req.priority() : "MEDIUM"));
        issue.setBoard(board);
        issue.setReporterId(reporterId);

        if (req.sprintId() != null) {
            Sprint sprint = sprintRepository.findById(req.sprintId())
                    .orElseThrow(() -> new IllegalArgumentException("Sprint not found: " + req.sprintId()));
            issue.setSprint(sprint);
        }

        // Generate a human-readable key using the project prefix and a per-board sequence
        long sequence = issueRepository.findByBoardId(board.getId()).size() + 1L;
        issue.setIssueKey(board.getProject().getKey() + "-" + sequence);

        Issue saved = issueRepository.save(issue);
        activityLogService.log(board.getProject().getId(), "ISSUE", saved.getId(),
                "CREATED", reporterId, "Created " + saved.getIssueKey());
        return saved;
    }

    public List<Issue> findByBoard(Long boardId) {
        return issueRepository.findByBoardId(boardId);
    }

    public Issue findById(Long id) {
        return issueRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Issue not found: " + id));
    }

    public Issue updateStatus(Long id, String statusStr, Long changedBy) {
        Issue issue = findById(id);
        IssueStatus oldStatus = issue.getStatus();
        IssueStatus newStatus = IssueStatus.valueOf(statusStr);
        Long projectId = issue.getBoard().getProject().getId();
        workflowService.validateTransition(projectId, oldStatus, newStatus);
        IssueStatusHistory history = new IssueStatusHistory();
        history.setIssue(issue);
        history.setFromStatus(oldStatus);
        history.setToStatus(newStatus);
        history.setChangedBy(changedBy);
        historyRepository.save(history);
        issue.setStatus(newStatus);
        issue.setUpdatedAt(Instant.now());
        Issue saved = issueRepository.save(issue);
        messagingTemplate.convertAndSend("/topic/board/" + issue.getBoard().getId(), saved);
        activityLogService.log(issue.getBoard().getProject().getId(), "ISSUE", issue.getId(),
                "STATUS_CHANGED", changedBy, oldStatus + " -> " + newStatus);
        return saved;
    }

    public Issue assign(Long id, Long assigneeId, Long actorId) {
        Issue issue = findById(id);
        Long previousAssignee = issue.getAssigneeId();
        issue.setAssigneeId(assigneeId);
        issue.setUpdatedAt(Instant.now());
        Issue saved = issueRepository.save(issue);
        messagingTemplate.convertAndSend("/topic/board/" + issue.getBoard().getId(), saved);
        String detail = assigneeId == null ? "Assignee removed" : "Assigned to user #" + assigneeId;
        if (previousAssignee != null && assigneeId != null && !previousAssignee.equals(assigneeId)) {
            detail = "Reassigned from user #" + previousAssignee + " to user #" + assigneeId;
        }
        activityLogService.log(issue.getBoard().getProject().getId(), "ISSUE", issue.getId(),
                "ASSIGNED", actorId, detail);
        return saved;
    }

    public Issue updateRank(Long id, Double newRank) {
        Issue issue = findById(id);
        issue.setRank(newRank);
        return issueRepository.save(issue);
    }

    public Issue save(Issue issue) { return issueRepository.save(issue); }
}