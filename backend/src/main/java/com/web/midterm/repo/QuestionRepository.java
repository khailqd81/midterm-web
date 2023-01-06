package com.web.midterm.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.web.midterm.entity.Question;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Integer>{
	public List<Question> findByPresentPresentId(int preId);
	public Question findById(int questionId);
}
