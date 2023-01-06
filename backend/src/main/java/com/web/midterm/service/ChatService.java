package com.web.midterm.service;


import org.springframework.data.domain.Page;

import com.web.midterm.entity.Chat;

public interface ChatService {
	public void save(Chat c);
	public Chat addNewMessage(int presentId, String messageContent) throws Exception;
	Page<Chat> findByPresentationId(int preId, int page) throws Exception;
	Chat addNewMessageAnonymus(int presentId, String messageContent) throws Exception;
	Page<Chat> findByPresentationIdPublic(int preId, int page) throws Exception;
}
