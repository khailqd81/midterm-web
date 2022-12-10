package com.web.midterm.entity;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;

import com.fasterxml.jackson.annotation.JsonIgnore;

import lombok.Data;

@Entity
@Data
public class Option {
	
	@Id
	@Column(name="option_id")
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private int optionId;
	
	@ManyToOne(cascade = CascadeType.ALL)
	@JoinColumn(name="slide_id")
	@JsonIgnore
	private Slide slide;
	
	@Column(name="option_name")
	private String optionName;
	
	@Column(name="vote")
	private int vote;
}
