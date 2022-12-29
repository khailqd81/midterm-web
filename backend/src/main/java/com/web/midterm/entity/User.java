package com.web.midterm.entity;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToMany;
import javax.persistence.OneToMany;
import javax.persistence.Table;

import com.fasterxml.jackson.annotation.JsonIgnore;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name="user", schema="public")
@Getter
@Setter
@ToString
public class User {
	@Id
	@Column(name="user_id")
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private int userId;
	
	@Column(name="email")
	private String email;
	
	@Column(name="password")
	@JsonIgnore
	private String password;
	
	@Column(name="firstname")
	private String firstName;
	
	@Column(name="lastname")
	private String lastName;
	
	@Column(name="phone")
	private String phone;
	
	@Column(name="address")
	private String address;
	
	@Column(name="gender")
	private String gender;
	
	@Column(name="birthday")
	private Date birthday;
	
	@Column(name="enabled")
	private boolean enabled = false;
	
	@Column(name="role")
	private String role;
	
	@Column(name="provider")
	private String provider;
	
	@OneToMany(fetch = FetchType.LAZY, mappedBy = "user", cascade = CascadeType.ALL)
	@JsonIgnore
	private List<Presentation> presentationList = new ArrayList<>();
	
	@ManyToMany(fetch = FetchType.LAZY, mappedBy = "userList",cascade = { CascadeType.DETACH, CascadeType.MERGE, 
			CascadeType.PERSIST, CascadeType.REFRESH })
	@JsonIgnore
	private List<Presentation> coPresentationList = new ArrayList<>();
	
	@OneToMany(fetch = FetchType.LAZY, mappedBy = "primaryKey.user",cascade = CascadeType.ALL)
	@JsonIgnore
	private List<UserGroup> userGroup = new ArrayList<>();
	
//	@OneToMany(mappedBy = "user")
//	private List<Question> questions;
//	private List<Chat> chats;
//	private List<UserAnswer> userAnswers;
}
