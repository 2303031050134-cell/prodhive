package com.prodhive_core.service;
import com.prodhive_core.dto.SprintRequest;
import com.prodhive_core.entity.*;
import com.prodhive_core.exception.ForbiddenException;
import com.prodhive_core.repository.BoardRepository;
import com.prodhive_core.repository.IssueRepository;
import com.prodhive_core.repository.SprintCapacityRepository;
import com.prodhive_core.repository.SprintRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;

@Service
public class SprintService {

    private final SprintRepository sprintRepository;
    private final BoardRepository boardRepository;
    private final IssueRepository issueRepository;
    private final SprintCapacityRepository sprintCapacityRepository;

    public SprintService(SprintRepository sprintRepository, BoardRepository boardRepository,
                         IssueRepository issueRepository, SprintCapacityRepository sprintCapacityRepository) {
        this.sprintRepository = sprintRepository;
        this.boardRepository = boardRepository;
        this.issueRepository = issueRepository;
        this.sprintCapacityRepository = sprintCapacityRepository;
    }

    public Sprint create(SprintRequest req, String role, String orgRole) {
        boolean globallyAllowed = "ADMIN".equals(role) || "PROJECT_MANAGER".equals(role);
        boolean orgAllowed = "OWNER".equals(orgRole) || "ADMIN".equals(orgRole);
        if (!globallyAllowed && !orgAllowed) {
            throw new ForbiddenException("Only workspace owners, admins, or PMs can create sprints");
        }
        if (req.boardId() == null) {
            throw new IllegalArgumentException("A board is required to create a sprint");
        }
        Board board = boardRepository.findById(req.boardId())
                .orElseThrow(() -> new IllegalArgumentException("Board not found: " + req.boardId()));

        Sprint sprint = new Sprint();
        sprint.setName(req.name());
        sprint.setBoard(board);
        sprint.setStartDate(req.startDate());
        sprint.setEndDate(req.endDate());
        return sprintRepository.save(sprint);
    }

    public List<Sprint> findByBoard(Long boardId) {
        return sprintRepository.findByBoardId(boardId);
    }

    public Sprint findById(Long id) {
        return sprintRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Sprint not found: " + id));
    }

    public Sprint start(Long id) {
        Sprint sprint = findById(id);
        sprint.setStatus(SprintStatus.ACTIVE);
        return sprintRepository.save(sprint);
    }

    public Sprint complete(Long id) {
        Sprint sprint = findById(id);
        sprint.setStatus(SprintStatus.COMPLETED);
        sprintRepository.save(sprint);

        // roll incomplete issues back to the backlog
        List<Issue> issues = issueRepository.findBySprintId(id);
        for (Issue issue : issues) {
            if (issue.getStatus() != IssueStatus.DONE) {
                issue.setSprint(null);
                issueRepository.save(issue);
            }
        }
        return sprint;
    }

    /**
     * Sets the planned capacity for a sprint and takes a snapshot of committed work.
     */
    public SprintCapacity setCapacity(Long sprintId, double capacity) {
        Sprint sprint = findById(sprintId);
        SprintCapacity record = sprintCapacityRepository.findBySprintId(sprintId)
                .orElseGet(SprintCapacity::new);
        record.setSprint(sprint);
        record.setCapacity(capacity);
        record.setCommitted(issueRepository.findBySprintId(sprintId).size());
        return sprintCapacityRepository.save(record);
    }

    /**
     * Returns the capacity summary and whether the sprint is over-committed.
     */
    public Map<String, Object> capacityStatus(Long sprintId) {
        SprintCapacity record = sprintCapacityRepository.findBySprintId(sprintId)
                .orElseThrow(() -> new IllegalArgumentException("No capacity set for sprint: " + sprintId));
        return Map.of(
                "sprintId", sprintId,
                "capacity", record.getCapacity(),
                "committed", record.getCommitted(),
                "overCommitted", record.isOverCommitted()
        );
    }
}