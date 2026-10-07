package com.prodhive_auth.repository;

import com.prodhive_auth.entity.OrganizationMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public	interface	OrganizationMemberRepository	extends JpaRepository<OrganizationMember,	Long> {
    List<OrganizationMember> findByOrganizationId(Long	orgId);
    List<OrganizationMember>	findByUserId(Long	userId);
    Optional<OrganizationMember> findByOrganizationIdAndUserId(Long	orgId, Long	userId);
}