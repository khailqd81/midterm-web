package com.web.midterm.entity;

import java.util.ArrayList;
import java.util.Date;
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

import lombok.Data;

@Entity
@Data
public class Presentation {
	@Id
	@Column(name="pre_id")
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private int preId;
	@Column(name="pre_name")
	private String preName;
	
	@ManyToOne(cascade = { CascadeType.DETACH, CascadeType.MERGE, 
			CascadeType.PERSIST, CascadeType.REFRESH })
	@JoinColumn(name="user_id")
	private User user;
	
	@OneToMany(mappedBy = "presentation", cascade = CascadeType.ALL)
	private List<Slide> slideList = new ArrayList<>();
	
	@Column(name="group_id")
	private int groupId;
	
	@Column(name="created_at")
	private Date createdAt;
}
