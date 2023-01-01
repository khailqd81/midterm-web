package com.web.midterm.controller;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import com.web.midterm.entity.Group;
import com.web.midterm.entity.GroupRole;
import com.web.midterm.entity.Presentation;
import com.web.midterm.entity.Slide;
import com.web.midterm.entity.User;
import com.web.midterm.entity.UserGroup;
import com.web.midterm.service.GroupService;
import com.web.midterm.service.PresentationService;
import com.web.midterm.service.SlideService;
import com.web.midterm.service.UserService;

@RestController
@RequestMapping("/api/presents")
public class PresentationController {
	@Autowired
	private UserService userService;
	@Autowired
	private GroupService groupService;
	@Autowired
	private PresentationService presentationService;
	@Autowired
	private SlideService slideService;
	@Value("${socket.url}")
	private String socketUrl;
	
	@PostMapping
	public ResponseEntity<?> createPresentation(@RequestBody Map<String, String> payload) {
		// Get user from access token
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		String currentPrincipalName = authentication.getName();
		User owner = userService.findByEmail(currentPrincipalName);

		String presentName = payload.get("presentName");
//		String groupId = payload.get("groupId");
		Presentation p = new Presentation();
		p.setCreatedAt(new Date());
		p.setPresentName(presentName);
		p.setUser(owner);
		presentationService.save(p);

		Map<String, String> message = new HashMap<>();
		message.put("message", "Create presentation success");
		return ResponseEntity.ok(message);
	}
	
	@PostMapping("/{presentId}/{slideId}")
	public ResponseEntity<?> updateCurrentSlide(@PathVariable int presentId, @PathVariable int slideId) throws Exception {
		// Get user from access token
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		String currentPrincipalName = authentication.getName();
		User owner = userService.findByEmail(currentPrincipalName);

		System.out.println("slideId:"+slideId);
		
		Slide s = slideService.findById(slideId);
		Presentation p = presentationService.findById(presentId);
		if (s == null || p== null) {
			throw new Exception("Slide or present id  not found");
		}

		if (s.getPresentation().getPresentId() != presentId) {
			throw new Exception("Slide " + slideId + " not belong to present" + presentId);
		}
		
		p.setCurrentSlide(s);
		presentationService.save(p);
		
		// call socket server
		// request url
		String url = socketUrl +"/presents";

		// create an instance of RestTemplate
		RestTemplate restTemplate = new RestTemplate();

		// request body parameters
		Map<String, Object> map = new HashMap<>();
		map.put("presentation", p);
		map.put("room", p.getPresentId());
		//map.put("room", p.getPresentId());

		// send POST request
		ResponseEntity<Void> response = restTemplate.postForEntity(url, map, Void.class);
		//
		
		Map<String, String> message = new HashMap<>();
		message.put("message", "Update current slide success");
		return ResponseEntity.ok(message);
	}
	
	// Update presentation group present
	@PutMapping("/group")
	public ResponseEntity<?> updatePresentation(@RequestBody Map<String, Integer> payload) throws Exception {
		// Get user from access token
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		String currentPrincipalName = authentication.getName();
		User user = userService.findByEmail(currentPrincipalName);

		int groupId = payload.get("groupId");
		int presentId = payload.get("presentId");

		Presentation p = presentationService.findById(presentId);
		Group g = groupService.findById(groupId);

		if (p == null || g == null) {
			throw new Exception("PresentId or GroupId not found");
		}
		if (g.getUser().getUserId() != user.getUserId()) {
			UserGroup userGroup = groupService.findByUserIdAndGroupId(user.getUserId(), groupId);
			GroupRole role = userGroup.getGroupRole();
			if (role.getRoleName()=="member") {
				throw new Exception("You don't have permission to present");				
			}
		}
		p.setGroup(g);
		presentationService.save(p);
		
		// Call socket server
		//
		
		Map<String, String> message = new HashMap<>();
		message.put("message", "Present presentation success");
		return ResponseEntity.ok(message);
	}
	
	@PutMapping
	public ResponseEntity<?> updatePresentationPublic(@RequestBody Presentation updatePresent) throws Exception {
		// Get presentation from database
		Presentation p = presentationService.findById(updatePresent.getPresentId());
		// Check exist presentation
		if (p == null) {
			throw new Exception("PresentId not found");
		}
		// Set public true and group null
		p.setGroup(null);
		System.out.println("update:" + updatePresent.isPublic());
		p.setPublic(updatePresent.isPublic());
		
		presentationService.save(p);
		Map<String, String> message = new HashMap<>();
		message.put("message", "Update presentation isPublic success");
		return ResponseEntity.ok(message);
	}
	
