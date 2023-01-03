package com.web.midterm.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.web.midterm.entity.UserAnswer;

public interface UserAnswerRepository extends JpaRepository<UserAnswer, Integer>  {
	public List<UserAnswer> findByOptionOptionId(int optId);
}
