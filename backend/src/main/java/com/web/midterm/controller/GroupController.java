package com.web.midterm.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.web.midterm.dto.group_dto.GroupDto;
import com.web.midterm.dto.group_dto.IsMemberDto;
import com.web.midterm.dto.group_dto.SendInviteEmailRequestDto;
import com.web.midterm.dto.group_dto.UpdateMemberRequestDto;
import com.web.midterm.entity.Group;
import com.web.midterm.entity.User;
import com.web.midterm.entity.UserGroup;
import com.web.midterm.exception.BadRequestException;
import com.web.midterm.service.group.GroupService;
import com.web.midterm.service.user.UserService;

@RestController
@RequestMapping("/api/groups")
public class GroupController {
	@Autowired
	private GroupService groupService;
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
	public ResponseEntity<?> updateMemberRole(@RequestBody UpdateMemberRequestDto dto) throws Exception {
		User owner = userService.getCurrentAuthUser();
		int groupId = dto.getGroupId();
		// Check author to change role
		Group group = groupService.findById(groupId);
		if (owner.getUserId() != group.getUser().getUserId()) {
			throw new BadRequestException("You don't have permission to change role");
		}
		groupService.updateMember(dto);
		Map<String, String> result = new HashMap<>();
		result.put("message", "Update member OK");
		return ResponseEntity.ok().body(result);
	}

	// Join group by link
	@GetMapping("/join/{groupLink}")
	public ResponseEntity<?> joinGroupByLink(@PathVariable String groupLink) throws Exception {
		groupService.joinGroupByLink(groupLink);
		Map<String, String> result = new HashMap<>();
		result.put("message", "Join group OK");		
		return ResponseEntity.ok().body(result);
	}

	// Send mail invite member
	@PostMapping("/invite")
	public ResponseEntity<?> sendInviteEmail(@RequestBody SendInviteEmailRequestDto dto) throws Exception {
		groupService.sendInviteLink(dto);
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
		if (userGroup != null) {
			return ResponseEntity.ok().body(new IsMemberDto("User is member of group", true));
		}
		return ResponseEntity.ok().body(new IsMemberDto("User is not member of group", false));
	}
}
