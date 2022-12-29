package com.web.midterm.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.web.midterm.entity.Presentation;

public interface PresentationRepository extends JpaRepository<Presentation, Integer>  {
	public Presentation findById(int preId);
	public List<Presentation> findAll();
	public List<Presentation> findByUserUserId(int userId);
	public List<Presentation> findByUserUserIdAndIsDeleted(int userId, boolean isDeleted);
}
