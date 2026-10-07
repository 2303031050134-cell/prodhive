package com.prodhive_auth.repository;

import com.prodhive_auth.entity.Organization;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public	interface	OrganizationRepository	extends JpaRepository<Organization,	Long> {
    Optional<Organization> findBySlug(String	slug);
    Optional<Organization> findByJoinCode(String joinCode);
}