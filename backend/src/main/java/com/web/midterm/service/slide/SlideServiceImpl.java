package com.web.midterm.service.slide;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.web.midterm.dto.slide_dto.UserVoteRequest;
import com.web.midterm.entity.Option;
import com.web.midterm.entity.Presentation;
import com.web.midterm.entity.Slide;
import com.web.midterm.entity.User;
import com.web.midterm.entity.UserAnswer;
import com.web.midterm.repo.PresentationRepository;
import com.web.midterm.repo.SlideRepository;
import com.web.midterm.service.option.OptionService;
import com.web.midterm.service.user.UserService;
import com.web.midterm.service.userAnswer.UserAnswerService;

@Service
public class SlideServiceImpl implements SlideService {

	@Autowired
	private OptionService optionService;
	@Autowired
	private UserService userService;
	@Autowired
	private UserAnswerService userAnswerService;
	@Autowired
	private SlideRepository slideRepository;
	@Autowired
	private PresentationRepository presentationRepository;
	@Value("${socket.url}")
	private String socketUrl;

	@Override
	public Slide findById(int slideId) {
		return slideRepository.findBySlideIdOrderBySlideIdAsc(slideId);
	}

	@Override
	public void save(Slide s) {
		slideRepository.save(s);
	}

	@Override
	public void deleteById(int slideId) throws Exception {
		// Delete slide
		Optional<Slide> optSlide = slideRepository.findById(slideId);
		Presentation presentation = null;
		if (optSlide.isPresent()) {
			Slide s = optSlide.get();
			presentation = s.getPresentation();
			if (presentation != null) {
				s.setPresentation(null);
			}
			slideRepository.save(s);
			// slideRepository.deleteById(slideId);
		} else {
			throw new Exception("Slide id not found");
		}
		
		List<Slide> slideList = presentation.getSlideList().stream().filter(s -> s.getSlideId() != slideId)
				.collect(Collectors.toList());
		presentation.setSlideList(slideList);

		// Call socket server
		// request url
		String url = socketUrl + "/slides";

		// create an instance of RestTemplate
		RestTemplate restTemplate = new RestTemplate();

		// request body parameters
		Map<String, Object> map = new HashMap<>();
		map.put("presentation", presentation);
		map.put("group", presentation.getGroup());
		// send POST request
		ResponseEntity<Void> response = restTemplate.postForEntity(url, map, Void.class);

	}

	@Override
	public Slide create(String typeName, int presentId) throws Exception {
		Slide s = new Slide();
		if (typeName.equals("multiple")) {
			s.setHeading("Multiple Choice");
		} else if (typeName.equals("paragraph")) {
			s.setHeading("Paragraph");
		} else {
			s.setHeading("Heading");
		}

		s.setTypeName(typeName);
		Presentation p = presentationRepository.findById(presentId);
		if (p == null) {
			throw new Exception("Presentation not found");
		}
		s.setPresentation(p);
		slideRepository.save(s);
		
		p.setCurrentSlide(s);
		presentationRepository.save(p);
		
		return s;
	}

