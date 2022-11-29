package com.web.midterm.service;

import java.util.Date;
import java.util.List;
import java.util.UUID;

import javax.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
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
	private JavaMailSender mailSender;

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
		if (user == null || group == null || role == null) {
			return false;
		}
		if (user.getUserId() == group.getUser().getUserId()) {
			return false;
		}
		// Change owner of the group => change current owner to co-owner
		if (roleName.equals("owner")) {
			group.setUser(user);
			groupRepository.save(group);
			UserGroup userGroup = userGroupRepository.findByGroupRoleRoleIdAndPrimaryKeyGroupGroupId(role.getRoleId(), groupId);
			GroupRole memberRole = groupRoleRepository.findByRoleName("co-owner");
			userGroup.setGroupRole(memberRole);
			userGroupRepository.save(userGroup);
		}
		UserGroup updateUserGroup = new UserGroup();
		updateUserGroup.setGroup(group);
		updateUserGroup.setUser(user);
		updateUserGroup.setGroupRole(role);
		userGroupRepository.save(updateUserGroup);
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
		newGroup.setGroupLink(link);
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

	@Override
	public void sendInviteLink(String toAddress, int groupId) throws Exception {
		Group group = groupRepository.findByGroupId(groupId);
		if (group == null) {
			throw new Exception("Group ID not found");
		}
		String inviteLink = env.getProperty("frontend.url") + "/home/groups/join/" + group.getGroupLink();
		SimpleMailMessage email = new SimpleMailMessage();
		email.setTo(toAddress);
		email.setSubject("Group Invitation Link");
		email.setText("You are invited to join group: " + "\r\n" + inviteLink);
		mailSender.send(email);

	}

	@Override
	public UserGroup findByUserIdAndGroupId(int userId, int groupId) {
		return userGroupRepository.findByPrimaryKeyUserUserIdAndPrimaryKeyGroupGroupId(userId, groupId);
	}

	@Override
	@Transactional
	public void deleteMember(int userId, int groupId) {
		userGroupRepository.deleteByPrimaryKeyUserUserIdAndPrimaryKeyGroupGroupId(userId, groupId);
	}
	
	

}
