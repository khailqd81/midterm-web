package com.web.midterm.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.web.midterm.service.question.QuestionService;
import com.web.midterm.dto.SimpleSuccessResponseDto;

@RestController
@RequestMapping("/api/questions")
public class QuestionController {
	@Autowired
	private QuestionService questionService;

	@PostMapping("/{presentId}")
	public ResponseEntity<?> addNewQuestion(@PathVariable int presentId, @RequestBody Map<String, String> payload)
			throws Exception {
		questionService.addNewQuestion(presentId, payload.get("content"));
		return ResponseEntity.ok().body(new SimpleSuccessResponseDto("Add new question success"));
	}

	@PostMapping("/public/{presentId}")
	public ResponseEntity<?> addNewQuestionPublic(@PathVariable int presentId,
			@RequestBody Map<String, String> payload) throws Exception {
		questionService.addNewQuestionPublic(presentId, payload.get("content"));
		return ResponseEntity.ok().body(new SimpleSuccessResponseDto("Add new question public success"));
	}

	@PutMapping("/{questionId}/vote")
	public ResponseEntity<?> upvoteQuestion(@PathVariable int questionId) throws Exception {
		questionService.upvoteQuestion(questionId);
		return ResponseEntity.ok().body(new SimpleSuccessResponseDto("Upvote Question success"));
	}

	@PutMapping("/public/{questionId}/vote")
	public ResponseEntity<?> upvoteQuestionPublic(@PathVariable int questionId) throws Exception {
		questionService.upvoteQuestion(questionId);
		return ResponseEntity.ok().body(new SimpleSuccessResponseDto("Upvote Question Public success"));
	}

	@PutMapping("/{questionId}/answer")
	public ResponseEntity<?> markAnsweredQuestion(@PathVariable int questionId) throws Exception {
		questionService.updateAnsweredQuestion(questionId);
		return ResponseEntity.ok().body(new SimpleSuccessResponseDto("Mark Answered Question success"));
	}
}
