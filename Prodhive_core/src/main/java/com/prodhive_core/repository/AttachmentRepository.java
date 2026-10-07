package com.prodhive_core.repository;

import com.prodhive_core.entity.Attachment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
public interface AttachmentRepository extends JpaRepository<Attachment, Long> {
    List<Attachment> findByIssueId(Long issueId);
}
