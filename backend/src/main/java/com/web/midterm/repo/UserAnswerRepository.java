package com.web.midterm.repo;

import org.springframework.data.jpa.repository.JpaRepository;

import com.web.midterm.entity.UserAnswer;

public interface UserAnswerRepository extends JpaRepository<UserAnswer, Integer>  {

}
