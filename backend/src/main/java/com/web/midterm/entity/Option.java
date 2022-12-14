package com.web.midterm.entity;

import java.util.List;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;

import com.fasterxml.jackson.annotation.JsonIgnore;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Getter
@Setter
@RequiredArgsConstructor
@ToString
public class Option {

	@Id
	@Column(name = "option_id")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private int optionId;

	@ManyToOne(fetch = FetchType.LAZY, cascade = { CascadeType.PERSIST, CascadeType.MERGE, 
			CascadeType.DETACH, CascadeType.REFRESH })
	@JoinColumn(name = "slide_id")
	@JsonIgnore
	private Slide slide;

	@OneToMany(mappedBy = "option",cascade = CascadeType.ALL)
	@JsonIgnore
	private List<UserAnswer> answerList;
	
	@Column(name = "option_name")
	private String optionName;

	@Column(name = "vote")
	private int vote;
}
