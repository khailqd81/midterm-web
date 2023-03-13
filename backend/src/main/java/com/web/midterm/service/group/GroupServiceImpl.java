package com.web.midterm.service.group;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.UUID;

import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;
import javax.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.web.midterm.dto.group_dto.GroupDto;
import com.web.midterm.dto.group_dto.GroupInfoResponseDto;
import com.web.midterm.dto.group_dto.ListGroupResponseDto;
import com.web.midterm.dto.group_dto.SendInviteEmailRequestDto;
import com.web.midterm.dto.group_dto.UpdateMemberRequestDto;
import com.web.midterm.dto.group_dto.UserGroupResponseDto;
import com.web.midterm.entity.Group;
import com.web.midterm.entity.GroupRole;
import com.web.midterm.entity.Presentation;
import com.web.midterm.entity.User;
import com.web.midterm.entity.UserGroup;
import com.web.midterm.exception.BadRequestException;
import com.web.midterm.repo.GroupRepository;
import com.web.midterm.repo.GroupRoleRepository;
import com.web.midterm.repo.PresentationRepository;
import com.web.midterm.repo.UserGroupRepository;
import com.web.midterm.service.user.UserService;

@Service
public class GroupServiceImpl implements GroupService {
	@Autowired
	private UserService userService;

	// Include presentationRepository to prevent circular dependency with
	// groupService
	@Autowired
	private PresentationRepository presentationRepository;
	@Autowired
	private UserGroupRepository userGroupRepository;
	@Autowired
	private GroupRepository groupRepository;
	@Autowired
	private GroupRoleRepository groupRoleRepository;

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
	public Group findById(int id) {
		return groupRepository.findByGroupId(id);
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
	public UserGroup findByUserIdAndGroupId(int userId, int groupId) {
		return userGroupRepository.findByPrimaryKeyUserUserIdAndPrimaryKeyGroupGroupId(userId, groupId);
	}

	@Override
	@Transactional
	public void deleteMember(int userId, int groupId) {
		userGroupRepository.deleteByPrimaryKeyUserUserIdAndPrimaryKeyGroupGroupId(userId, groupId);
	}

	@Override
	public void save(Group g) {
		groupRepository.save(g);
	}

	@Override
	public void saveMember(int userId, int groupId, String roleName) throws Exception {
		User user = userService.findByUserId(userId);
		Group group = groupRepository.findByGroupId(groupId);
		GroupRole role = groupRoleRepository.findByRoleName(roleName);
		if (user == null || group == null || role == null) {
			throw new Exception("User or Group or Role not found");
		}
//		if (user.getUserId() == group.getUser().getUserId()) {
//			return false;
//		}
		// Change owner of the group => change current owner to co-owner
		if (roleName.equals("owner")) {
			group.setUser(user);
			groupRepository.save(group);
			UserGroup userGroup = userGroupRepository.findByGroupRoleRoleIdAndPrimaryKeyGroupGroupId(role.getRoleId(),
					groupId);
			GroupRole memberRole = groupRoleRepository.findByRoleName("co-owner");
			userGroup.setGroupRole(memberRole);
			userGroupRepository.save(userGroup);
		}
		UserGroup updateUserGroup = new UserGroup();
		updateUserGroup.setGroup(group);
		updateUserGroup.setUser(user);
		updateUserGroup.setGroupRole(role);
		userGroupRepository.save(updateUserGroup);
	}

	@Override
	public void createGroup(GroupDto g) {
		User owner = userService.findByUserId(g.getOwnerId());

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
	public void sendInviteLink(SendInviteEmailRequestDto dto) throws Exception {
		User user = userService.getCurrentAuthUser();
		Group group = groupRepository.findByGroupId(dto.getGroupId());
		if (group == null) {
			throw new Exception("Group ID not found");
		}
		String inviteLink = env.getProperty("frontend.url") + "/home/groups/join/" + group.getGroupLink();
		MimeMessage message = mailSender.createMimeMessage();
		message.setRecipient(MimeMessage.RecipientType.TO, new InternetAddress(dto.getMemberEmail(), false));
		message.setSubject("Group Invitation Link");
		message.setContent("<div style=\"text-align: left; font-size: 16px\"><div>"
				+ "<span style=\"font-weight: bold\">" + user.getEmail() + "</span>" + " has invited you to join the "
				+ "<span style=\"font-weight: bold \">" + group.getGroupName() + "</span>" + " group " + "</div>"
				+ "<div style=\"margin-top: 14px\">" + "<div>This invitation will expire in 15 minutes:</div>" + "<div>"
				+ inviteLink + "</div></div></div>", "text/html; charset=utf-8");
		mailSender.send(message);
	}

	@Override
	public void delete(int groupId) throws Exception {
		// Check exists group
		Group g = groupRepository.findByGroupId(groupId);
		if (g == null) {
			throw new Exception("Group Id not found");
		}

		// Check authorization to delete
		User currentUser = userService.getCurrentAuthUser();
		if (currentUser.getUserId() != g.getUser().getUserId()) {
			throw new Exception("You don't have permission to delete group " + groupId);
		}
		Presentation p = g.getPresent();
		if (p != null) {
			p.setGroup(null);
			presentationRepository.save(p);
		}
		g.setPresent(null);
		g.setDeleted(true);
		groupRepository.save(g);
	}

	@Override
	public ListGroupResponseDto getListGroupByUserId(int userId) {
		List<UserGroup> userGroups = this.findGroupByUserId(userId);

		// Divide result into 3 category
		List<Group> ownerGroup = new ArrayList<>();
		List<Group> memberGroup = new ArrayList<>();
		List<Group> coOwnerGroup = new ArrayList<>();
		for (UserGroup g : userGroups) {
			Group groupDb = g.getGroup();
			if (groupDb.isDeleted()) {
				continue;
			}
			if (g.getGroupRole().getRoleName().equals("owner")) {
				ownerGroup.add(g.getGroup());
			} else if (g.getGroupRole().getRoleName().equals("co-owner")) {
				coOwnerGroup.add(g.getGroup());
			} else {
				memberGroup.add(g.getGroup());
			}
		}

		ListGroupResponseDto response = new ListGroupResponseDto(ownerGroup, coOwnerGroup, memberGroup);
		return response;
	}

	@Override
	public GroupInfoResponseDto getGroupMembers(int userId, int groupId) throws Exception {
		Group group = this.findById(groupId);
		if (group == null) {
			throw new Exception("Group Id not found");
		}
		// Get role in group of auth user
		UserGroup userGroup = this.findByUserIdAndGroupId(userId, groupId);
		GroupRole role = userGroup.getGroupRole();
		String roleName = role.getRoleName();
		//
		List<UserGroup> userGroups = this.getMembers(groupId);
		List<UserGroupResponseDto> users = new ArrayList<>();
		for (UserGroup g : userGroups) {
			UserGroupResponseDto user = new UserGroupResponseDto();
			user.setUser(g.getUser());
			user.setRole(g.getGroupRole().getRoleName());
			users.add(user);
		}

		GroupInfoResponseDto info = new GroupInfoResponseDto();
		info.setRole(roleName);
		info.setPresent(group.getPresent());
		info.setGroupId(group.getGroupId());
		info.setGroupLink(group.getGroupLink());
		info.setGroupName(group.getGroupName());
		info.setCreatedAt(group.getCreatedAt());
		info.setOwnerId(group.getUser().getUserId());
		info.setMembers(users);
		return info;
	}

	@Override
	public void updateMember(UpdateMemberRequestDto dto) throws Exception {
		int userId = dto.getUserId();
		String role = dto.getRole();
		int groupId = dto.getGroupId();
		if (role.equals("kick")) {
			// Handle kick out member
			this.deleteMember(userId, groupId);
		}
		this.saveMember(userId, groupId, role);
	}

	@Override
	public void joinGroupByLink(String groupLink) throws Exception {
		User user = userService.getCurrentAuthUser();
		Group group = groupRepository.findByGroupLink(groupLink);
		GroupRole role = groupRoleRepository.findByRoleName("member");
		UserGroup userGroup = this.findByUserIdAndGroupId(user.getUserId(), group.getGroupId());
		if (userGroup != null) {
			throw new BadRequestException("You have joined group");
		}
		if (user != null && group != null && role != null) {
			UserGroup newUserGroup = new UserGroup();
			newUserGroup.setUser(user);
			newUserGroup.setGroup(group);
			newUserGroup.setGroupRole(role);
			userGroupRepository.save(newUserGroup);
		}

	}

}
