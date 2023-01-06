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
import javax.persistence.JoinTable;
import javax.persistence.ManyToMany;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.OneToOne;

import com.fasterxml.jackson.annotation.JsonIgnore;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Entity
@Getter
@Setter
@ToString
public class Presentation {
	
	@Id
	@Column(name="present_id")
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private int presentId;
	
	@Column(name="present_name")
	private String presentName;
	
	@ManyToOne(cascade = { CascadeType.DETACH, CascadeType.MERGE, 
			CascadeType.PERSIST, CascadeType.REFRESH })
	@JoinColumn(name="user_id")
	private User user;
	
	@OneToMany(mappedBy = "presentation", cascade = CascadeType.ALL)
	private List<Slide> slideList = new ArrayList<>();
	
	@OneToOne(cascade = { CascadeType.DETACH, CascadeType.MERGE, 
			CascadeType.PERSIST, CascadeType.REFRESH })
	@JoinColumn(name="group_id")
	@JsonIgnore
	private Group group;
	
	@Column(name="created_at")
	private Date createdAt;
	
	@Column(name = "is_deleted")
	private boolean isDeleted;
	
	@ManyToMany(cascade = { CascadeType.DETACH, CascadeType.MERGE, 
			CascadeType.PERSIST, CascadeType.REFRESH })
	@JoinTable(
	        name = "user_presentation", 
	        joinColumns = { @JoinColumn(name = "present_id") }, 
	        inverseJoinColumns = { @JoinColumn(name = "user_id") }
	    )
	@JsonIgnore
	private List<User> userList;
	
	@Column(name = "is_public")
	private boolean isPublic;
	
	@OneToOne(cascade = { CascadeType.DETACH, CascadeType.MERGE, 
			CascadeType.PERSIST, CascadeType.REFRESH })
	@JoinColumn(name="current_slide_id", referencedColumnName = "slide_id")
	private Slide currentSlide;
	
	@OneToMany(mappedBy = "present")
	@JsonIgnore
	private List<Chat> chatList;
	
	@OneToMany(mappedBy = "present")
	private List<Question> questionList;
}
