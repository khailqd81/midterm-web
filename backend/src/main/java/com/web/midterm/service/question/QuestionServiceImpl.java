package com.web.midterm.service.question;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.web.midterm.entity.Group;
import com.web.midterm.entity.Presentation;
import com.web.midterm.entity.Question;
import com.web.midterm.entity.User;
import com.web.midterm.entity.UserGroup;
import com.web.midterm.repo.PresentationRepository;
import com.web.midterm.repo.QuestionRepository;
import com.web.midterm.service.group.GroupService;
import com.web.midterm.service.user.UserService;

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
	
	@Value("${socket.url.question}")
	private String socketUrlQuestion;
	
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
		// call socket server
		// request body parameters
		Map<String, Object> map = new HashMap<>();
		map.put("presentation", p);
		map.put("group", p.getGroup());
//		// send POST request
		RestTemplate restTemplate = new RestTemplate();
		restTemplate.postForEntity(socketUrlQuestion, map, Void.class);
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
		// call socket server
		// request body parameters
		Map<String, Object> map = new HashMap<>();
		map.put("presentation", p);
		// send POST request
		RestTemplate restTemplate = new RestTemplate();
		restTemplate.postForEntity(socketUrlQuestion, map, Void.class);
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
		Presentation p = q.getPresent();
		// call socket server
		// request body parameters
		Map<String, Object> map = new HashMap<>();
		map.put("presentation", p);
		// send POST request
		RestTemplate restTemplate = new RestTemplate();
		restTemplate.postForEntity(socketUrlQuestion, map, Void.class);
		//
		return q;
	}

	@Override
	public Question updateAnsweredQuestion(int questionId) throws Exception {
		Question q = questionRepository.findById(questionId);
		if (q == null) {
			throw new Exception("Question id not found");
		}
		q.setAnswered(true);
		questionRepository.save(q);
		Presentation p = q.getPresent();
		// call socket server
		// request body parameters
		Map<String, Object> map = new HashMap<>();
		map.put("presentation", p);
		// send POST request
		RestTemplate restTemplate = new RestTemplate();
		restTemplate.postForEntity(socketUrlQuestion, map, Void.class);

		return q;
	}

	@Override
	public Question upvoteQuestionPublic(int questionId) throws Exception {
		Question q = questionRepository.findById(questionId);
		if (q == null) {
			throw new Exception("Question id not found");
		}
		q.setVote(q.getVote() + 1);
		questionRepository.save(q);

		Presentation p = q.getPresent();
		// call socket server
		// request body parameters
		Map<String, Object> map = new HashMap<>();
		map.put("presentation", p);
		RestTemplate restTemplate = new RestTemplate();
		restTemplate.postForEntity(socketUrlQuestion, map, Void.class);
		//
		return q;
	}

}
