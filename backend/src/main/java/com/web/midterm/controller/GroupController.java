package com.web.midterm.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.web.midterm.entity.Group;
import com.web.midterm.entity.GroupDto;
import com.web.midterm.entity.GroupRole;
import com.web.midterm.entity.User;
import com.web.midterm.entity.UserGroup;
import com.web.midterm.repo.GroupRoleRepository;
import com.web.midterm.service.GroupService;
import com.web.midterm.service.UserService;

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
		// Get user from access token
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		String currentPrincipalName = authentication.getName();
		User owner = userService.findByEmail(currentPrincipalName);

		group.setOwnerId(owner.getUserId());
		groupService.createGroup(group);

		Map<String, String> message = new HashMap<>();
		message.put("message", "create success");
		return ResponseEntity.ok(message);
	}

	// Get list group of one user
	@GetMapping
	public ResponseEntity<?> getGroups() {
		// Get user from access token
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		String currentPrincipalName = authentication.getName();
		User owner = userService.findByEmail(currentPrincipalName);

		List<UserGroup> userGroups = groupService.findGroupByUserId(owner.getUserId());
		// Divide result into 3 category
		List<Group> ownerGroup = new ArrayList<>();
		List<Group> memberGroup = new ArrayList<>();
		List<Group> coOwnerGroup = new ArrayList<>();
		for (UserGroup g : userGroups) {
			if (g.getGroupRole().getRoleName().equals("owner")) {
				ownerGroup.add(g.getGroup());
			} else if (g.getGroupRole().getRoleName().equals("co-owner")) {
				coOwnerGroup.add(g.getGroup());
			} else {
				memberGroup.add(g.getGroup());
			}
		}

		Map<String, List<?>> result = new HashMap<>();
		result.put("owner", ownerGroup);
		result.put("coowner", coOwnerGroup);
		result.put("member", memberGroup);
		return ResponseEntity.ok().body(result);
	}

	// Get member of a group by groupId
	@GetMapping("/{groupId}")
	public ResponseEntity<?> getGroupMembers(@PathVariable int groupId) {
		Group group = groupService.findById(groupId);
		if (group == null) {
			Map<String, String> jsonResponse = new HashMap<>();
			jsonResponse.put("message", "Group Id not found.");
			return ResponseEntity.badRequest().body(jsonResponse);
		}

		List<UserGroup> userGroups = groupService.getMembers(groupId);
		List<UserGroupResponse> users = new ArrayList<>();
		for (UserGroup g : userGroups) {
			UserGroupResponse user = new UserGroupResponse();
			user.setUser(g.getUser());
			user.setRole(g.getGroupRole().getRoleName());
			users.add(user);
		}
//		List<User> ownerGroup = new ArrayList<>();
//		List<User> memberGroup = new ArrayList<>();
//		List<User> coOwnerGroup = new ArrayList<>();
//		for (UserGroup g : userGroups) {
//			if (g.getGroupRole().getRoleName().equals("owner")){
//				ownerGroup.add(g.getUser());
//			} else if (g.getGroupRole().getRoleName().equals("co-owner")) {
//				coOwnerGroup.add(g.getUser());
//			} else {
//				memberGroup.add(g.getUser());
//			}
//		}
//		
//		Map<String, List<?>> result = new HashMap<>();
//		result.put("owner", ownerGroup);
//		result.put("coowner", coOwnerGroup);
//		result.put("member", memberGroup);
		Map<String, List<?>> result = new HashMap<>();
		result.put("members", users);
		return ResponseEntity.ok().body(result);
	}

	@PostMapping("/member")
	public ResponseEntity<?> saveMember(@RequestBody Map<String, String> payload) {
		int userId = Integer.parseInt(payload.get("userId"));
		int groupId = Integer.parseInt(payload.get("groupId"));
		String role = payload.get("role");

		if (!groupService.saveMember(userId, groupId, role)) {
			Map<String, String> jsonResponse = new HashMap<>();
			jsonResponse.put("message", "Group Id or User Id or Role not found.");
			return ResponseEntity.badRequest().body(jsonResponse);
		}

		Map<String, String> result = new HashMap<>();
		result.put("message", "Save member OK");
		return ResponseEntity.ok().body(result);
	}

	@PostMapping("/join/{groupLink}")
	public ResponseEntity<?> joinGroup(@PathVariable String groupLink) throws Exception {
		// Get user from access token
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		String currentPrincipalName = authentication.getName();
		User user = userService.findByEmail(currentPrincipalName);
		Group group = groupService.findByGroupLink(groupLink);
		GroupRole role = groupRoleRepository.findByRoleName("member");
		if (user != null && group != null && role != null) {
			UserGroup userGroup = new UserGroup();
			userGroup.setUser(user);
			userGroup.setGroup(group);
			userGroup.setGroupRole(role);
			groupService.saveUserGroup(userGroup);
		}
		Map<String, String> result = new HashMap<>();
		result.put("message", "Join group OK");
		return ResponseEntity.ok().body(result);
	}

	@Data
	public class UserGroupResponse {
		private User user;
		private String role;

	}
}