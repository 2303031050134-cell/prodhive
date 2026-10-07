package com.prodhive_core.repository;

import com.prodhive_core.entity.Issue;
import com.prodhive_core.entity.IssuePriority;
import com.prodhive_core.entity.IssueType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface IssueRepository extends JpaRepository<Issue, Long>	{
    List<Issue>	findByBoardId(Long	boardId);
    List<Issue>	findByBoardIdAndSprintId(Long	boardId,	Long	sprintId);
    List<Issue>	findByBoardIdAndSprintIdIsNull(Long	boardId);	//	backlog
    List<Issue>	findByBoardIdAndAssigneeId(Long	boardId,	Long	assigneeId);
    List<Issue>	findByBoardIdAndType(Long	boardId,	IssueType type);
    List<Issue>	findByBoardIdAndPriority(Long	boardId,	IssuePriority priority);
    List<Issue>	findByBoardIdAndSprintIdIsNullOrderByRankAsc(Long	boardId);

    List<Issue> findBySprintId(Long sprintId);

    List<Issue> findByParentIssueId(Long id);

    @Query("SELECT	i	FROM	Issue	i	WHERE	i.board.project.id	=	:projectId	AND	"	+
            "(LOWER(i.title)	LIKE	LOWER(CONCAT('%',	:q,	'%'))	OR	"	+
            "	LOWER(i.description)	LIKE	LOWER(CONCAT('%',	:q,	'%'))	OR	"	+
            "	LOWER(i.issueKey)	LIKE	LOWER(CONCAT('%',	:q,	'%')))")
    List<Issue>	search(@Param("projectId")	Long	projectId, @Param("q")	String	query);

    List<Issue>	findByAssigneeId(Long	assigneeId);

}
