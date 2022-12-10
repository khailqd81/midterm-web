package com.web.midterm.controller;

import java.util.Date;
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

import com.web.midterm.entity.Presentation;
import com.web.midterm.entity.User;
import com.web.midterm.service.PresentationService;
import com.web.midterm.service.UserService;

@RestController
@RequestMapping("/api/presents")
public class PresentationController {
	@Autowired
	private UserService userService;
	@Autowired
	private PresentationService presentationService;
	
	@PostMapping
	public ResponseEntity<?> createPresentation(@RequestBody Map<String, String> payload) {
		// Get user from access token
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		String currentPrincipalName = authentication.getName();
		User owner = userService.findByEmail(currentPrincipalName);
		
		String presentName = payload.get("preName");
		String groupId = payload.get("groupId");
		Presentation p = new Presentation();
		p.setCreatedAt(new Date());
		p.setPreName(presentName);
		p.setUser(owner);
		presentationService.save(p);

		Map<String, String> message = new HashMap<>();
		message.put("message", "Create presentation success");
		return ResponseEntity.ok(message);
	}
	
	@GetMapping
	public ResponseEntity<?> getPresentations() {
		// Get user from access token
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		String currentPrincipalName = authentication.getName();
		User user = userService.findByEmail(currentPrincipalName);
		
		List<Presentation> presentationList = presentationService.findByUserUserId(user.getUserId());
		Map<String, List<Presentation>> message = new HashMap<>();
		message.put("presentationList", presentationList);
		return ResponseEntity.ok(message);
	}
	
	@GetMapping("/{presentId}")
	public ResponseEntity<?> getPresentationDetail(@PathVariable int presentId) {
		// Get user from access token
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		String currentPrincipalName = authentication.getName();
		User user = userService.findByEmail(currentPrincipalName);
		
		Presentation presentation = presentationService.findById(presentId);
		Map<String, Presentation> message = new HashMap<>();
		message.put("presentation", presentation);
		return ResponseEntity.ok(message);
	}
}
