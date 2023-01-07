package com.web.midterm.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import com.web.midterm.entity.Question;
import com.web.midterm.entity.Presentation;
import com.web.midterm.service.QuestionService;

@RestController
@RequestMapping("/api/questions")
public class QuestionController {
	@Autowired
	private QuestionService questionService;

	@Value("${socket.url}")
	private String socketUrl;

	@PostMapping("/{presentId}")
	public ResponseEntity<?> addNewQuestion(@PathVariable int presentId, @RequestBody Map<String, String> payload)
			throws Exception {

		Question addedQuestion = questionService.addNewQuestion(presentId, payload.get("content"));
		Presentation p = addedQuestion.getPresent();
		// call socket server
		// request url
		String url = socketUrl + "/questions";
		// request body parameters
		Map<String, Object> map = new HashMap<>();
		map.put("presentation", p);
		map.put("group", p.getGroup());
//		map.put("oldGroup", oldGroup);
//		map.put("room", p.getPresentId());
//		// send POST request
		RestTemplate restTemplate = new RestTemplate();
		ResponseEntity<Void> response = restTemplate.postForEntity(url, map, Void.class);
		//
		Map<String, String> result = new HashMap<>();
		result.put("message", "Add new question success");
		return ResponseEntity.ok().body(result);
	}

	@PostMapping("/public/{presentId}")
	public ResponseEntity<?> addNewMessageAnonymus(@PathVariable int presentId,
			@RequestBody Map<String, String> payload) throws Exception {
		Question addedQuestion = questionService.addNewQuestionPublic(presentId, payload.get("content"));
		Presentation p = addedQuestion.getPresent();
		// call socket server
		// request url
		String url = socketUrl + "/questions";
		// request body parameters
		Map<String, Object> map = new HashMap<>();
		map.put("presentation", p);
		// map.put("question", addedQuestion);
		// map.put("group", p.getGroup());
//		map.put("oldGroup", oldGroup);
//		map.put("room", p.getPresentId());
//		// send POST request
		RestTemplate restTemplate = new RestTemplate();
		ResponseEntity<Void> response = restTemplate.postForEntity(url, map, Void.class);
		//
		Map<String, String> result = new HashMap<>();
		result.put("message", "Add new question success");
		return ResponseEntity.ok().body(result);
	}

	@PutMapping("/{questionId}/vote")
	public ResponseEntity<?> upvoteQuestion(@PathVariable int questionId) throws Exception {
		Question q = questionService.upvoteQuestion(questionId);
		Presentation p = q.getPresent();
		// call socket server
		// request url
		String url = socketUrl + "/questions";
		// request body parameters
		Map<String, Object> map = new HashMap<>();
		map.put("presentation", p);
		// map.put("group", p.getGroup());
//		map.put("oldGroup", oldGroup);
//		map.put("room", p.getPresentId());
//		// send POST request
		RestTemplate restTemplate = new RestTemplate();
		 ResponseEntity<Void> response = restTemplate.postForEntity(url, map,
		 Void.class);
		//
		Map<String, String> result = new HashMap<>();
		result.put("message", "Add new question success");
		return ResponseEntity.ok().body(result);
	}

	@PutMapping("/public/{questionId}/vote")
	public ResponseEntity<?> upvoteQuestionPublic(@PathVariable int questionId) throws Exception {
		Question q = questionService.upvoteQuestion(questionId);
		Presentation p = q.getPresent();
		// call socket server
		// request url
		String url = socketUrl + "/questions";
		// request body parameters
		Map<String, Object> map = new HashMap<>();
		map.put("presentation", p);
		// map.put("group", p.getGroup());
//		map.put("oldGroup", oldGroup);
//		map.put("room", p.getPresentId());
//		// send POST request
		RestTemplate restTemplate = new RestTemplate();
		ResponseEntity<Void> response = restTemplate.postForEntity(url, map, Void.class);
		//
		Map<String, String> result = new HashMap<>();
		result.put("message", "Add new question success");
		return ResponseEntity.ok().body(result);
	}

	@PutMapping("/{questionId}/answer")
	public ResponseEntity<?> markAnsweredQuestion(@PathVariable int questionId) throws Exception {
		Question q = questionService.updateAnsweredQuestion(questionId);
		Presentation p = q.getPresent();
		// call socket server
		// request url
		String url = socketUrl + "/questions";
		// request body parameters
		Map<String, Object> map = new HashMap<>();
		map.put("presentation", p);
		// map.put("question", q);
		// map.put("group", p.getGroup());
//		map.put("oldGroup", oldGroup);
//		map.put("room", p.getPresentId());
//		// send POST request
		RestTemplate restTemplate = new RestTemplate();
		ResponseEntity<Void> response = restTemplate.postForEntity(url, map, Void.class);
		//
		Map<String, String> result = new HashMap<>();
		result.put("message", "Add new question success");
		return ResponseEntity.ok().body(result);
	}
}
