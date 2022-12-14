package com.web.midterm.repo;

import org.springframework.data.jpa.repository.JpaRepository;

import com.web.midterm.entity.Option;

public interface OptionRepository extends JpaRepository<Option, Integer> {
	public Option findById(int optionId);
	public void deleteByOptionId(int optionId);
}
