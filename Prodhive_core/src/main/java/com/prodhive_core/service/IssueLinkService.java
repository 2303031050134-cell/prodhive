package com.prodhive_core.service;
import com.prodhive_core.entity.*;
import com.prodhive_core.repository.*;
import org.springframework.stereotype.Service;
import java.util.List;
@Service
public class IssueLinkService {
    private final IssueLinkRepository links; private final IssueRepository issues;
    public IssueLinkService(IssueLinkRepository links, IssueRepository issues) { this.links=links; this.issues=issues; }
    public IssueLink create(Long sourceId, Long targetId, LinkType type) {
        if (sourceId.equals(targetId)) throw new IllegalArgumentException("An issue cannot link to itself");
        IssueLink link=new IssueLink(); link.setSourceIssue(issues.findById(sourceId).orElseThrow()); link.setTargetIssue(issues.findById(targetId).orElseThrow()); link.setLinkType(type); return links.save(link);
    }
    public List<IssueLink> list(Long issueId) { return links.findBySourceIssueIdOrTargetIssueId(issueId, issueId); }
}
