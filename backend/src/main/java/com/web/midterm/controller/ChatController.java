package com.web.midterm.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.web.midterm.entity.Chat;
import com.web.midterm.service.chat.ChatService;

@RestController
@RequestMapping("/api/chats")
public class ChatController {

	@Autowired
	private ChatService chatService;

	@Value("${socket.url}")
	private String socketUrl;

	@PostMapping("/{presentId}")
	public ResponseEntity<?> addNewMessage(@PathVariable int presentId, @RequestBody Map<String, String> payload)
			throws Exception {
		Chat addedChat = chatService.addNewMessage(presentId, payload.get("content"));
		Map<String, Object> result = new HashMap<>();
		result.put("message", "Add new message success");
		result.put("chat", addedChat);
		return ResponseEntity.ok().body(result);
	}

	@PostMapping("/public/{presentId}")
	public ResponseEntity<?> addNewMessageAnonymus(@PathVariable int presentId,
			@RequestBody Map<String, String> payload) throws Exception {
		Chat addedChat = chatService.addNewMessageAnonymus(presentId, payload.get("content"));
		Map<String, Object> result = new HashMap<>();
		result.put("message", "Add new message success");
		result.put("chat", addedChat);
		return ResponseEntity.ok().body(result);
	}

	@GetMapping("/public/{presentId}/{page}")
	public ResponseEntity<?> viewChatMessagesPublic(@PathVariable int presentId, @PathVariable int page)
			throws Exception {
		Page<Chat> chatPage = chatService.findByPresentationIdPublic(presentId, page);
		List<Chat> chatList = chatPage.getContent();
		int totalPage = chatPage.getTotalPages();
		Map<String, Object> result = new HashMap<>();
		result.put("chatList", chatList);
		result.put("totalPage", totalPage);
		return ResponseEntity.ok().body(result);
	}

	@GetMapping("/{presentId}/{page}")
	public ResponseEntity<?> viewChatMessages(@PathVariable int presentId, @PathVariable int page) throws Exception {
		Page<Chat> chatPage = chatService.findByPresentationId(presentId, page);
		List<Chat> chatList = chatPage.getContent();
		int totalPage = chatPage.getTotalPages();
		Map<String, Object> result = new HashMap<>();
		result.put("chatList", chatList);
		result.put("totalPage", totalPage);
		return ResponseEntity.ok().body(result);
	}
}