	@GetMapping
	public ResponseEntity<?> getPresentations() {
		// Get user from access token
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		String currentPrincipalName = authentication.getName();
		User user = userService.findByEmail(currentPrincipalName);

		List<Presentation> coList = user.getCoPresentationList();
//		List<Presentation> coList = coListDb.stream().filter(p -> !p.isDeleted()).collect(Collectors.toList());

		List<Presentation> ownerListDb = user.getPresentationList();
		List<Presentation> ownerList = ownerListDb.stream().filter(p -> !p.isDeleted()).collect(Collectors.toList());
//
//		List<Presentation> presentationList = new ArrayList<>();
//		for (Presentation p : ownerList) {
//			if (!p.isDeleted()) {
//				presentationList.add(p);
//			}
//		}
//		for (Presentation p : coList) {
//			if (!p.isDeleted()) {
//				presentationList.add(p);
//			}
//		}
		// System.out.println(coList);
		// List<Presentation> presentationList =
		// presentationService.findByUserUserId(user.getUserId());
		// List<Presentation> coPresentationList =
		// presentationService.findByUserUserIdCo(user.getUserId());
		Map<String, List<Presentation>> message = new HashMap<>();
		message.put("presentationList", ownerList);
		message.put("coPresentationList", coList);
		return ResponseEntity.ok(message);
	}

	@GetMapping("/{presentId}")
	public ResponseEntity<?> getPresentationDetail(@PathVariable int presentId) throws Exception {
		// Get user from access token
//		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
//		String currentPrincipalName = authentication.getName();
//		User user = userService.findByEmail(currentPrincipalName);

		Presentation presentation = presentationService.findById(presentId);
		if (presentation == null) {
			throw new Exception("Presentation id not found");
		}
		Map<String, Presentation> message = new HashMap<>();
		message.put("presentation", presentation);
		return ResponseEntity.ok(message);
	}
	
	@GetMapping("/vote/{presentId}")
	public ResponseEntity<?> getPresentationDetailForVote(@PathVariable int presentId) throws Exception {
		// Get user from access token

		Presentation presentation = presentationService.findById(presentId);
		if (presentation == null) {
			throw new Exception("Presentation id not found");
		}
		Map<String, Presentation> message = new HashMap<>();
		message.put("presentation", presentation);
		return ResponseEntity.ok(message);
	}
	
	@DeleteMapping("/{presentId}")
	public ResponseEntity<?> deletePresentationDetail(@PathVariable int presentId) throws Exception {
		presentationService.deleteById(presentId);
		Map<String, String> message = new HashMap<>();
		message.put("message", "Delete presentation success");
		return ResponseEntity.ok(message);
	}

	// API For Collaborator
	@GetMapping("/{presentId}/coList")
	public ResponseEntity<?> getPresentationCoList(@PathVariable int presentId) {
		Presentation presentation = presentationService.findById(presentId);
		List<User> coList = presentation.getUserList();
		Map<String, List<User>> message = new HashMap<>();
		message.put("coList", coList);
		return ResponseEntity.ok(message);
	}

	@PostMapping("/{presentId}/coList")
	public ResponseEntity<?> addPresentationCo(@PathVariable int presentId, @RequestBody Map<String, String> payload)
			throws Exception {
		Presentation presentation = presentationService.findById(presentId);
		if (payload.get("email") == null) {
			throw new Exception("There is no email provided");
		}
		User newColaborator = userService.findByEmail(payload.get("email"));
		if (newColaborator == null) {
			// Entity not found
			throw new Exception("Email not found");
		}
		List<User> coList = presentation.getUserList();
		if (newColaborator.getUserId() == presentation.getUser().getUserId()) {
			throw new Exception("Owner can't be collaborator");
		}
		// Check exist collaborator
		int index = coList.indexOf(newColaborator);
		if (index == -1) {
			coList.add(newColaborator);
			presentation.setUserList(coList);
			presentationService.save(presentation);
			Map<String, String> message = new HashMap<>();
			message.put("message", "Add colaborator ok");
			return ResponseEntity.ok(message);
		} else {
			Map<String, String> message = new HashMap<>();
			message.put("message", "Colaborator existed");
			return ResponseEntity.ok(message);
		}

	}

	@DeleteMapping("/{presentId}/coList/{userId}")
	public ResponseEntity<?> removePresentationCo(@PathVariable int presentId, @PathVariable int userId)
			throws Exception {
		Presentation presentation = presentationService.findById(presentId);
		User oldColaborator = userService.findByUserId(userId);
		if (oldColaborator == null) {
			// Entity not found
			throw new Exception("User Id not found");
		}
		presentation.getUserList().removeIf(u -> u.getUserId() == oldColaborator.getUserId());
		presentationService.save(presentation);
		Map<String, String> message = new HashMap<>();
		message.put("message", "Remove colaborator ok");
		return ResponseEntity.ok(message);
	}

}
