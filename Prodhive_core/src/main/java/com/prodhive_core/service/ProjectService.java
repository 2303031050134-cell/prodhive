package com.prodhive_core.service;
import com.prodhive_core.dto.ProjectRequest;
import com.prodhive_core.entity.Project;
import com.prodhive_core.exception.ForbiddenException;
import com.prodhive_core.repository.ProjectRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;

    public ProjectService(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }

    public Project create(ProjectRequest req, Long userId, String role, String orgRole) {
        boolean globallyAllowed = "ADMIN".equals(role) || "PROJECT_MANAGER".equals(role);
        boolean orgAllowed = "OWNER".equals(orgRole) || "ADMIN".equals(orgRole);
        if (!globallyAllowed && !orgAllowed) {
            throw new ForbiddenException("Only workspace owners, admins, or PMs can create projects");
        }
        Project project = new Project();
        project.setName(req.name());
        project.setKey(req.key());
        project.setDescription(req.description());
        project.setOwnerId(userId);
        project.setOrganizationId(req.organizationId());
        return projectRepository.save(project);
    }

    public List<Project> findAll() {
        return projectRepository.findAll();
    }

    /** Projects visible to the caller's active organization only — never leak another org's projects. */
    public List<Project> findForOrganization(Long organizationId) {
        if (organizationId == null) return List.of();
        return projectRepository.findByOrganizationId(organizationId);
    }

    public Project findById(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Project not found: " + id));
    }

    public void delete(Long id, String role) {
        if (!role.equals("ADMIN")) {
            throw new ForbiddenException("Only Admins can delete projects");
        }
        projectRepository.deleteById(id);
    }

    public Project update(Long id, String name, String description){
        Project	project	= findById(id);
        if(name	!=	null) project.setName(name);
        if(description	!=	null) project.setDescription(description);
        return	projectRepository.save(project);
    }
    public	Project	archive(Long id){
        Project	project	= findById(id);
        project.setArchived(true);
        return	projectRepository.save(project);
    }

}
