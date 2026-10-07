package com.prodhive_core.controller;

import com.prodhive_core.entity.ProjectMember;
import com.prodhive_core.entity.ProjectRole;
import com.prodhive_core.dto.AddMemberRequest;
import com.prodhive_core.service.ProjectMemberService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/core/projects/{projectId}/members")
public	class	ProjectMemberController	{
    private	final ProjectMemberService memberService;
    public	ProjectMemberController(ProjectMemberService	memberService)	{
        this.memberService	=	memberService;
    }

    @PostMapping
    public ResponseEntity<ProjectMember> add(@PathVariable Long	projectId, @RequestBody AddMemberRequest req)	{
        return	ResponseEntity.ok(memberService.addMember(projectId,	req.userId(), ProjectRole.valueOf(req.role())));
    }

    @GetMapping
    public	ResponseEntity<List<ProjectMember>>	list(@PathVariable	Long	projectId)	{
        return	ResponseEntity.ok(memberService.listMembers(projectId));
    }

    @DeleteMapping("/{userId}")
    public	ResponseEntity<Void> remove(@PathVariable Long projectId, @PathVariable	Long userId){
        memberService.removeMember(projectId,userId);
        return	ResponseEntity.noContent().build();
    }
}
//	dto:	record	AddMemberRequest(Long	userId,	String	role)	{}
