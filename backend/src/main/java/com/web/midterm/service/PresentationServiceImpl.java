package com.web.midterm.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.web.midterm.entity.Presentation;
import com.web.midterm.repo.PresentationRepository;

@Service
public class PresentationServiceImpl implements PresentationService {
	@Autowired
	private PresentationRepository presentationRepository;
	@Override
	public Presentation findById(int id) {
		return presentationRepository.findById(id);
	}

	@Override
	public void save(Presentation p) {
		presentationRepository.save(p);
	}

	@Override
	public List<Presentation> findByUserUserId(int userId) {
		return presentationRepository.findByUserUserId(userId);
	}

	@Override
	public void deleteById(int preId) {
		presentationRepository.deleteById(preId);
	}

	
}
