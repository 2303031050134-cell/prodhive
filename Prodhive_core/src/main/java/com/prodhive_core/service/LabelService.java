package com.prodhive_core.service;
import com.prodhive_core.entity.*;
import com.prodhive_core.repository.*;
import org.springframework.stereotype.Service;
import java.util.List;
@Service
public class LabelService {
    private final LabelRepository labels; private final ProjectRepository projects; private final IssueRepository issues;
    public LabelService(LabelRepository labels, ProjectRepository projects, IssueRepository issues) { this.labels=labels; this.projects=projects; this.issues=issues; }
    public Label create(Long projectId, String name, String color) { Label label=new Label(); label.setProject(projects.findById(projectId).orElseThrow()); label.setName(name); label.setColor(color); return labels.save(label); }
    public List<Label> list(Long projectId) { return labels.findByProjectId(projectId); }
    public void delete(Long id) { labels.deleteById(id); }
    public Issue addToIssue(Long issueId, Long labelId) { Issue issue=issues.findById(issueId).orElseThrow(); issue.getLabels().add(labels.findById(labelId).orElseThrow()); return issues.save(issue); }
    public Issue removeFromIssue(Long issueId, Long labelId) { Issue issue=issues.findById(issueId).orElseThrow(); issue.getLabels().removeIf(label -> label.getId().equals(labelId)); return issues.save(issue); }
}
