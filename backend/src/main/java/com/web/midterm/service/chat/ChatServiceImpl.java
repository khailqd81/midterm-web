package com.web.midterm.service.chat;

import java.util.Date;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.web.midterm.entity.Chat;
import com.web.midterm.entity.Group;
import com.web.midterm.entity.Presentation;
import com.web.midterm.entity.User;
import com.web.midterm.entity.UserGroup;
import com.web.midterm.repo.ChatRepository;
import com.web.midterm.service.group.GroupService;
import com.web.midterm.service.presentation.PresentationService;
import com.web.midterm.service.user.UserService;

@Service
public class ChatServiceImpl implements ChatService {
	@Autowired
	private UserService userService;
	@Autowired
	private GroupService groupService;
	@Autowired
	private PresentationService presentationService;
	@Autowired
	private ChatRepository chatRepository;

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
		Presentation p = presentationService.findById(presentId);
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
		return newMessage;
	}
	
	@Override
	public Chat addNewMessageAnonymus(int presentId, String messageContent) throws Exception {
		User user = userService.findByEmail("anonymous@gmail.com");
		Chat newMessage = new Chat();
		newMessage.setCreatedAt(new Date());
		newMessage.setUser(user);
		Presentation p = presentationService.findById(presentId);
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
		return newMessage;
	}
	
	@Override
	public Page<Chat> findByPresentationId(int preId, int page) throws Exception {
		Presentation p = presentationService.findById(preId);
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
		Presentation p = presentationService.findById(preId);
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
