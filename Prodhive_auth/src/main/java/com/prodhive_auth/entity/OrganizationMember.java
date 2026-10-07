package com.prodhive_auth.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "organization_members")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class OrganizationMember {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "organization_id",nullable = false)
    private Organization organization;

    @ManyToOne
    @JoinColumn(name = "user_id",nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrgRole role = OrgRole.MEMBER;

    @Column(nullable = false,updatable = false)
    private Instant joinedAt = Instant.now();
}
