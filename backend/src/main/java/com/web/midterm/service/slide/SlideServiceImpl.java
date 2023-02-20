package com.web.midterm.service.slide;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.web.midterm.entity.Presentation;
import com.web.midterm.entity.Slide;
import com.web.midterm.repo.SlideRepository;

@Service
public class SlideServiceImpl implements SlideService {

	@Autowired
	private SlideRepository slideRepository;

	@Override
	public Slide findById(int slideId) {
		return slideRepository.findBySlideIdOrderBySlideIdAsc(slideId);
	}

	@Override
	public void save(Slide s) {
		slideRepository.save(s);
	}

	@Override
	public void deleteById(int slideId) throws Exception {
		Optional<Slide> optSlide = slideRepository.findById(slideId);
		if (optSlide.isPresent()) {
			Slide s = optSlide.get();
			Presentation p = s.getPresentation();
			if (p != null) {
				s.setPresentation(null);
			}
			slideRepository.save(s);
			// slideRepository.deleteById(slideId);
		} else {
			throw new Exception("Slide id not found");
		}

	}

}
