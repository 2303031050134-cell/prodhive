package com.prodhive_core.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public	class	Label	{
    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    private	Long id;

    @Column(nullable=false)
    private	String name;

    @Column(nullable=false)
    private	String color;	//	hex,	e.g.	"#0B3D91"

    @ManyToOne
    @JoinColumn(name="project_id", nullable=false)
    private	Project	project;
}