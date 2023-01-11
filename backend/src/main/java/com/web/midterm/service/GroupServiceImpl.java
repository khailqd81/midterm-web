package com.web.midterm.service;

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

import com.web.midterm.entity.Group;
import com.web.midterm.entity.GroupDto;
import com.web.midterm.entity.GroupRole;
import com.web.midterm.entity.Presentation;
import com.web.midterm.entity.User;
import com.web.midterm.entity.UserGroup;
import com.web.midterm.repo.GroupRepository;
import com.web.midterm.repo.GroupRoleRepository;
import com.web.midterm.repo.PresentationRepository;
import com.web.midterm.repo.UserGroupRepository;
import com.web.midterm.repo.UserRepository;

@Service
public class GroupServiceImpl implements GroupService {
	@Autowired
	private UserService userService;
	@Autowired
	private PresentationRepository presentationRepository;
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
		User user = userService.getCurrentAuthUser();
		Group group = groupRepository.findByGroupId(groupId);
		if (group == null) {
			throw new Exception("Group ID not found");
		}
		String inviteLink = env.getProperty("frontend.url") + "/home/groups/join/" + group.getGroupLink();
//		SimpleMailMessage email = new SimpleMailMessage();
//		email.setTo(toAddress);
//		email.setSubject("Group Invitation Link");
//		email.setText("You are invited to join group: " + "\r\n" + inviteLink);
//		mailSender.send(email);
		MimeMessage message = mailSender.createMimeMessage();
		message.setRecipient(MimeMessage.RecipientType.TO, new InternetAddress(toAddress, false));
		message.setSubject("Group Invitation Link");
		message.setContent("<div style=\"text-align: left; font-size: 16px\"><div>"
				+ "<span style=\"font-weight: bold\">" + user.getEmail() + "</span>" + " has invited you to join the "
				+ "<span style=\"font-weight: bold \">"+ group.getGroupName() + "</span>" + " group " + "</div>"
				+ "<div style=\"margin-top: 14px\">"
				+ "<div>This invitation will expire in 15 minutes:</div>"
				+ "<div>"
				+ inviteLink
				+ "</div></div></div>",
				"text/html; charset=utf-8");
		mailSender.send(message);
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
	public void save(Group g) {
		groupRepository.save(g);
	}

}
