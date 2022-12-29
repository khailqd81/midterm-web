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
import javax.persistence.OneToMany;
import javax.persistence.OneToOne;
import javax.persistence.Table;

import com.fasterxml.jackson.annotation.JsonIgnore;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Entity
@Getter
@Setter
@ToString
@Table(name = "group", schema="public")
public class Group {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "group_id")
	private int groupId;

	@Column(name = "group_name")
	private String groupName;

	@OneToOne
	@JoinColumn(name = "owner_id", referencedColumnName = "user_id")
	private User user;

	@Column(name = "group_link")
	private String groupLink;

	@Column(name = "created_at")
	private Date createdAt;
	
	@Column(name = "is_deleted")
	private boolean isDeleted;

	@OneToMany(mappedBy = "primaryKey.group", cascade = CascadeType.ALL)
	@JsonIgnore
	private List<UserGroup> userGroup = new ArrayList<>();
	
	@OneToOne(mappedBy = "group")
	private Presentation present;
	
}
