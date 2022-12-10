package com.web.midterm.service;

import com.web.midterm.entity.Slide;

public interface SlideService {
	public Slide findById(int slideId);
	public void save(Slide s);
}
