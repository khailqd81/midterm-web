package com.web.midterm.controller;

import java.util.ArrayList;
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
import com.web.midterm.entity.Option;
import com.web.midterm.entity.Presentation;
import com.web.midterm.entity.Slide;
import com.web.midterm.entity.User;
import com.web.midterm.entity.UserAnswer;
import com.web.midterm.entity.UserGroup;
import com.web.midterm.service.GroupService;
import com.web.midterm.service.PresentationService;
import com.web.midterm.service.SlideService;
import com.web.midterm.service.UserAnswerService;
import com.web.midterm.service.UserService;

@RestController
@RequestMapping("/api/presents")
public class PresentationController {
	@Autowired
	private UserService userService;
	@Autowired
	private GroupService groupService;
	@Autowired
	private UserAnswerService userAnswerService;
	@Autowired
	private PresentationService presentationService;
	@Autowired
	private SlideService slideService;
	@Value("${socket.url}")
	private String socketUrl;

	/* API CRUD Presentation */
	// Create new presentation
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

	// Get list presentation of one user
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

	// Get one presentation
	@GetMapping("/{presentId}")
	public ResponseEntity<?> getPresentationDetail(@PathVariable int presentId) throws Exception {
		Presentation presentation = presentationService.findById(presentId);
		if (presentation == null) {
			throw new Exception("Presentation id not found");
		}
		Map<String, Object> message = new HashMap<>();
		message.put("presentation", presentation);
		Group presentGroup = presentation.getGroup();
		if (presentGroup != null) {
			presentGroup.setPresent(null);
		}
		message.put("group", presentGroup);
		return ResponseEntity.ok(message);
	}
	
	// Get one presentation
	@GetMapping("/{presentId}/group")
	public ResponseEntity<?> getPresentationDetailVoteGroup(@PathVariable int presentId) throws Exception {
		Presentation p = presentationService.findById(presentId);
		if (p == null || p.isDeleted()) {
			throw new Exception("Presentation id not found");
		}
		// Check user is member of the group
		User user = userService.getCurrentAuthUser();
		Group g = p.getGroup();
		if (g== null) {
			throw new Exception("Presentation is not presenting");
		}
		
		String roleName = "member";
		if (g != null) {
			UserGroup userGroup = groupService.findByUserIdAndGroupId(user.getUserId(), g.getGroupId());
			if (userGroup == null) {
				throw new Exception("You don't have permission to access this presentation");
			}
			GroupRole role = userGroup.getGroupRole();
			roleName = role.getRoleName();
		}
		
		// Get answerList of the current slide
		List<UserAnswer> answerList = new ArrayList<>();
		if (!roleName.equals("member")) {
			List<Option> optionList = p.getCurrentSlide().getOptionList();
			if (optionList != null && optionList.size() > 0) {
				for (Option opt : optionList) {
					List<UserAnswer> optAnswer = userAnswerService.findByOptionId(opt.getOptionId());
					answerList.addAll(optAnswer);
				}
			}
		}

		
		Map<String, Object> message = new HashMap<>();
		message.put("presentation", p);
		message.put("role", roleName);
		message.put("answerList", answerList);
		message.put("group", p.getGroup());
		return ResponseEntity.ok(message);
	}
	// Get presentation detail for vote page
	@GetMapping("/vote/{presentId}")
	public ResponseEntity<?> getPresentationDetailForVote(@PathVariable int presentId) throws Exception {
		// Get user from access token

		Presentation p = presentationService.findById(presentId);
		if (p == null || p.isDeleted()) {
			throw new Exception("Presentation Id not found");
		}
		if (!p.isPublic()) {
			throw new Exception("Presentation is not presenting in public");
		}
		
		// Get answerList of the current slide
		List<UserAnswer> answerList = new ArrayList<>();
		List<Option> optionList = p.getCurrentSlide().getOptionList();
		if (optionList != null && optionList.size() > 0) {
			for (Option opt : optionList) {
				List<UserAnswer> optAnswer = userAnswerService.findByOptionId(opt.getOptionId());
				answerList.addAll(optAnswer);
			}
		}
		
		Map<String, Object> message = new HashMap<>();
		message.put("presentation", p);
		message.put("group", p.getGroup());
		message.put("answerList", answerList);
		return ResponseEntity.ok(message);
	}

	// Update presentation public or not presenting
	@PutMapping
	public ResponseEntity<?> updatePresentationPublic(@RequestBody Presentation updatePresent) throws Exception {
		// Get presentation from database
		Presentation p = presentationService.findById(updatePresent.getPresentId());
		// Check exist presentation
		if (p == null) {
			throw new Exception("PresentId not found");
		}
		// Set public true and group null
		Group oldGroup = p.getGroup();
		p.setGroup(null);
		System.out.println("update:" + updatePresent.isPublic());
		p.setPublic(updatePresent.isPublic());

		presentationService.save(p);
		
		// Call socket server
		// request url
		String url = socketUrl + "/presents";

		// create an instance of RestTemplate
		RestTemplate restTemplate = new RestTemplate();

		// request body parameters
		Map<String, Object> map = new HashMap<>();
		map.put("presentation", p);
		map.put("group", null);
		map.put("oldGroup", oldGroup);
		map.put("room", p.getPresentId());
		// map.put("room", p.getPresentId());

		// send POST request
		ResponseEntity<Void> response = restTemplate.postForEntity(url, map, Void.class);
		//
		
		Map<String, String> message = new HashMap<>();
		message.put("message", "Update presentation isPublic success");
		return ResponseEntity.ok(message);
	}

