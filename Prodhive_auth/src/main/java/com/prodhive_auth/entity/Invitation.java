package com.prodhive_auth.entity;

import	jakarta.persistence.*;
import	lombok.*;
import	java.time.Instant;


@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public	class	Invitation	{

    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private	Long id;

    @ManyToOne
    @JoinColumn(name="organization_id",	nullable=false)
    private	Organization organization;

    @Column(nullable=false)
    private	String	email;

    @Column(nullable=false,	unique=true)
    private	String	token;

    @Enumerated(EnumType.STRING)
    @Column(nullable=false)

    private	OrgRole	role=OrgRole.MEMBER;

    @Column(nullable=false)
    private	Long invitedBy;

    @Column(nullable=false)

    private	Instant	expiresAt;

    private	Instant	acceptedAt;	//	null	until	accepted

    @Column(nullable=false,	updatable=false)
    private	Instant	createdAt=Instant.now();
}