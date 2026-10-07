package com.prodhive_auth.controller;

import com.prodhive_auth.dto.UserSummary;
import com.prodhive_auth.entity.User;
import com.prodhive_auth.repository.UserRepository;
import com.prodhive_auth.security.CurrentUser;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository users;
    private final CurrentUser currentUser;

    public UserController(UserRepository users, CurrentUser currentUser) {
        this.users = users;
        this.currentUser = currentUser;
    }

    
    @GetMapping("/by-ids")
    public ResponseEntity<List<UserSummary>> byIds(@RequestParam String ids) {
        List<Long> parsed = Arrays.stream(ids.split(","))
                .filter(s -> !s.isBlank())
                .map(String::trim)
                .map(Long::valueOf)
                .toList();
        List<UserSummary> result = users.findByIdIn(parsed).stream()
                .map(u -> new UserSummary(u.getId(), u.getFullName(), u.getEmail(), u.getGithubUsername()))
                .toList();
        return ResponseEntity.ok(result);
    }

    @GetMapping("/search")
    public ResponseEntity<List<UserSummary>> search(@RequestParam String q) {
        List<User> matches = users.findByFullNameContainingIgnoreCaseOrEmailContainingIgnoreCase(q, q);
        List<UserSummary> result = matches.stream()
                .limit(20)
                .map(u -> new UserSummary(u.getId(), u.getFullName(), u.getEmail(), u.getGithubUsername()))
                .toList();
        return ResponseEntity.ok(result);
    }

    /** Lets the signed-in user link their own GitHub username so they can be requested as a PR reviewer. */
    @PatchMapping("/me/github-username")
    public ResponseEntity<UserSummary> setGithubUsername(@RequestBody GithubUsernameRequest req, HttpServletRequest http) {
        Long userId = currentUser.getUserId(http);
        User user = users.findById(userId).orElseThrow();
        String value = req.githubUsername() == null ? null : req.githubUsername().trim();
        user.setGithubUsername(value == null || value.isEmpty() ? null : value);
        users.save(user);
        return ResponseEntity.ok(new UserSummary(user.getId(), user.getFullName(), user.getEmail(), user.getGithubUsername()));
    }

    public record GithubUsernameRequest(String githubUsername) {}
}
