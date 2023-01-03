package com.web.midterm.service;

import java.util.List;

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

	@Override
	public List<UserAnswer> findByOptionId(int optId) {
		return userAnswerRepository.findByOptionOptionId(optId);
		
	}

}
