package com.web.midterm.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.web.midterm.entity.Slide;
import com.web.midterm.repo.SlideRepository;

@Service
public class SlideServiceImpl implements SlideService {
	
	@Autowired
	private SlideRepository slideRepository;
	
	@Override
	public Slide findById(int slideId) {
		return slideRepository.findById(slideId);
	}

	@Override
	public void save(Slide s) {
		slideRepository.save(s);
	}

}
