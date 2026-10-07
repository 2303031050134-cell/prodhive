package com.prodhive_auth.controller;

import com.prodhive_auth.dto.JoinCodeResponse;
import com.prodhive_auth.dto.OrgMembershipView;
import com.prodhive_auth.dto.OrgWithToken;
import com.prodhive_auth.entity.Invitation;
import com.prodhive_auth.entity.OrgRole;
import com.prodhive_auth.entity.Organization;
import com.prodhive_auth.entity.OrganizationMember;
import com.prodhive_auth.service.OrganizationService;
import com.prodhive_auth.security.CurrentUser;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/organizations")
public	class	OrganizationController	{
    private	final OrganizationService orgService;
    private	final	CurrentUser	currentUser;


    public	OrganizationController(OrganizationService	orgService,	CurrentUser	currentUser)	{
        this.orgService	=	orgService;
        this.currentUser	=	currentUser;
    }

    @PostMapping
    public ResponseEntity<OrgWithToken> create(@RequestBody CreateOrgRequest	req, HttpServletRequest http)	{
        Long userId	=	currentUser.getUserId(http);
        Organization org = orgService.create(req.name(),	req.slug(),	userId);
        // Immediately switch context to the new org so the user can create projects right away, no re-login needed.
        String token = orgService.tokenFor(userId, org.getId());
        return	ResponseEntity.ok(new OrgWithToken(org, "OWNER", token));
    }

    
    @GetMapping("/mine")
    public ResponseEntity<List<OrgMembershipView>> mine(HttpServletRequest http) {
        Long userId = currentUser.getUserId(http);
        return ResponseEntity.ok(orgService.listMine(userId));
    }

   
    @PostMapping("/{id}/switch")
    public ResponseEntity<OrgWithToken> switchTo(@PathVariable Long id, HttpServletRequest http) {
        Long userId = currentUser.getUserId(http);
        Organization org = orgService.switchTo(id, userId);
        OrgRole role = orgService.roleIn(id, userId);
        String token = orgService.tokenFor(userId, id);
        return ResponseEntity.ok(new OrgWithToken(org, role.name(), token));
    }


    @GetMapping("/{id}/members")
    public ResponseEntity<List<OrganizationMember>>	members(@PathVariable	Long	id)	{
        return	ResponseEntity.ok(orgService.listMember(id));
    }


    @PostMapping("/{id}/invitations")
    public ResponseEntity<Invitation> invite(@PathVariable Long	id, @RequestBody InviteRequest req, HttpServletRequest http){
        Long userId	= currentUser.getUserId(http);
        return ResponseEntity.ok(orgService.invite(id, req.email(),	OrgRole.valueOf(req.role()), userId));
    }


    @PostMapping("/invitations/{token}/accept")
    public ResponseEntity<OrgWithToken> accept(@PathVariable String token, HttpServletRequest	http){
        Long userId	= currentUser.getUserId(http);
        OrganizationMember membership = orgService.acceptInvitation(token, userId);
        String freshToken = orgService.tokenFor(userId, membership.getOrganization().getId());
        return ResponseEntity.ok(new OrgWithToken(membership.getOrganization(), membership.getRole().name(), freshToken));
    }

    
    @GetMapping("/{id}/join-code")
    public ResponseEntity<JoinCodeResponse> joinCode(@PathVariable Long id, HttpServletRequest http) {
        requireManager(id, http);
        return ResponseEntity.ok(new JoinCodeResponse(orgService.joinCodeFor(id)));
    }

    @PostMapping("/{id}/join-code/regenerate")
    public ResponseEntity<JoinCodeResponse> regenerateJoinCode(@PathVariable Long id, HttpServletRequest http) {
        requireManager(id, http);
        return ResponseEntity.ok(new JoinCodeResponse(orgService.regenerateJoinCode(id)));
    }

    private void requireManager(Long orgId, HttpServletRequest http) {
        Long userId = currentUser.getUserId(http);
        OrgRole role = orgService.roleIn(orgId, userId);
        if (role != OrgRole.OWNER && role != OrgRole.ADMIN) {
            throw new IllegalArgumentException("Only owners or admins can manage the invite link");
        }
    }

    @PostMapping("/join/{code}")
    public ResponseEntity<OrgWithToken> joinByCode(@PathVariable String code, HttpServletRequest http) {
        Long userId = currentUser.getUserId(http);
        OrganizationMember membership = orgService.joinByCode(code, userId);
        String token = orgService.tokenFor(userId, membership.getOrganization().getId());
        return ResponseEntity.ok(new OrgWithToken(membership.getOrganization(), membership.getRole().name(), token));
    }
}
//	dto/CreateOrgRequest.java
record	CreateOrgRequest(String	name, String slug)	{

}
//	dto/InviteRequest.java
record	InviteRequest(String email,	String role)	{

}
