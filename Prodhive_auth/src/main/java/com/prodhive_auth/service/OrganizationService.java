package com.prodhive_auth.service;

import com.prodhive_auth.dto.OrgMembershipView;
import com.prodhive_auth.entity.Invitation;
import com.prodhive_auth.entity.OrgRole;
import com.prodhive_auth.entity.Organization;
import com.prodhive_auth.entity.OrganizationMember;
import com.prodhive_auth.entity.Role;
import com.prodhive_auth.entity.User;
import com.prodhive_auth.repository.InvitationRepository;
import com.prodhive_auth.repository.OrganizationMemberRepository;
import com.prodhive_auth.repository.OrganizationRepository;
import com.prodhive_auth.repository.UserRepository;
import com.prodhive_auth.security.JwtUtil;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
public class OrganizationService {

    private static final String CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous chars
    private static final SecureRandom RANDOM = new SecureRandom();

    private final OrganizationRepository organizationRepository;
    private final OrganizationMemberRepository organizationMemberRepository;
    private final InvitationRepository invitationRepository;
    private final UserRepository userRepository;
    private final JwtUtil jwt;

    public OrganizationService(OrganizationRepository organizationRepository,
            OrganizationMemberRepository organizationMemberRepository, InvitationRepository invitationRepository,
            UserRepository userRepository, JwtUtil jwt) {
        this.organizationRepository = organizationRepository;
        this.organizationMemberRepository = organizationMemberRepository;
        this.invitationRepository = invitationRepository;
        this.userRepository = userRepository;
        this.jwt = jwt;
    }

    public Organization create(String name, String slug, Long ownerId) {
        Organization org = new Organization();
        org.setName(name);
        org.setSlug(slug);
        org.setOwnerId(ownerId);
        org.setJoinCode(generateJoinCode());
        Organization saved = organizationRepository.save(org);

        OrganizationMember member = new OrganizationMember();
        member.setOrganization(saved);
        member.setUser(userRepository.findById(ownerId).orElseThrow());
        member.setRole(OrgRole.OWNER);
        organizationMemberRepository.save(member);
        User owner = member.getUser();
        owner.setRole(Role.PROJECT_MANAGER);
        userRepository.save(owner);

        return saved;
    }

    public List<OrgMembershipView> listMine(Long userId) {
        return organizationMemberRepository.findByUserId(userId).stream()
                .map(m -> new OrgMembershipView(
                        m.getOrganization().getId(),
                        m.getOrganization().getName(),
                        m.getOrganization().getSlug(),
                        m.getRole().name(),
                        (long) organizationMemberRepository.findByOrganizationId(m.getOrganization().getId()).size()))
                .toList();
    }

    public Organization switchTo(Long orgId, Long userId) {
        OrganizationMember membership = organizationMemberRepository.findByOrganizationIdAndUserId(orgId, userId)
                .orElseThrow(() -> new IllegalArgumentException("You are not a member of this organization"));
        return membership.getOrganization();
    }

    public OrgRole roleIn(Long orgId, Long userId) {
        return organizationMemberRepository.findByOrganizationIdAndUserId(orgId, userId)
                .map(OrganizationMember::getRole)
                .orElseThrow(() -> new IllegalArgumentException("You are not a member of this organization"));
    }

    public String tokenFor(Long userId, Long orgId) {
        User user = userRepository.findById(userId).orElseThrow();
        String orgRole = organizationMemberRepository.findByOrganizationIdAndUserId(orgId, userId)
                .map(m -> m.getRole().name()).orElse(null);
        return jwt.generateToken(user.getEmail(), user.getRole().name(), user.getId(), orgId, orgRole);
    }

    public List<OrganizationMember> listMember(Long orgId) {
        return organizationMemberRepository.findByOrganizationId(orgId);
    }

    public Invitation invite(Long orgId, String email, OrgRole role, Long invitedBy) {
        Organization org = organizationRepository.findById(orgId).orElseThrow();
        Invitation invitation = new Invitation();
        invitation.setOrganization(org);
        invitation.setEmail(email);
        invitation.setToken(UUID.randomUUID().toString());
        invitation.setRole(role);
        invitation.setInvitedBy(invitedBy);
        invitation.setExpiresAt(Instant.now().plus(7, ChronoUnit.DAYS));
        return invitationRepository.save(invitation);

    }

    public OrganizationMember acceptInvitation(String token, Long acceptingUserId) {
        Invitation invitation = invitationRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid invitation token"));

        if (invitation.getAcceptedAt() != null)
            throw new IllegalArgumentException("Invitation	already	used");
        if (invitation.getExpiresAt().isBefore(Instant.now()))
            throw new IllegalArgumentException("Invitation	expired");
        invitation.setAcceptedAt(Instant.now());
        invitationRepository.save(invitation);
        OrganizationMember member = new OrganizationMember();
        member.setOrganization(invitation.getOrganization());
        member.setUser(userRepository.findById(acceptingUserId).orElseThrow());
        member.setRole(invitation.getRole());
        return organizationMemberRepository.save(member);
    }

    public OrganizationMember joinByCode(String code, Long joiningUserId) {
        Organization org = organizationRepository.findByJoinCode(code.trim().toUpperCase())
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired invite link"));

        if (organizationMemberRepository.findByOrganizationIdAndUserId(org.getId(), joiningUserId).isPresent()) {
            throw new IllegalArgumentException("You're already a member of this organization");
        }

        OrganizationMember member = new OrganizationMember();
        member.setOrganization(org);
        member.setUser(userRepository.findById(joiningUserId).orElseThrow());
        member.setRole(OrgRole.MEMBER);
        return organizationMemberRepository.save(member);
    }

    public String joinCodeFor(Long orgId) {
        Organization org = organizationRepository.findById(orgId).orElseThrow();
        if (org.getJoinCode() == null) {
            org.setJoinCode(generateJoinCode());
            organizationRepository.save(org);
        }
        return org.getJoinCode();
    }

    public String regenerateJoinCode(Long orgId) {
        Organization org = organizationRepository.findById(orgId).orElseThrow();
        org.setJoinCode(generateJoinCode());
        organizationRepository.save(org);
        return org.getJoinCode();
    }

    private String generateJoinCode() {
        String code;
        do {
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < 8; i++)
                sb.append(CODE_CHARS.charAt(RANDOM.nextInt(CODE_CHARS.length())));
            code = sb.toString();
        } while (organizationRepository.findByJoinCode(code).isPresent());
        return code;
    }
}
