package com.web.midterm.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.web.midterm.entity.Group;
import com.web.midterm.entity.GroupRole;
import com.web.midterm.entity.User;
import com.web.midterm.entity.UserGroup;
import com.web.midterm.entity.dto.groupDto.GroupDto;
import com.web.midterm.entity.dto.groupDto.ListGroupResponseDto;
import com.web.midterm.repo.GroupRoleRepository;
import com.web.midterm.service.group.GroupService;
import com.web.midterm.service.user.UserService;

import lombok.Data;

@RestController
@RequestMapping("/api/groups")
public class GroupController {
	@Autowired
	private GroupService groupService;
	@Autowired
	private GroupRoleRepository groupRoleRepository;
	@Autowired
	private UserService userService;

	@PostMapping
	public ResponseEntity<?> createGroup(@RequestBody GroupDto group) {
		User owner = userService.getCurrentAuthUser();
		group.setOwnerId(owner.getUserId());
		groupService.createGroup(group);
		return ResponseEntity.ok("create success");
	}

	// Get list group of one user
	@GetMapping
	public ResponseEntity<?> getGroups() {
		User owner = userService.getCurrentAuthUser();
		return ResponseEntity.ok().body(groupService.getListGroupByUserId(owner.getUserId()));
	}

	// Get member of a group by groupId
	@GetMapping("/{groupId}")
	public ResponseEntity<?> getGroupMembers(@PathVariable int groupId) throws Exception {
		User authUser = userService.getCurrentAuthUser();
		return ResponseEntity.ok().body(groupService.getGroupMembers(authUser.getUserId(), groupId));
	}

	// Update member role
	@PostMapping("/member")
	public ResponseEntity<?> saveMember(@RequestBody Map<String, String> payload) throws Exception {
		User owner = userService.getCurrentAuthUser();
		// Get params from request
		int userId = Integer.parseInt(payload.get("userId"));
		int groupId = Integer.parseInt(payload.get("groupId"));
		String role = payload.get("role");

		Group group = groupService.findById(groupId);
		if (owner.getUserId() != group.getUser().getUserId()) {
			throw new Exception("You don't have permission to change role");
		}
		if (role.equals("kick")) {
			// Handle kick out member
			groupService.deleteMember(userId, groupId);
			Map<String, String> result = new HashMap<>();
			result.put("message", "Kick out member OK");
			return ResponseEntity.ok().body(result);
		}
		if (!groupService.saveMember(userId, groupId, role)) {
			Map<String, String> jsonResponse = new HashMap<>();
			jsonResponse.put("message", "Group Id or User Id or Role not found.");
			return ResponseEntity.badRequest().body(jsonResponse);
		}

		Map<String, String> result = new HashMap<>();
		result.put("message", "Save member OK");
		return ResponseEntity.ok().body(result);
	}

	// Join group by link
	@GetMapping("/join/{groupLink}")
	public ResponseEntity<?> joinGroup(@PathVariable String groupLink) throws Exception {
		Map<String, String> result = new HashMap<>();
		User user = userService.getCurrentAuthUser();
		Group group = groupService.findByGroupLink(groupLink);
		GroupRole role = groupRoleRepository.findByRoleName("member");
		UserGroup userGroup = groupService.findByUserIdAndGroupId(user.getUserId(), group.getGroupId());
		if (userGroup != null) {
			result.put("message", "You have joined group");
			return ResponseEntity.ok().body(result);
		}
		if (user != null && group != null && role != null) {
			UserGroup newUserGroup = new UserGroup();
			newUserGroup.setUser(user);
			newUserGroup.setGroup(group);
			newUserGroup.setGroupRole(role);
			groupService.saveUserGroup(newUserGroup);
		}

		result.put("message", "Join group OK");
		return ResponseEntity.ok().body(result);
	}

	// Send mail invite member
	@PostMapping("/invite")
	public ResponseEntity<?> sendInviteEmail(@RequestBody Map<String, String> data) throws Exception {
		User user = userService.getCurrentAuthUser();
		// Get groupId and member email from request
		int groupId = Integer.parseInt(data.get("groupId"));
		String memberEmail = data.get("memberEmail");
		GroupRole role = groupRoleRepository.findByRoleName("member");
		System.out.println(groupId);
		System.out.println(memberEmail);
		if (user != null && role != null) {
			groupService.sendInviteLink(memberEmail, groupId);
		}
		Map<String, String> result = new HashMap<>();
		result.put("message", "Invite member by email OK");
		return ResponseEntity.ok().body(result);
	}

	@DeleteMapping("/{groupId}")
	public ResponseEntity<?> deleteGroup(@PathVariable int groupId) throws Exception {
		groupService.delete(groupId);
		Map<String, String> response = new HashMap<>();
		response.put("message", "Delete group Ok");
		return ResponseEntity.ok().body(response);
	}

	@GetMapping("/{groupId}/isMember")
	public ResponseEntity<?> isUserInGroup(@PathVariable int groupId) throws Exception {
		User user = userService.getCurrentAuthUser();
		UserGroup userGroup = groupService.findByUserIdAndGroupId(user.getUserId(), groupId);
		Map<String, Object> response = new HashMap<>();

		if (userGroup != null) {
			response.put("message", "User is member of group");
			response.put("isMember", true);
			return ResponseEntity.ok().body(response);
		}
		response.put("message", "User is not member of group");
		response.put("isMember", false);
		return ResponseEntity.ok().body(response);

	}

}
