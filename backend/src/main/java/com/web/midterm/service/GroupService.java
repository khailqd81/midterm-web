package com.web.midterm.service;

import java.util.List;

import com.web.midterm.entity.Group;
import com.web.midterm.entity.GroupDto;
import com.web.midterm.entity.UserGroup;

public interface GroupService {
	public List<UserGroup> findGroupByUserId(int userId);
	public List<UserGroup> getMembers(int groupId);
	public boolean saveMember(int userId, int groupId, String role);
	public void saveUserGroup(UserGroup userGroup);
	public Group findById(int id);
	public Group findByGroupLink(String groupLink);
	public void createGroup(GroupDto g);
	public void sendInviteLink(String toAddress, int groupId)  throws Exception;
	public UserGroup findByUserIdAndGroupId(int userId, int groupId);
}