	@Override
	public void update(Slide s) throws Exception {
		int slideId = s.getSlideId();

		Slide theSlide = slideRepository.findById(slideId).get();
		if (theSlide == null) {
			throw new Exception("Slide ID not found");
		}
		List<Option> optionList = s.getOptionList();
		// If slide has optionList
		if (optionList != null && optionList.size() > 0) {
			List<Option> newOptionList = new ArrayList<>();
			for (Option opt : optionList) {
				// if option is new
				if (opt.getOptionId() == 0) {
					newOptionList.add(opt);

				} else {
					// if update existed option
					Option theOpt = optionService.findById(opt.getOptionId());
					if (theOpt == null) {
						throw new Exception("Option Id not found");
					}
					if (theOpt.getSlide().getSlideId() != theSlide.getSlideId()) {
						throw new Exception("Option Slide Id and Slide Id mis match");
					}
					theOpt.setOptionName(opt.getOptionName());
					theOpt.setVote(opt.getVote());
					newOptionList.add(theOpt);
				}
				opt.setSlide(theSlide);
			}
			//
			List<Option> oldOptionList = theSlide.getOptionList();
			List<Integer> indexDelete = new ArrayList<>();
			int count = 0;
			for (Option option : oldOptionList) {
				if (!newOptionList.contains(option)) {
					indexDelete.add(option.getOptionId());
				} else {
					count++;
					System.out.println("contain" + count);
				}
			}

			theSlide.setOptionList(newOptionList);
			if (!indexDelete.isEmpty()) {
				for (Integer integer : indexDelete) {
					System.out.println("Delete");
					Option theOption = optionService.findById(integer);
					theOption.setSlide(null);
					optionService.deleteById(integer);
				}
			}
		}
		theSlide.setParagraph(s.getParagraph());
		theSlide.setSubHeading(s.getSubHeading());
		theSlide.setHeading(s.getHeading());
		slideRepository.save(theSlide);

		// Handle send update slide to client through socket
		Presentation presentation = theSlide.getPresentation();
		presentation.setCurrentSlide(theSlide);
		
		List<Option> theOptionList = theSlide.getOptionList();
		List<UserAnswer> userAnswerList = new ArrayList<>();
		if (theOptionList != null && theOptionList.size() > 0) {
			for (Option opt : theOptionList) {
				List<UserAnswer> optAnswer = userAnswerService.findByOptionId(opt.getOptionId());
				userAnswerList.addAll(optAnswer);
			}
		}
		
		// Call socket server
		// request url
		String url = socketUrl + "/slides";

		// create an instance of RestTemplate
		RestTemplate restTemplate = new RestTemplate();

		// request body parameters
		Map<String, Object> map = new HashMap<>();
		map.put("presentation", presentation);
		map.put("answerList", userAnswerList);
		map.put("group", presentation.getGroup());

		// send POST request
		ResponseEntity<Void> response = restTemplate.postForEntity(url, map, Void.class);
		
	}

	@Override
	public Slide getSlideDetailById(int slideId) throws Exception {
		Slide slide = slideRepository.findById(slideId).get();
		if (slide == null) {
			throw new Exception("Slide Id not found");
		}
		Presentation presentation = slide.getPresentation();
		presentation.setCurrentSlide(slide);
		presentationRepository.save(presentation);
		return slide;
	}

	@Override
	public List<UserAnswer> getSlideAnswerList(int slideId) throws Exception {
		Slide slide = slideRepository.findById(slideId).get();
		if (slide == null) {
			throw new Exception("Slide Id not found");
		}
		List<Option> optionList = slide.getOptionList();
		List<UserAnswer> userAnswerList = new ArrayList<>();
		if (optionList != null && optionList.size() > 0) {
			for (Option opt : optionList) {
				List<UserAnswer> optAnswer = userAnswerService.findByOptionId(opt.getOptionId());
				userAnswerList.addAll(optAnswer);
			}
		}
		return userAnswerList;
	}

	@Override
	public Slide updateSlideVote(int slideId, UserVoteRequest dto) throws Exception {
		User user = null;
		if (dto.getUserId() != null) {
			int userId = dto.getUserId();
			user = userService.findByUserId(userId);
			if (user == null) {
				throw new Exception("User Id not found");
			}
		} else {
			user = userService.findByEmail("anonymous@gmail.com");
		}
		int optionId = dto.getOptionId();
		Slide slide = slideRepository.findById(slideId).get();
		if (slide == null) {
			throw new Exception("Slide Id not found");
		}
		Option option = optionService.findById(optionId);
		if (option == null) {
			throw new Exception("Option Id not found");
		}
		if (!slide.getOptionList().contains(option)) {
			throw new Exception("Option " + optionId + " not belong to Slide " + slideId);
		}

		option.setVote(option.getVote() + 1);
		optionService.save(option);
		
		UserAnswer userAnswer = new UserAnswer();
		userAnswer.setUser(user);
		userAnswer.setOption(option);
		userAnswer.setCreatedAt(new Date());
		userAnswerService.save(userAnswer);
		// Call socket server
		// request url
		String url = socketUrl + "/slides";

		// create an instance of RestTemplate
		RestTemplate restTemplate = new RestTemplate();

		// request body parameters
		Presentation presentation = slide.getPresentation();
		Map<String, Object> map = new HashMap<>();
		map.put("presentation", presentation);
		map.put("group", presentation.getGroup());
		map.put("userAnswer", userAnswer);
		map.put("room", presentation.getPresentId());
		// map.put("room", p.getPresentId());

		// send POST request
		ResponseEntity<Void> response = restTemplate.postForEntity(url, map, Void.class);
		
		return slide;
	}

}
