package com.web.midterm.service.group;

import java.util.List;

import com.web.midterm.dto.group_dto.GroupDto;
import com.web.midterm.dto.group_dto.GroupInfoResponseDto;
import com.web.midterm.dto.group_dto.ListGroupResponseDto;
import com.web.midterm.dto.group_dto.SendInviteEmailRequestDto;
import com.web.midterm.dto.group_dto.UpdateMemberRequestDto;
import com.web.midterm.entity.Group;
import com.web.midterm.entity.UserGroup;

public interface GroupService {
	public List<UserGroup> findGroupByUserId(int userId);

	public Group findById(int id);

	public Group findByGroupLink(String groupLink);

	public ListGroupResponseDto getListGroupByUserId(int userId);

	public List<UserGroup> getMembers(int groupId);

	public void saveMember(int userId, int groupId, String role) throws Exception;

	public void saveUserGroup(UserGroup userGroup);

	public void createGroup(GroupDto g);

	public void save(Group g);

	public void sendInviteLink(SendInviteEmailRequestDto dto) throws Exception;

	public UserGroup findByUserIdAndGroupId(int userId, int groupId);

	public void deleteMember(int userId, int groupId);

	public void delete(int groupId) throws Exception;

	public GroupInfoResponseDto getGroupMembers(int userId, int groupId) throws Exception;

	public void updateMember(UpdateMemberRequestDto dto) throws Exception;
	
	public void joinGroupByLink(String groupLink) throws Exception;
}
