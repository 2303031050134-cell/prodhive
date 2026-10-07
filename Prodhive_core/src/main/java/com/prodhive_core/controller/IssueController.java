package com.prodhive_core.controller;
import com.prodhive_core.dto.AssigneeRequest;
import com.prodhive_core.dto.IssueRequest;
import com.prodhive_core.dto.StatusUpdateRequest;
import com.prodhive_core.dto.RankUpdateRequest;
import com.prodhive_core.entity.Issue;
import com.prodhive_core.entity.IssuePriority;
import com.prodhive_core.entity.IssueStatusHistory;
import com.prodhive_core.entity.IssueType;
import com.prodhive_core.repository.IssueRepository;
import com.prodhive_core.repository.IssueStatusHistoryRepository;
import com.prodhive_core.security.CurrentUser;
import com.prodhive_core.service.IssueService;
import com.prodhive_core.service.ActivityLogService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/core/issues")
public class IssueController {

    private final IssueService issueService;
    private final CurrentUser currentUser;
    private final IssueRepository issueRepository;
    private final IssueStatusHistoryRepository issueStatusHistoryRepository;
    private final ActivityLogService activityLogService;

    public IssueController(IssueService issueService, CurrentUser currentUser, IssueRepository issueRepository, IssueStatusHistoryRepository issueStatusHistoryRepository, ActivityLogService activityLogService) {
        this.issueService = issueService;
        this.currentUser = currentUser;
        this.issueRepository = issueRepository;
        this.issueStatusHistoryRepository = issueStatusHistoryRepository;
        this.activityLogService = activityLogService;
    }

    @PostMapping
    public ResponseEntity<Issue> create(@RequestBody IssueRequest req, HttpServletRequest http) {
        Long reporterId = currentUser.getUserId(http);
        return ResponseEntity.ok(issueService.create(req, reporterId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Issue> getOne(@PathVariable Long id) {
        return ResponseEntity.ok(issueService.findById(id));
    }

    @PatchMapping("/{id}/status")
    public	ResponseEntity<Issue>	updateStatus(@PathVariable	Long	id,	@RequestBody	StatusUpdateRequest	req,
                                                    HttpServletRequest	http)	{
        Long	userId	=	currentUser.getUserId(http);
        return	ResponseEntity.ok(issueService.updateStatus(id,	req.status(),	userId));
    }

    @PatchMapping("/{id}/assignee")
    public ResponseEntity<Issue> assign(@PathVariable Long id, @RequestBody AssigneeRequest req, HttpServletRequest http) {
        return ResponseEntity.ok(issueService.assign(id, req.assigneeId(), currentUser.getUserId(http)));
    }

    @GetMapping("/{id}/activity")
    public ResponseEntity<List<com.prodhive_core.entity.ActivityLog>> activity(@PathVariable Long id) {
        return ResponseEntity.ok(activityLogService.getIssueActivity(id));
    }

    @PostMapping("/{id}/subtasks")
    public ResponseEntity<Issue> createSubtask(@PathVariable Long id, @RequestBody IssueRequest	req, HttpServletRequest	http){
        Issue parent = issueService.findById(id);
        Issue subtask =	issueService.create(req, currentUser.getUserId(http));
        subtask.setParentIssue(parent);
        return	ResponseEntity.ok(issueService.save(subtask));	//	add	a	plain	save()	passthrough	in	IssueService	if	missing
    }
    @GetMapping("/{id}/subtasks")
    public ResponseEntity<List<Issue>> subtasks(@PathVariable Long id) {
        return	ResponseEntity.ok(issueRepository.findByParentIssueId(id));
    }

    @GetMapping("/{id}/history")
    public	ResponseEntity<List<IssueStatusHistory>> history(@PathVariable	Long	id)	{
        return	ResponseEntity.ok(issueStatusHistoryRepository.findByIssueIdOrderByChangedAtAsc(id));
    }

    @GetMapping
    public	ResponseEntity<List<Issue>>	list(@RequestParam	Long	boardId,
                                                  @RequestParam(required = false) Long sprintId,
                                                  @RequestParam(required = false) Long assigneeId,
                                                  @RequestParam(required = false) String	type,
                                                  @RequestParam(required = false) String	priority,
                                                  @RequestParam(required = false) Boolean	backlogOnly)	{
        if (Boolean.TRUE.equals(backlogOnly))	return	ResponseEntity.ok(issueRepository.findByBoardIdAndSprintIdIsNull(boardId));
        if	(sprintId	!=	null)	return	ResponseEntity.ok(issueRepository.findByBoardIdAndSprintId(boardId,	sprintId));
        if	(assigneeId	!=	null)	return	ResponseEntity.ok(issueRepository.findByBoardIdAndAssigneeId(boardId,	assigneeId));
        if	(type	!=	null)	return	ResponseEntity.ok(issueRepository.findByBoardIdAndType(boardId,	IssueType.valueOf(type)));
        if	(priority	!=	null)	return	ResponseEntity.ok(issueRepository.findByBoardIdAndPriority(boardId,	IssuePriority.valueOf(priority)));
        return	ResponseEntity.ok(issueRepository.findByBoardId(boardId));
    }

    @PatchMapping("/{id}/rank")
    public	ResponseEntity<Issue>	updateRank(@PathVariable Long id, @RequestBody RankUpdateRequest req) {
        return	ResponseEntity.ok(issueService.updateRank(id, req.newRank()));
    }
}
