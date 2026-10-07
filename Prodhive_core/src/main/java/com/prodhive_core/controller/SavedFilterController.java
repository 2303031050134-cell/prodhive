package com.prodhive_core.controller;

import com.prodhive_core.entity.SavedFilter;
import com.prodhive_core.repository.SavedFilterRepository;
import com.prodhive_core.security.CurrentUser;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/core/projects/{projectId}/saved-filters")
public class SavedFilterController {

    private final SavedFilterRepository savedFilterRepository;
    private final CurrentUser currentUser;

    public SavedFilterController(SavedFilterRepository savedFilterRepository, CurrentUser currentUser) {
        this.savedFilterRepository = savedFilterRepository;
        this.currentUser = currentUser;
    }

    @GetMapping
    public ResponseEntity<List<SavedFilter>> list(@PathVariable Long projectId, HttpServletRequest http) {
        Long userId = currentUser.getUserId(http);
        return ResponseEntity.ok(savedFilterRepository.findByUserIdAndProjectId(userId, projectId));
    }

    @PostMapping
    public ResponseEntity<SavedFilter> create(@PathVariable Long projectId,
                                              @RequestBody FilterRequest req,
                                              HttpServletRequest http) {
        Long userId = currentUser.getUserId(http);
        SavedFilter filter = new SavedFilter();
        filter.setUserId(userId);
        filter.setProjectId(projectId);
        filter.setName(req.name());
        filter.setFilterJson(req.filterJson());
        return ResponseEntity.ok(savedFilterRepository.save(filter));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        savedFilterRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    public record FilterRequest(String name, String filterJson) {}
}