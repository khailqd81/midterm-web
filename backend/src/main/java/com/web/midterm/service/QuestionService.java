package com.web.midterm.service;

import java.util.List;

import com.web.midterm.entity.Question;

public interface QuestionService {
	void save(Question q);
	Question addNewQuestion(int presentId, String questionContent) throws Exception;
	Question addNewQuestionPublic(int presentId, String questionContent) throws Exception;
	List<Question> findByPresentationId(int preId) throws Exception;
	Question upvoteQuestion(int questionId) throws Exception;
	Question upvoteQuestionPublic(int questionId) throws Exception;
	Question updateAnsweredQuestion(int questionId) throws Exception;
}
