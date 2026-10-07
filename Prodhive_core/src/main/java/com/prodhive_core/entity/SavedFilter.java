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
public class SavedFilter {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private	Long id;

    @Column(nullable = false)
    private	Long userId;

    @Column(nullable = false)
    private	Long projectId;

    @Column(nullable = false)
    private	String	name;

    @Column(nullable = false, length = 1000)
    private	String filterJson;	//	e.g.	{"assigneeId":5,"priority":"HIGH"}
}
