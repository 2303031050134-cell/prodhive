package com.prodhive_auth.entity;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public	class	Organization	{
    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    private	Long id;


    @Column(nullable=false)
    private	String	name;


    @Column(nullable=false,	unique=true)
    private	String	slug;	//	url-safe,	e.g.	"acme-corp"
    @Column(nullable=false)
    private	Long ownerId;	//	User.id	who	created	it
    @Column(nullable=false,	updatable=false)
    private Instant createdAt=Instant.now();

    @Column(unique = true)
    private String joinCode; // shareable code, anyone with it can self-join as MEMBER
}