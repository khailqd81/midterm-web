package com.web.midterm.service;

import java.util.List;

import com.web.midterm.entity.UserAnswer;

public interface UserAnswerService {
	public void save(UserAnswer an);
	public List<UserAnswer> findByOptionId(int optId);
}
