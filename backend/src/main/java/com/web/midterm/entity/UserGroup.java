package com.web.midterm.entity;

import javax.persistence.AssociationOverride;
import javax.persistence.AssociationOverrides;
import javax.persistence.EmbeddedId;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.OneToOne;
import javax.persistence.Table;
import javax.persistence.Transient;

@Entity
@Table(name = "user_group", schema = "public")
@AssociationOverrides({ @AssociationOverride(name = "primaryKey.user", joinColumns = @JoinColumn(name = "user_id")),
		@AssociationOverride(name = "primaryKey.group", joinColumns = @JoinColumn(name = "group_id")) })
public class UserGroup {
	@EmbeddedId
	private UserGroupId primaryKey = new UserGroupId();

	@OneToOne
	@JoinColumn(name = "role_id", referencedColumnName = "role_id")
	private GroupRole groupRole;

	public UserGroup() {

	}

	public UserGroup(UserGroupId primaryKey, GroupRole groupRole) {
		this.primaryKey = primaryKey;
		this.groupRole = groupRole;
	}

	public UserGroup(GroupRole groupRole) {
		this.groupRole = groupRole;
	}

	public UserGroupId getPrimaryKey() {
		return primaryKey;
	}

	public void setPrimaryKey(UserGroupId primaryKey) {
		this.primaryKey = primaryKey;
	}

	public GroupRole getGroupRole() {
		return groupRole;
	}

	public void setGroupRole(GroupRole groupRole) {
		this.groupRole = groupRole;
	}
	
	@Transient
	public User getUser() {
		return getPrimaryKey().getUser();
	}

	public void setUser(User user) {
		getPrimaryKey().setUser(user);
	}
	
	@Transient
	public Group getGroup() {
		return getPrimaryKey().getGroup();
	}

	public void setGroup(Group group) {
		getPrimaryKey().setGroup(group);
	}
}
