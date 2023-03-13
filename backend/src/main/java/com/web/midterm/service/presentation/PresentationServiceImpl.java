package com.web.midterm.service.presentation;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.web.midterm.dto.presentation_dto.PresentationDetailResponseGroupDto;
import com.web.midterm.dto.presentation_dto.PresentationDetailResponsePublicDto;
import com.web.midterm.dto.presentation_dto.PresentationListResponseDto;
import com.web.midterm.entity.Chat;
import com.web.midterm.entity.Group;
import com.web.midterm.entity.GroupRole;
import com.web.midterm.entity.Option;
import com.web.midterm.entity.Presentation;
import com.web.midterm.entity.Slide;
import com.web.midterm.entity.User;
import com.web.midterm.entity.UserAnswer;
import com.web.midterm.entity.UserGroup;
import com.web.midterm.exception.BadRequestException;
import com.web.midterm.repo.PresentationRepository;
import com.web.midterm.service.chat.ChatService;
import com.web.midterm.service.group.GroupService;
import com.web.midterm.service.slide.SlideService;
import com.web.midterm.service.user.UserService;
import com.web.midterm.service.userAnswer.UserAnswerService;

@Service
public class PresentationServiceImpl implements PresentationService {
	@Autowired
	private UserService userService;
	@Autowired
	private GroupService groupService;
	@Autowired
	private UserAnswerService userAnswerService;
	@Autowired
	private SlideService slideService;
	@Autowired
	private ChatService chatService;
	@Autowired
	private PresentationRepository presentationRepository;
	@Value("${socket.url}")
	private String socketUrl;
	
	@Override
	public Presentation findById(int id) {
		Presentation p = presentationRepository.findById(id);
		return p;
	}

	@Override
	public List<Presentation> findByUserUserId(int userId) {
		return presentationRepository.findByUserUserIdAndIsDeleted(userId, false);
	}

	@Override
	public void deleteById(int preId) throws Exception {
		User user = userService.getCurrentAuthUser();

		Presentation presentation = presentationRepository.findById(preId);
		if (presentation == null) {
			throw new Exception("Presentation Id not found");
		}

		if (user.getUserId() != presentation.getUser().getUserId()) {
			throw new Exception("Access Denied");
		}

		Group g = presentation.getGroup();
		if (g != null) {
			g.setPresent(null);
			groupService.save(g);
		}
		presentation.setGroup(null);
		presentation.setDeleted(true);
		presentationRepository.save(presentation);
	}

	@Override
	public void updatePresentationPublic(int presentId, boolean isPublic) throws Exception {
		// Get presentation from database
		Presentation p = presentationRepository.findById(presentId);
		// Check exist presentation
		if (p == null) {
			throw new BadRequestException("PresentId not found");
		}
		// Set public true and group null
		Group oldGroup = p.getGroup();
		p.setGroup(null);
		p.setPublic(isPublic);

		presentationRepository.save(p);

		// Call socket server
		// request url
		String url = socketUrl + "/presents";

		// create an instance of RestTemplate
		RestTemplate restTemplate = new RestTemplate();

		// request body parameters
		Map<String, Object> map = new HashMap<>();
		map.put("presentation", p);
		map.put("group", null);
		map.put("oldGroup", oldGroup);
		map.put("room", p.getPresentId());
		// map.put("room", p.getPresentId());

		// send POST request
		ResponseEntity<Void> response = restTemplate.postForEntity(url, map, Void.class);
		//

	}

	@Override
	public PresentationListResponseDto getPresentations() throws Exception {
		User user = userService.getCurrentAuthUser();

		List<Presentation> coListDb = user.getCoPresentationList();
		List<Presentation> coList = coListDb.stream().filter(p -> !p.isDeleted()).collect(Collectors.toList());

		List<Presentation> ownerListDb = user.getPresentationList();
		List<Presentation> ownerList = ownerListDb.stream().filter(p -> !p.isDeleted()).collect(Collectors.toList());

		return new PresentationListResponseDto(ownerList, coList);
	}

	@Override
	public Presentation getPresentationDetail(int presentId) throws Exception {
		Presentation presentation = presentationRepository.findById(presentId);
		if (presentation == null) {
			throw new BadRequestException("Presentation id not found");
		}
		return presentation;
	}

