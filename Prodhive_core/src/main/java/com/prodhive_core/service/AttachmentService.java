package com.prodhive_core.service;

import com.prodhive_core.entity.Attachment;
import com.prodhive_core.entity.Issue;
import com.prodhive_core.repository.AttachmentRepository;
import com.prodhive_core.repository.IssueRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import	java.util.UUID;
@Service
public class AttachmentService	{

    private	final AttachmentRepository attachmentRepository;
    private	final IssueRepository issueRepository;
    private	final Path uploadDir = Paths.get("uploads");

    public	AttachmentService(AttachmentRepository	attachmentRepository, IssueRepository	issueRepository)	{
        this.attachmentRepository =	attachmentRepository;
        this.issueRepository = issueRepository;
    }

    public Attachment store(Long issueId, MultipartFile file, Long userId){
        try	{
            Files.createDirectories(uploadDir);
            String	storedName	=	UUID.randomUUID()	+	"-"	+	file.getOriginalFilename();
            Files.copy(file.getInputStream(), uploadDir.resolve(storedName));
            Issue issue	= issueRepository.findById(issueId).orElseThrow();
            Attachment	attachment	=	new	Attachment();
            attachment.setIssue(issue);
            attachment.setFileName(file.getOriginalFilename());
            attachment.setFileUrl("/uploads/"	+	storedName);
            attachment.setUploadedBy(userId);
            return	attachmentRepository.save(attachment);
        }	catch(IOException e){
            throw	new	RuntimeException("Failed	to	store	file",	e);
        }
    }
    public List<Attachment> findByIssue(Long	issueId)	{
        return	attachmentRepository.findByIssueId(issueId);
    }
}
