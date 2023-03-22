package com.web.midterm.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.web.midterm.dto.SimpleSuccessResponseDto;
import com.web.midterm.dto.slide_dto.UserVoteRequest;
import com.web.midterm.entity.Slide;
import com.web.midterm.entity.UserAnswer;
import com.web.midterm.service.slide.SlideService;

@RestController
@RequestMapping("/api/slides")
public class SlideController {

	@Autowired
	private SlideService slideService;

	// Create new Slide
	@PostMapping
	public ResponseEntity<?> createSlide(@RequestBody Map<String, String> payload) throws Exception {
		String typeName = payload.get("typeName");
		String presentId = payload.get("presentId");
		if (typeName == null || presentId == null || typeName.length() <= 0 || presentId.length() <= 0) {
			throw new Exception("No typeName or presentId provided");
		}
		Slide s = slideService.create(typeName, Integer.parseInt(presentId));
		Map<String, Slide> message = new HashMap<>();
		message.put("slide", s);
		return ResponseEntity.ok(message);
	}

	// Update slide
	@PutMapping
	public ResponseEntity<?> updateSlide(@RequestBody Slide slide) throws Exception {
		slideService.update(slide);
		return ResponseEntity.ok().body( new SimpleSuccessResponseDto("Update slide success"));
	}

	@DeleteMapping("/{slideId}")
	public ResponseEntity<?> deleteSlide(@PathVariable int slideId) throws Exception {
		slideService.deleteById(slideId);
		Map<String, String> message = new HashMap<>();
		message.put("message", "Delete slide success");
		return ResponseEntity.ok(message);
	}

	// Get slide detail and update current slide
	@GetMapping("/{slideId}")
	public ResponseEntity<?> getSlideDetail(@PathVariable int slideId) throws Exception {
		Slide slide = slideService.getSlideDetailById(slideId);
		Map<String, Slide> message = new HashMap<>();
		message.put("slide", slide);
		return ResponseEntity.ok(message);
	}

	// Get slide detail for vote page
	@GetMapping("/vote/{slideId}")
	public ResponseEntity<?> getSlideDetailVote(@PathVariable int slideId) {
		Slide slide = slideService.findById(slideId);
		Map<String, Slide> message = new HashMap<>();
		message.put("slide", slide);
		return ResponseEntity.ok(message);
	}

	// Get useranswer list by slide id
	@GetMapping("/{slideId}/answers")
	public ResponseEntity<?> getSlideAnswerList(@PathVariable int slideId) throws Exception {
		List<UserAnswer> userAnswerList = slideService.getSlideAnswerList(slideId);
		Map<String, List<UserAnswer>> message = new HashMap<>();
		message.put("answerList", userAnswerList);
		return ResponseEntity.ok(message);
	}

	// User vote for an option in a slide
	@PostMapping("/vote/{slideId}")
	public ResponseEntity<?> updateSlideVote(@PathVariable int slideId, @RequestBody UserVoteRequest dto)
			throws Exception {
		Slide slide = slideService.updateSlideVote(slideId, dto);
		Map<String, Slide> message = new HashMap<>();
		message.put("slide", slide);
		return ResponseEntity.ok(message);
	}

}
