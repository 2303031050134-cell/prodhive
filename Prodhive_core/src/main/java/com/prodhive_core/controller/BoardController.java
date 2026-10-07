package com.prodhive_core.controller;
import com.prodhive_core.dto.BoardRequest;
import com.prodhive_core.entity.Board;
import com.prodhive_core.security.CurrentUser;
import com.prodhive_core.service.BoardService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/core/boards")
public class BoardController {

    private final BoardService boardService;
    private final CurrentUser currentUser;

    public BoardController(BoardService boardService, CurrentUser currentUser) {
        this.boardService = boardService;
        this.currentUser = currentUser;
    }

    @PostMapping
    public ResponseEntity<Board> create(@RequestBody BoardRequest req, HttpServletRequest http) {
        return ResponseEntity.ok(boardService.create(req, currentUser.getRole(http), currentUser.getOrgRole(http)));
    }

    @GetMapping
    public ResponseEntity<List<Board>> listByProject(@RequestParam Long projectId) {
        return ResponseEntity.ok(boardService.findByProject(projectId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Board> getOne(@PathVariable Long id) {
        return ResponseEntity.ok(boardService.findById(id));
    }
}