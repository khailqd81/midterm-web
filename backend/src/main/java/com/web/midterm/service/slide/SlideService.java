package com.web.midterm.service.slide;

import com.web.midterm.entity.Slide;

public interface SlideService {
	public Slide findById(int slideId);
	public void save(Slide s);
	public void deleteById(int slideId) throws Exception;
}
