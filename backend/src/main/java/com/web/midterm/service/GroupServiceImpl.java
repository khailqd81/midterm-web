package com.web.midterm.service;

import java.util.Date;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;

import com.web.midterm.entity.Group;
import com.web.midterm.entity.GroupDto;
import com.web.midterm.entity.GroupRole;
import com.web.midterm.entity.User;
import com.web.midterm.entity.UserGroup;
import com.web.midterm.repo.GroupRepository;
import com.web.midterm.repo.GroupRoleRepository;
import com.web.midterm.repo.UserGroupRepository;
import com.web.midterm.repo.UserRepository;

@Service
public class GroupServiceImpl implements GroupService {
	@Autowired
	private GroupRepository groupRepository;
	@Autowired
	private UserRepository userRepository;
	@Autowired
	private GroupRoleRepository groupRoleRepository;
	@Autowired
	private UserGroupRepository userGroupRepository;

	@Autowired
	private Environment env;

	@Override
	public List<UserGroup> findGroupByUserId(int userId) {
		List<UserGroup> userGroups = userGroupRepository.findByPrimaryKeyUserUserId(userId);
		return userGroups;
	}

	@Override
	public List<UserGroup> getMembers(int groupId) {
		List<UserGroup> userGroups = userGroupRepository.findByPrimaryKeyGroupGroupId(groupId);
		return userGroups;
	}

	@Override
	public boolean saveMember(int userId, int groupId, String roleName) {
		User user = userRepository.findByUserId(userId);
		Group group = groupRepository.findByGroupId(groupId);
		GroupRole role = groupRoleRepository.findByRoleName(roleName);
		if (user == null || group == null || role ==null) {
			return false;
		}
		if (user.getUserId() == group.getUser().getUserId()) {
			return false;
		}
		UserGroup userGroup = new UserGroup();
		userGroup.setGroup(group);
		userGroup.setUser(user);
		userGroup.setGroupRole(role);
		userGroupRepository.save(userGroup);
		return true;
	}
	
	@Override
	public Group findById(int id) {
		return groupRepository.findByGroupId(id);
	}

	@Override
	public void createGroup(GroupDto g) {
		User owner = userRepository.findByUserId(g.getOwnerId());

		String link = UUID.randomUUID().toString();
		Group newGroup = new Group();
		newGroup.setGroupName(g.getGroupName());
		newGroup.setUser(owner);
		newGroup.setGroupLink(env.getProperty("frontend.url") + "/" + link);
		newGroup.setCreatedAt(new Date());

		GroupRole role = groupRoleRepository.findByRoleName("owner");
		UserGroup userGroup = new UserGroup();
		userGroup.setUser(owner);
		userGroup.setGroup(newGroup);
		userGroup.setGroupRole(role);

		newGroup.getUserGroup().add(userGroup);
		groupRepository.save(newGroup);
	}

	@Override
	public Group findByGroupLink(String groupLink) {
		return groupRepository.findByGroupLink(groupLink);
	}

	@Override
	public void saveUserGroup(UserGroup userGroup) {
		userGroupRepository.save(userGroup);
	}

}
