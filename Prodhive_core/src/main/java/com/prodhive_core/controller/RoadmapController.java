package com.prodhive_core.controller;

import com.prodhive_core.entity.Project;
import com.prodhive_core.entity.Roadmap;
import com.prodhive_core.repository.ProjectRepository;
import com.prodhive_core.repository.RoadmapRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/core/projects/{projectId}/roadmap")
public class RoadmapController {

    private final RoadmapRepository roadmapRepository;
    private final ProjectRepository projectRepository;

    public RoadmapController(RoadmapRepository roadmapRepository, ProjectRepository projectRepository) {
        this.roadmapRepository = roadmapRepository;
        this.projectRepository = projectRepository;
    }

    @GetMapping
    public ResponseEntity<List<Roadmap>> list(@PathVariable Long projectId) {
        return ResponseEntity.ok(roadmapRepository.findByProjectIdOrderByTargetDateAsc(projectId));
    }

    @PostMapping
    public ResponseEntity<Roadmap> create(@PathVariable Long projectId, @RequestBody RoadmapRequest req) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found: " + projectId));
        Roadmap item = new Roadmap();
        item.setProject(project);
        item.setTitle(req.title());
        item.setDescription(req.description());
        item.setTargetDate(req.targetDate());
        if (req.sortOrder() != null) {
            item.setSortOrder(req.sortOrder());
        }
        return ResponseEntity.ok(roadmapRepository.save(item));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        roadmapRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    public record RoadmapRequest(String title, String description, LocalDate targetDate, Integer sortOrder) {}
}