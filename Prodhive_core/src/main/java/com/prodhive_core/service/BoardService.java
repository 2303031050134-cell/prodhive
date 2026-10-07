package com.prodhive_core.service;
import com.prodhive_core.dto.BoardRequest;
import com.prodhive_core.entity.Board;
import com.prodhive_core.entity.Project;
import com.prodhive_core.exception.ForbiddenException;
import com.prodhive_core.repository.BoardRepository;
import com.prodhive_core.repository.ProjectRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class BoardService {

    private final BoardRepository boardRepository;
    private final ProjectRepository projectRepository;

    public BoardService(BoardRepository boardRepository, ProjectRepository projectRepository) {
        this.boardRepository = boardRepository;
        this.projectRepository = projectRepository;
    }

    public Board create(BoardRequest req, String role, String orgRole) {
        boolean globallyAllowed = "ADMIN".equals(role) || "PROJECT_MANAGER".equals(role);
        boolean orgAllowed = "OWNER".equals(orgRole) || "ADMIN".equals(orgRole);
        if (!globallyAllowed && !orgAllowed) {
            throw new ForbiddenException("Only workspace owners, admins, or PMs can create boards");
        }
        if (req.projectId() == null) {
            throw new IllegalArgumentException("A project is required to create a board");
        }
        Project project = projectRepository.findById(req.projectId())
                .orElseThrow(() -> new IllegalArgumentException("Project not found: " + req.projectId()));

        Board board = new Board();
        board.setName(req.name());
        board.setProject(project);
        return boardRepository.save(board);
    }

    public List<Board> findByProject(Long projectId) {
        return boardRepository.findByProjectId(projectId);
    }

    public Board findById(Long id) {
        return boardRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Board not found: " + id));
    }
}