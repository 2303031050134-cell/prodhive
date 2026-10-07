package com.prodhive_core.controller;

import com.prodhive_core.entity.Attachment;
import com.prodhive_core.security.CurrentUser;
import com.prodhive_core.service.AttachmentService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/core/issues/{issueId}/attachments")
public class AttachmentController {

    private	final AttachmentService	attachmentService;
    private	final CurrentUser currentUser;

    public AttachmentController(AttachmentService attachmentService, CurrentUser	currentUser)	{
        this.attachmentService = attachmentService;
        this.currentUser = currentUser;
    }

    @PostMapping
    public ResponseEntity<Attachment> upload(@PathVariable Long	issueId, @RequestParam("file") MultipartFile file, HttpServletRequest http)	{
        Long userId	= currentUser.getUserId(http);
        return	ResponseEntity.ok(attachmentService.store(issueId, file, userId));
    }
    @GetMapping
    public	ResponseEntity<List<Attachment>> list(@PathVariable	Long	issueId)	{
        return	ResponseEntity.ok(attachmentService.findByIssue(issueId));
    }
}