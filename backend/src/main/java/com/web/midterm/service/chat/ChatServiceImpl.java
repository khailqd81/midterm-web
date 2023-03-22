package com.web.midterm.service.chat;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.web.midterm.entity.Chat;
import com.web.midterm.entity.Group;
import com.web.midterm.entity.Presentation;
import com.web.midterm.entity.User;
import com.web.midterm.entity.UserGroup;
import com.web.midterm.repo.ChatRepository;
import com.web.midterm.repo.PresentationRepository;
import com.web.midterm.service.group.GroupService;
import com.web.midterm.service.user.UserService;

@Service
public class ChatServiceImpl implements ChatService {
	@Autowired
	private UserService userService;
	@Autowired
	private GroupService groupService;
	@Autowired
	private PresentationRepository presentationRepository;
	@Autowired
	private ChatRepository chatRepository;
	@Value("${socket.url}")
	private String socketUrl;

	@Override
	public void save(Chat c) {
		chatRepository.save(c);
	}

	@Override
	public Chat addNewMessage(int presentId, String messageContent) throws Exception {
		User user = userService.getCurrentAuthUser();
		Chat newMessage = new Chat();
		newMessage.setCreatedAt(new Date());
		newMessage.setUser(user);
		Presentation p = presentationRepository.findById(presentId);
		if (p == null || p.isDeleted()) {
			throw new Exception("Presentation Id not found");
		}
		if (!p.isPublic()) {
			Group g = p.getGroup();
			if (g != null) {
				UserGroup userGroup = groupService.findByUserIdAndGroupId(user.getUserId(), g.getGroupId());
				if (userGroup == null) {
					throw new Exception("User Id not belong to group");
				}
			} else {
				throw new Exception("Presentation is not presenting");
			}
		}
		newMessage.setPresent(p);
		newMessage.setMessage(messageContent);
		chatRepository.save(newMessage);

		// call socket server
		// request url
		String url = socketUrl + "/chats";
		// request body parameters
		Map<String, Object> map = new HashMap<>();
		map.put("presentation", p);
		map.put("group", p.getGroup());
		map.put("chat", newMessage);

		// send POST request
		RestTemplate restTemplate = new RestTemplate();
		ResponseEntity<Void> response = restTemplate.postForEntity(url, map, Void.class);
		return newMessage;
	}

	@Override
	public Chat addNewMessageAnonymus(int presentId, String messageContent) throws Exception {
		User user = userService.findByEmail("anonymous@gmail.com");
		Chat newMessage = new Chat();
		newMessage.setCreatedAt(new Date());
		newMessage.setUser(user);
		Presentation p = presentationRepository.findById(presentId);
		if (p == null || p.isDeleted()) {
			throw new Exception("Presentation Id not found");
		}
		if (!p.isPublic()) {
			Group g = p.getGroup();
			if (g != null) {
				throw new Exception("Presentation is presenting in group");
			} else {
				throw new Exception("Presentation is not presenting");
			}
		}
		newMessage.setPresent(p);
		newMessage.setMessage(messageContent);
		chatRepository.save(newMessage);
		// call socket server
		// request url
		String url = socketUrl + "/chats";
		// request body parameters
		Map<String, Object> map = new HashMap<>();
		map.put("presentation", p);
		map.put("chat", newMessage);

		// send POST request
		RestTemplate restTemplate = new RestTemplate();
		ResponseEntity<Void> response = restTemplate.postForEntity(url, map, Void.class);
		//
		return newMessage;
	}

	@Override
	public Page<Chat> findByPresentationId(int preId, int page) throws Exception {
		Presentation p = presentationRepository.findById(preId);
		if (p == null || p.isDeleted()) {
			throw new Exception("Presentation Id not found");
		}
		if (!p.isPublic()) {
			Group g = p.getGroup();
			if (g != null) {
				User user = userService.getCurrentAuthUser();
				UserGroup userGroup = groupService.findByUserIdAndGroupId(user.getUserId(), g.getGroupId());
				if (userGroup == null) {
					throw new Exception("User not belong to group");
				}
			} else {
				throw new Exception("Presentation is not presenting");
			}
		}
		Pageable pageable = PageRequest.of(page, 5, Sort.by("createdAt").descending());
		return chatRepository.findByPresentPresentId(preId, pageable);
	}

	@Override
	public Page<Chat> findByPresentationIdPublic(int preId, int page) throws Exception {
		Presentation p = presentationRepository.findById(preId);
		if (p == null || p.isDeleted()) {
			throw new Exception("Presentation Id not found");
		}
		if (!p.isPublic()) {
			Group g = p.getGroup();
			if (g != null) {
				throw new Exception("Presentation is presenting in group");
			} else {
				throw new Exception("Presentation is not presenting");
			}
		}
		Pageable pageable = PageRequest.of(page, 5, Sort.by("createdAt").descending());

		return chatRepository.findByPresentPresentId(preId, pageable);
	}
}
