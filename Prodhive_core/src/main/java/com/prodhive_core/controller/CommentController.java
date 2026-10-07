package com.prodhive_core.controller;
import com.prodhive_core.dto.CommentRequest;
import com.prodhive_core.entity.Comment;
import com.prodhive_core.security.CurrentUser;
import com.prodhive_core.service.CommentService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/core/issues/{issueId}/comments")
public class CommentController {

    private final CommentService commentService;
    private final CurrentUser currentUser;

    public CommentController(CommentService commentService, CurrentUser currentUser) {
        this.commentService = commentService;
        this.currentUser = currentUser;
    }

    @PostMapping
    public ResponseEntity<Comment> create(@PathVariable Long issueId, @RequestBody CommentRequest req,
                                          HttpServletRequest http) {
        Long authorId = currentUser.getUserId(http);
        return ResponseEntity.ok(commentService.create(issueId, req, authorId));
    }

    @GetMapping
    public ResponseEntity<List<Comment>> list(@PathVariable Long issueId) {
        return ResponseEntity.ok(commentService.findByIssue(issueId));
    }
}