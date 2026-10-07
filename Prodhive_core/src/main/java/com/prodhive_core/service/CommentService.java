package com.prodhive_core.service;
import com.prodhive_core.dto.CommentRequest;
import com.prodhive_core.entity.Comment;
import com.prodhive_core.entity.Issue;
import com.prodhive_core.entity.NotificationType;
import com.prodhive_core.repository.CommentRepository;
import com.prodhive_core.repository.IssueRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final IssueRepository issueRepository;
    private final NotificationService notificationService;
    private final ActivityLogService activityLogService;

    private	static final Pattern MENTION_PATTERN = Pattern.compile("@\\[(\\d+)\\]");

    public CommentService(CommentRepository commentRepository, IssueRepository issueRepository, NotificationService notificationService, ActivityLogService activityLogService) {
        this.commentRepository = commentRepository;
        this.issueRepository = issueRepository;
        this.notificationService = notificationService;
        this.activityLogService = activityLogService;
    }

    public Comment create(Long issueId, CommentRequest req, Long authorId) {
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new IllegalArgumentException("Issue not found: " + issueId));

        Comment comment = new Comment();
        comment.setBody(req.body());
        comment.setAuthorId(authorId);
        comment.setIssue(issue);
        Comment saved = commentRepository.save(comment);

        Matcher	matcher	= MENTION_PATTERN.matcher(req.body());
        while (matcher.find()) {
            Long mentionedUserId = Long.valueOf(matcher.group(1));
            if (!mentionedUserId.equals(authorId)) {
                notificationService.notify(mentionedUserId,	NotificationType.MENTIONED,
                        "You were mentioned on	"	+	issue.getIssueKey(),	"COMMENT",	saved.getId());
            }
        }
        activityLogService.log(issue.getBoard().getProject().getId(),	"ISSUE",	issue.getId(),
                "COMMENTED",	authorId,	null);
        return	saved;
    }

public List<Comment> findByIssue(Long issueId) {
        return commentRepository.findByIssueIdOrderByCreatedAtAsc(issueId);
    }
}