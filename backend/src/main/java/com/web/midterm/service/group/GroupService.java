package com.web.midterm.service.group;

import java.util.List;

import com.web.midterm.entity.Group;
import com.web.midterm.entity.UserGroup;
import com.web.midterm.entity.dto.groupDto.GroupDto;
import com.web.midterm.entity.dto.groupDto.GroupInfoResponseDto;
import com.web.midterm.entity.dto.groupDto.ListGroupResponseDto;

public interface GroupService {
	public List<UserGroup> findGroupByUserId(int userId);
	public Group findById(int id);
	public Group findByGroupLink(String groupLink);
	public ListGroupResponseDto getListGroupByUserId(int userId);
	public List<UserGroup> getMembers(int groupId);
	public boolean saveMember(int userId, int groupId, String role);
	public void saveUserGroup(UserGroup userGroup);
	public void createGroup(GroupDto g);
	public void save(Group g);
	public void sendInviteLink(String toAddress, int groupId)  throws Exception;
	public UserGroup findByUserIdAndGroupId(int userId, int groupId);
	public void deleteMember(int userId, int groupId);
	public void delete(int groupId) throws Exception ;
	public GroupInfoResponseDto getGroupMembers(int userId, int groupId) throws Exception;
}
