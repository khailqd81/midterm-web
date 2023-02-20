package com.web.midterm.entity.dto;

import javax.validation.constraints.NotNull;

public class GroupDto {
	@NotNull(message = "GroupName is required")
	private String groupName;

	@NotNull(message = "OwnerId is required")
	private int ownerId;

	public String getGroupName() {
		return groupName;
	}

	public void setGroupName(String groupName) {
		this.groupName = groupName;
	}

	public int getOwnerId() {
		return ownerId;
	}

	public void setOwnerId(int ownerId) {
		this.ownerId = ownerId;
	}
	

}