	@Override
	public void createByName(String presentName) {
		User owner = userService.getCurrentAuthUser();
		Presentation p = new Presentation();
		p.setCreatedAt(new Date());
		p.setPresentName(presentName);
		p.setUser(owner);
		presentationRepository.save(p);
	}

	@Override
	public void save(Presentation p) {
		presentationRepository.save(p);
	}

	@Override
	public PresentationDetailResponsePublicDto getPresentationDetailPublic(int presentId) throws Exception {
		Presentation p = presentationRepository.findById(presentId);
		
		if (p == null || p.isDeleted()) {
			throw new BadRequestException("Presentation Id not found");
		}
		if (!p.isPublic()) {
			throw new BadRequestException("Presentation is not presenting in public");
		}
		
		// Get answerList of the current slide
		List<UserAnswer> answerList = new ArrayList<>();
		List<Option> optionList = p.getCurrentSlide().getOptionList();
		if (optionList != null && optionList.size() > 0) {
			for (Option opt : optionList) {
				List<UserAnswer> optAnswer = userAnswerService.findByOptionId(opt.getOptionId());
				answerList.addAll(optAnswer);
			}
		}
		
		return new PresentationDetailResponsePublicDto(p.getGroup(), p, answerList);
	}

	@Override
	public PresentationDetailResponseGroupDto getPresentationDetailGroup(int presentId) throws Exception {
		Presentation p = presentationRepository.findById(presentId);
		
		if (p == null || p.isDeleted()) {
			throw new BadRequestException("Presentation id not found");
		}
		// Check user is member of the group
		User user = userService.getCurrentAuthUser();
		Group g = p.getGroup();
		if (g == null) {
			throw new BadRequestException("Presentation is not presenting");
		}
		
		String roleName = "member";
		if (g != null) {
			UserGroup userGroup = groupService.findByUserIdAndGroupId(user.getUserId(), g.getGroupId());
			if (userGroup == null) {
				throw new BadRequestException("You don't have permission to access this presentation");
			}
			GroupRole role = userGroup.getGroupRole();
			roleName = role.getRoleName();
		}
		
		// Get answerList of the current slide
		List<UserAnswer> answerList = new ArrayList<>();
		if (!roleName.equals("member")) {
			List<Option> optionList = p.getCurrentSlide().getOptionList();
			if (optionList != null && optionList.size() > 0) {
				for (Option opt : optionList) {
					List<UserAnswer> optAnswer = userAnswerService.findByOptionId(opt.getOptionId());
					answerList.addAll(optAnswer);
				}
			}
		}
		return new PresentationDetailResponseGroupDto(g, p, answerList, roleName);
	}

	@Override
	public void updateCurrentSlide(int presentId, int slideId) throws Exception {
		Slide s = slideService.findById(slideId);
		Presentation p = presentationRepository.findById(presentId);
		if (s == null || p == null) {
			throw new BadRequestException("Slide or present id  not found");
		}

		if (s.getPresentation().getPresentId() != presentId) {
			throw new BadRequestException("Slide " + slideId + " not belong to present" + presentId);
		}

		p.setCurrentSlide(s);
		presentationRepository.save(p);
		
		// Get answerList with currentSlide
		List<Option> optionList = p.getCurrentSlide().getOptionList();
		List<UserAnswer> userAnswerList = new ArrayList<>();
		if (optionList != null && optionList.size() > 0) {
			for (Option opt : optionList) {
				List<UserAnswer> optAnswer = userAnswerService.findByOptionId(opt.getOptionId());
				userAnswerList.addAll(optAnswer);
			}
		}
		
		// Get chat list
		Page<Chat> chatPage = chatService.findByPresentationId(presentId, 0);
		List<Chat> chatList = chatPage.getContent();
		int totalPage = chatPage.getTotalPages();
		
		// Call socket server
		// request url
		String url = socketUrl + "/presents";

		// create an instance of RestTemplate
		RestTemplate restTemplate = new RestTemplate();

		// request body parameters
		Map<String, Object> map = new HashMap<>();
		map.put("presentation", p);
		map.put("group", p.getGroup());
		map.put("answerList", userAnswerList);
		map.put("chatList", chatList);
		map.put("totalPage", totalPage);
		map.put("room", p.getPresentId());
		// map.put("room", p.getPresentId());

		// send POST request
		ResponseEntity<Void> response = restTemplate.postForEntity(url, map, Void.class);
		//
	}

