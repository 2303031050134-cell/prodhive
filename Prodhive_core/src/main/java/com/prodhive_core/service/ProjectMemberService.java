package com.prodhive_core.service;


import com.prodhive_core.entity.Project;
import com.prodhive_core.entity.ProjectMember;
import com.prodhive_core.entity.ProjectRole;
import com.prodhive_core.repository.ProjectMemberRepository;
import com.prodhive_core.repository.ProjectRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public	class	ProjectMemberService	{

    private	final ProjectMemberRepository memberRepository;
    private	final ProjectRepository projectRepository;

    public	ProjectMemberService(ProjectMemberRepository	memberRepository,	ProjectRepository	projectRepository)	{
        this.memberRepository	=	memberRepository;
        this.projectRepository	=	projectRepository;
    }


    public ProjectMember addMember(Long	projectId, Long	userId, ProjectRole role)	{
        Project project	=	projectRepository.findById(projectId).orElseThrow();
        ProjectMember	member	=	new	ProjectMember();
        member.setProject(project);
        member.setUserId(userId);
        member.setRole(role);
        return	memberRepository.save(member);
    }


    public List<ProjectMember> listMembers(Long	projectId)	{
        return	memberRepository.findByProjectId(projectId);
    }


    public	void	removeMember(Long	projectId,	Long	userId)	{
        memberRepository.deleteByProjectIdAndUserId(projectId,	userId);
    }
}