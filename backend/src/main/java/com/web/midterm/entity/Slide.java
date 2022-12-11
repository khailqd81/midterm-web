package com.web.midterm.entity;

import java.util.ArrayList;
import java.util.List;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;

import com.fasterxml.jackson.annotation.JsonIgnore;

import lombok.Data;

@Entity
@Data
public class Slide {
	@Id
	@Column(name = "slide_id")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private int slideId;

	@Column(name = "heading")
	private String heading;

	@ManyToOne(cascade = { CascadeType.DETACH, CascadeType.MERGE, 
				CascadeType.PERSIST, CascadeType.REFRESH })
	@JoinColumn(name = "pre_id")
	@JsonIgnore
	private Presentation presentation;

	@Column(name = "paragraph")
	private String paragraph;

	@Column(name = "subHeading")
	private String subHeading;

	@Column(name = "typeName")
	private String typeName;

	@OneToMany(mappedBy = "slide", cascade = CascadeType.ALL)
	private List<Option> optionList = new ArrayList<>();
}
