package com.web.midterm.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.web.midterm.entity.UserAnswer;
import com.web.midterm.repo.UserAnswerRepository;

@Service
public class UserAnswerServiceImple implements UserAnswerService {
	
	@Autowired
	private UserAnswerRepository userAnswerRepository;
	
	@Override
	public void save(UserAnswer an) {
		userAnswerRepository.save(an);
	}

}
