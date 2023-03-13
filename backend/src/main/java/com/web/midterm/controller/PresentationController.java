package com.web.midterm.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.web.midterm.dto.presentation_dto.PresentationDetailResponseDto;
import com.web.midterm.dto.presentation_dto.PresentationListResponseDto;
import com.web.midterm.entity.Group;
import com.web.midterm.entity.Presentation;
import com.web.midterm.entity.User;
import com.web.midterm.service.presentation.PresentationService;

import io.swagger.annotations.Api;

@RestController
@RequestMapping("/api/presents")
@Api( tags = "Presentations")
public class PresentationController {
	@Autowired
	private PresentationService presentationService;
	
	@Value("${socket.url}")
	private String socketUrl;

	/* API CRUD Presentation */
	// Create new presentation
	@PostMapping
	public ResponseEntity<?> createPresentation(@RequestBody String presentName) {
		presentationService.createByName(presentName);
		Map<String, String> message = new HashMap<>();
		message.put("message", "Create presentation success");
		return ResponseEntity.ok(message);
	}

	// Get list presentation of one user (owner and collaborator)
	@GetMapping
	public ResponseEntity<PresentationListResponseDto> getPresentations() throws Exception {
		return ResponseEntity.ok(presentationService.getPresentations());
	}

	// Get presentation detail
	@GetMapping("/{presentId}")
	public ResponseEntity<?> getPresentationDetail(@PathVariable int presentId) throws Exception {
		Presentation presentation = presentationService.getPresentationDetail(presentId);
		Group presentGroup = presentation.getGroup();
		if (presentGroup != null) {
			presentGroup.setPresent(null);
		}
		return ResponseEntity.ok().body(new PresentationDetailResponseDto(presentGroup, presentation));
	}
	
	// Get Get presentation detail for vote page when present in group
	@GetMapping("/{presentId}/group")
	public ResponseEntity<?> getPresentationDetailGroup(@PathVariable int presentId) throws Exception {
		
		return ResponseEntity.ok().body(presentationService.getPresentationDetailGroup(presentId));
	}
	
	// Get presentation detail for vote page when present public
	@GetMapping("/vote/{presentId}")
	public ResponseEntity<?> getPresentationDetailPublic(@PathVariable int presentId) throws Exception {
		return ResponseEntity.ok(presentationService.getPresentationDetailPublic(presentId));
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

	// Update presentation in group
	@PutMapping("/group")
	public ResponseEntity<?> updatePresentationGroup(@RequestBody Map<String, Integer> payload) throws Exception {
		// Get groupId and presentId
		int groupId = payload.get("groupId");
		int presentId = payload.get("presentId");
		presentationService.updatePresentationGroup(presentId, groupId);
		Map<String, String> message = new HashMap<>();
		message.put("message", "Present presentation " + presentId + " in group " + groupId + " success");
		return ResponseEntity.ok(message);
	}

	// Update presentation public or not presenting (presentation status)
	@PutMapping
	public ResponseEntity<?> updatePresentationPublic(@RequestBody Presentation updatePresent) throws Exception {
		presentationService.updatePresentationPublic(updatePresent.getPresentId(), updatePresent.isPublic());
		Map<String, String> message = new HashMap<>();
		message.put("message", "Update presentation isPublic success");
		return ResponseEntity.ok(message);
	}
	
	// Update current slide of the presentation
	@PostMapping("/{presentId}/{slideId}")
	public ResponseEntity<?> updateCurrentSlide(@PathVariable int presentId, @PathVariable int slideId)
			throws Exception {
		presentationService.updateCurrentSlide(presentId, slideId);
		Map<String, String> message = new HashMap<>();
		message.put("message", "Update current slide success");
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
	public ResponseEntity<?> addPresentationCo(@PathVariable int presentId, @RequestBody String email)
			throws Exception {
		return ResponseEntity.ok().body(presentationService.addPresentCollaborator(presentId, email));
	}

	// Delete Collaborator of one presentation
	@DeleteMapping("/{presentId}/coList/{userId}")
	public ResponseEntity<?> removePresentationCo(@PathVariable int presentId, @PathVariable int userId)
			throws Exception {
		presentationService.removePresentCollaborator(presentId, userId);
		Map<String, String> message = new HashMap<>();
		message.put("message", "Remove colaborator ok");
		return ResponseEntity.ok(message);
	}
	/* End API For Collaborator */

}
