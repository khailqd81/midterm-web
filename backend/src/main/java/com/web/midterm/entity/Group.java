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

@Entity
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

	@OneToMany(mappedBy = "primaryKey.group", cascade = CascadeType.ALL)
	@JsonIgnore
	private List<UserGroup> userGroup = new ArrayList<>();

	public Group() {

	}

	public Group(String groupName, User user, String groupLink, Date createdAt) {
		this.groupName = groupName;
		this.user = user;
		this.groupLink = groupLink;
		this.createdAt = createdAt;
	}

	public int getGroupId() {
		return groupId;
	}

	public void setGroupId(int groupId) {
		this.groupId = groupId;
	}

	public String getGroupName() {
		return groupName;
	}

	public void setGroupName(String groupName) {
		this.groupName = groupName;
	}

	public User getUser() {
		return user;
	}

	public void setUser(User user) {
		this.user = user;
	}

	public String getGroupLink() {
		return groupLink;
	}

	public void setGroupLink(String groupLink) {
		this.groupLink = groupLink;
	}

	public Date getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(Date createdAt) {
		this.createdAt = createdAt;
	}

	public List<UserGroup> getUserGroup() {
		return userGroup;
	}

	public void setUserGroup(List<UserGroup> userGroup) {
		this.userGroup = userGroup;
	}
	
}