	// Delete presentation
	@DeleteMapping("/{presentId}")
	public ResponseEntity<?> deletePresentationDetail(@PathVariable int presentId) throws Exception {

		presentationService.deleteById(presentId);
		Map<String, String> message = new HashMap<>();
		message.put("message", "Delete presentation success");
		return ResponseEntity.ok(message);
	}
	/* End API CRUD Presentation */

	/* API related real time */
	// Update current slide of the presentation
	@PostMapping("/{presentId}/{slideId}")
	public ResponseEntity<?> updateCurrentSlide(@PathVariable int presentId, @PathVariable int slideId)
			throws Exception {
		// Get user from access token
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		String currentPrincipalName = authentication.getName();
		User owner = userService.findByEmail(currentPrincipalName);

		System.out.println("slideId:" + slideId);

		Slide s = slideService.findById(slideId);
		Presentation p = presentationService.findById(presentId);
		if (s == null || p == null) {
			throw new Exception("Slide or present id  not found");
		}

		if (s.getPresentation().getPresentId() != presentId) {
			throw new Exception("Slide " + slideId + " not belong to present" + presentId);
		}

		p.setCurrentSlide(s);
		presentationService.save(p);
		
		// Get answerList with currentSlide
		List<Option> optionList = p.getCurrentSlide().getOptionList();
		List<UserAnswer> userAnswerList = new ArrayList<>();
		if (optionList != null && optionList.size() > 0) {
			for (Option opt : optionList) {
				List<UserAnswer> optAnswer = userAnswerService.findByOptionId(opt.getOptionId());
				userAnswerList.addAll(optAnswer);
			}
		}
		
		// Call socket server
		// request url
		String url = socketUrl + "/presents";

		// create an instance of RestTemplate
		RestTemplate restTemplate = new RestTemplate();

		// request body parameters
		Map<String, Object> map = new HashMap<>();
		map.put("presentation", p);
		map.put("answerList", userAnswerList);
		map.put("group", p.getGroup());
		map.put("room", p.getPresentId());
		// map.put("room", p.getPresentId());

		// send POST request
		ResponseEntity<Void> response = restTemplate.postForEntity(url, map, Void.class);
		//

		Map<String, String> message = new HashMap<>();
		message.put("message", "Update current slide success");
		return ResponseEntity.ok(message);
	}

	// Update presentation in group
	@PutMapping("/group")
	public ResponseEntity<?> updatePresentation(@RequestBody Map<String, Integer> payload) throws Exception {
		// Get user from access token
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		String currentPrincipalName = authentication.getName();
		User user = userService.findByEmail(currentPrincipalName);

		// Get groupId and presentId
		int groupId = payload.get("groupId");
		int presentId = payload.get("presentId");

		Presentation p = presentationService.findById(presentId);
		Group g = groupService.findById(groupId);

		if (p == null || g == null) {
			throw new Exception("PresentId or GroupId not found");
		}

		// Check user permission
		if (g.getUser().getUserId() != user.getUserId()) {
			UserGroup userGroup = groupService.findByUserIdAndGroupId(user.getUserId(), groupId);
			if (userGroup == null) {
				throw new Exception("You don't have permission to present");
			}
			GroupRole role = userGroup.getGroupRole();
			if (role.getRoleName() == "member") {
				throw new Exception("You don't have permission to present");
			}
		}
		Presentation oldPresentation = g.getPresent();
		if (oldPresentation != null) {
			oldPresentation.setGroup(null);
			presentationService.save(oldPresentation);
		}
		
		Group oldGroup = p.getGroup();
		if (oldGroup != null) {
			oldGroup.setPresent(null);
			groupService.save(oldGroup);
		}
		g.setPresent(p);
		p.setGroup(g);
		p.setPublic(false);
		presentationService.save(p);

		// Call socket server
		// request url
		String url = socketUrl + "/groups";

		// create an instance of RestTemplate
		RestTemplate restTemplate = new RestTemplate();

		// request body parameters
		Map<String, Object> map = new HashMap<>();
		map.put("presentation", p);
		map.put("group", p.getGroup());
		map.put("oldGroup", oldGroup);
		map.put("room", "public");
		// map.put("room", p.getPresentId());

		// send POST request
		ResponseEntity<Void> response = restTemplate.postForEntity(url, map, Void.class);
		//

		Map<String, String> message = new HashMap<>();
		message.put("message", "Present presentation " + p.getPresentId() + " in group " + g.getGroupId() + " success");
		return ResponseEntity.ok(message);
	}

	/* End API related real time */

	/* API For Collaborator */
	// Get Collaborator of one presentation
	@GetMapping("/{presentId}/coList")
	public ResponseEntity<?> getPresentationCoList(@PathVariable int presentId) {
		Presentation presentation = presentationService.findById(presentId);
		List<User> coList = presentation.getUserList();
		Map<String, List<User>> message = new HashMap<>();
		message.put("coList", coList);
		return ResponseEntity.ok(message);
	}

	// Add Collaborator of one presentation
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

	// Delete Collaborator of one presentation
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
	/* End API For Collaborator */

}