	@Override
	public void updatePresentationGroup(int presentId, int groupId) throws Exception {
		User user = userService.getCurrentAuthUser();
		Presentation p = presentationRepository.findById(presentId);
		Group g = groupService.findById(groupId);

		if (p == null || g == null) {
			throw new BadRequestException("PresentId or GroupId not found");
		}

		// Check user permission
		if (g.getUser().getUserId() != user.getUserId()) {
			UserGroup userGroup = groupService.findByUserIdAndGroupId(user.getUserId(), groupId);
			if (userGroup == null) {
				throw new BadRequestException("You don't have permission to present");
			}
			GroupRole role = userGroup.getGroupRole();
			if (role.getRoleName() == "member") {
				throw new BadRequestException("You don't have permission to present");
			}
		}
		Presentation oldPresentation = g.getPresent();
		if (oldPresentation != null) {
			oldPresentation.setGroup(null);
			presentationRepository.save(oldPresentation);
		}
		
		Group oldGroup = p.getGroup();
		if (oldGroup != null) {
			oldGroup.setPresent(null);
			groupService.save(oldGroup);
		}
		g.setPresent(p);
		p.setGroup(g);
		p.setPublic(false);
		presentationRepository.save(p);


		// Get answerList with currentSlide
		List<Option> optionList = p.getCurrentSlide().getOptionList();
		List<UserAnswer> userAnswerList = new ArrayList<>();
		if (optionList != null && optionList.size() > 0) {
			for (Option opt : optionList) {
				List<UserAnswer> optAnswer = userAnswerService.findByOptionId(opt.getOptionId());
				userAnswerList.addAll(optAnswer);
			}
		}
		
		// Get chat list
		Page<Chat> chatPage = chatService.findByPresentationId(presentId, 0);
		List<Chat> chatList = chatPage.getContent();
		int totalPage = chatPage.getTotalPages();
		
		
		// Call socket server
		// request url
		String url = socketUrl + "/groups";

		// create an instance of RestTemplate
		RestTemplate restTemplate = new RestTemplate();

		// request body parameters
		Map<String, Object> map = new HashMap<>();
		map.put("presentation", p);
		map.put("group", p.getGroup());
		map.put("oldGroup", oldGroup);
		map.put("room", "public");
		map.put("answerList", userAnswerList);
		map.put("chatList", chatList);
		map.put("totalPage", totalPage);
		// map.put("room", p.getPresentId());

		// send POST request
		ResponseEntity<Void> response = restTemplate.postForEntity(url, map, Void.class);
		//
		
	}

	@Override
	public String addPresentCollaborator(int presentId, String email) throws Exception {
		Presentation presentation = presentationRepository.findById(presentId);
		if (email == null) {
			throw new BadRequestException("There is no email provided");
		}
		User newColaborator = userService.findByEmail(email);
		if (newColaborator == null) {
			// Entity not found
			throw new BadRequestException("Email not found");
		}
		List<User> coList = presentation.getUserList();
		if (newColaborator.getUserId() == presentation.getUser().getUserId()) {
			throw new BadRequestException("Owner can't be collaborator");
		}
		// Check exist collaborator
		int index = coList.indexOf(newColaborator);
		if (index == -1) {
			coList.add(newColaborator);
			presentation.setUserList(coList);
			presentationRepository.save(presentation);
			return "Add colaborator ok";
		} else {
			return "Colaborator existed";
		}
	}

	@Override
	public void removePresentCollaborator(int presentId, int userId) throws Exception {
		Presentation presentation = presentationRepository.findById(presentId);
		User oldColaborator = userService.findByUserId(userId);
		if (oldColaborator == null) {
			// Entity not found
			throw new BadRequestException("User Id not found");
		}
		presentation.getUserList().removeIf(u -> u.getUserId() == oldColaborator.getUserId());
		presentationRepository.save(presentation);
	}
}
