package com.web.midterm.service;

import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.web.midterm.entity.Group;
import com.web.midterm.entity.Presentation;
import com.web.midterm.entity.Question;
import com.web.midterm.entity.User;
import com.web.midterm.entity.UserGroup;
import com.web.midterm.repo.PresentationRepository;
import com.web.midterm.repo.QuestionRepository;

@Service
public class QuestionServiceImpl implements QuestionService {
	@Autowired
	private UserService userService;
	@Autowired
	private GroupService groupService;
	@Autowired
	private QuestionRepository questionRepository;
	@Autowired
	private PresentationRepository presentationRepository;
	@Override
	public void save(Question q) {
		questionRepository.save(q);
	}

	@Override
	public List<Question> findByPresentationId(int preId) throws Exception {
		Presentation p = presentationRepository.findById(preId);
		if (p==null) {
			throw new Exception("Presentation Id not found");
		}
		return questionRepository.findByPresentPresentId(preId);
	}

	@Override
	public Question addNewQuestion(int presentId, String questionContent) throws Exception {
		User user = userService.getCurrentAuthUser();
		Question newQuestion = new Question();
		newQuestion.setCreatedAt(new Date());
		newQuestion.setUser(user);
		Presentation p = presentationRepository.findById(presentId);
		if (p == null || p.isDeleted()) {
			throw new Exception("Presentation Id not found");
		}
		if (!p.isPublic()) {
			Group g = p.getGroup();
			if (g != null) {
				UserGroup userGroup = groupService.findByUserIdAndGroupId(user.getUserId(), g.getGroupId());
				if (userGroup == null) {
					throw new Exception("User Id not belong to group");
				}
			} else {
				throw new Exception("Presentation is not presenting");
			}
		}
		newQuestion.setPresent(p);
		newQuestion.setContent(questionContent);
		questionRepository.save(newQuestion);
		return newQuestion;
	}

	@Override
	public Question addNewQuestionPublic(int presentId, String questionContent) throws Exception {
		User user = userService.findByEmail("anonymous@gmail.com");
		Question newQuestion = new Question();
		newQuestion.setCreatedAt(new Date());
		newQuestion.setUser(user);
		Presentation p = presentationRepository.findById(presentId);
		if (p == null || p.isDeleted()) {
			throw new Exception("Presentation Id not found");
		}
		if (!p.isPublic()) {
			Group g = p.getGroup();
			if (g != null) {
				throw new Exception("Presentation is presenting in group");
			} else {
				throw new Exception("Presentation is not presenting");
			}
		}
		newQuestion.setPresent(p);
		newQuestion.setContent(questionContent);;
		questionRepository.save(newQuestion);
		return newQuestion;
	}

	@Override
	public Question upvoteQuestion(int questionId) throws Exception {
		Question q = questionRepository.findById(questionId);
		if (q == null) {
			throw new Exception("Question id not found");
		}
		q.setVote(q.getVote() + 1);
		questionRepository.save(q);
		return q;
	}

	@Override
	public Question updateAnsweredQuestion(int questionId) throws Exception {
		User user = userService.getCurrentAuthUser();
		// Check owner or co-owner
		//
		Question q = questionRepository.findById(questionId);
		if (q == null) {
			throw new Exception("Question id not found");
		}
		q.setAnswered(true);
		questionRepository.save(q);
		return q;
	}

	@Override
	public Question upvoteQuestionPublic(int questionId) throws Exception {
		// TODO Auto-generated method stub
		return null;
	}

}
