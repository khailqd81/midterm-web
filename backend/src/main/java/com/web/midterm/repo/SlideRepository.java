package com.web.midterm.repo;

import org.springframework.data.jpa.repository.JpaRepository;

import com.web.midterm.entity.Slide;

public interface SlideRepository extends JpaRepository<Slide, Integer>  {
	public Slide findBySlideIdOrderBySlideIdAsc(int id);
}
