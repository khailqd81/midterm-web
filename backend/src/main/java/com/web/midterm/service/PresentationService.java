package com.web.midterm.service;

import java.util.List;

import com.web.midterm.entity.Presentation;

public interface PresentationService {
	public Presentation findById(int id);
	public void save(Presentation p);
	public List<Presentation> findByUserUserId(int userId);
	public List<Presentation> findByUserUserIdCo(int userId);
	public void deleteById(int preId) throws Exception;
}
