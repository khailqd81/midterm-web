package com.web.midterm.controller;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.corundumstudio.socketio.SocketIOClient;
import com.corundumstudio.socketio.SocketIOServer;
import com.web.midterm.entity.Option;
import com.web.midterm.entity.Presentation;
import com.web.midterm.entity.Slide;
import com.web.midterm.repo.OptionRepository;
import com.web.midterm.service.OptionService;
import com.web.midterm.service.PresentationService;
import com.web.midterm.service.SlideService;
import com.web.midterm.socketio.SocketService;
import com.web.midterm.socketio.SocketUpdateMessage;

@RestController
@RequestMapping("/api/slides")
public class SlideController {

	@Autowired
	private SlideService slideService;
	@Autowired
	private PresentationService presentationService;
	@Autowired
	private OptionRepository optionRepository;
	@Autowired
	private OptionService optionService;
	@Autowired
	private SocketIOServer socketIOServer;
	@Autowired
	private SocketService socketService;

	@PostMapping
	public ResponseEntity<?> createSlide(@RequestBody Map<String, String> payload) throws Exception {
		Slide s = new Slide();
		String typeName = payload.get("typeName");
		String presentId = payload.get("preId");

		if (typeName.equals("multiple")) {
			s.setHeading("Multiple Choice");
		} else if (typeName.equals("paragraph")) {
			s.setHeading("Paragraph");
		} else {
			s.setHeading("Heading");
		}
		
		s.setTypeName(typeName);
		Presentation p = presentationService.findById(Integer.parseInt(presentId));
		if (p == null) {
			throw new Exception("Presentation not found");
		}

		s.setPresentation(p);
		slideService.save(s);
		Map<String, Slide> message = new HashMap<>();
		message.put("slide", s);
		return ResponseEntity.ok(message);
	}

	@PutMapping
	public ResponseEntity<?> updateSlide(@RequestBody Slide slide) throws Exception {

		int slideId = slide.getSlideId();

		Slide theSlide = slideService.findById(slideId);
		if (theSlide == null) {
			throw new Exception("Slide ID not found");
		}
		List<Option> optionList = slide.getOptionList();
		// If slide has optionList
		if (optionList != null && optionList.size() > 0) {
			List<Option> newOptionList = new ArrayList<>();
			for (Option opt : optionList) {
				// if option is new
				if (opt.getOptionId() == 0) {
					newOptionList.add(opt);

				} else {
					// if update existed option
					Option theOpt = optionRepository.findById(opt.getOptionId());
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
		theSlide.setHeading(slide.getHeading());
		slideService.save(theSlide);

		// Handle send update slide to client through socket
		Collection<SocketIOClient> clients = socketIOServer.getRoomOperations("public").getClients();
		SocketUpdateMessage socketMessage = new SocketUpdateMessage();
		socketMessage.setRoom("public");
		socketMessage.setUsername("khai");
		socketMessage.setSlide(theSlide);
		socketService.sendUpdateSlideToClient(clients, socketMessage, "public");
		Map<String, String> message = new HashMap<>();
		message.put("message", "Update slide success");
		return ResponseEntity.ok(message);
	}

//	@PostMapping("/{slideId}")
//	public ResponseEntity<?> updateOptionList(@PathVariable int slideId, @RequestBody Option opt) throws Exception {
//		Slide s = slideService.findById(slideId);
//		if (s == null) {
//			throw new Exception("Slide Id not found");
//		}
//		System.out.println("Option: " + opt);
//		Option optDb = optionRepository.findById(opt.getOptionId());
//		if (optDb == null ) {
//			throw new Exception("Option Id not found");
//		}
//		Collection<SocketIOClient> clients = socketIOServer.getRoomOperations("public").getClients();
//		optDb.setVote(optDb.getVote() + 1);
//		optionRepository.save(optDb);
//		this.sendSocketMessage(clients, optDb);
//		Map<String, String> message = new HashMap<>();
//		message.put("message", "Update slide success");
//		return ResponseEntity.ok(message);
//	}

	@DeleteMapping("/{slideId}")
	public ResponseEntity<?> deleteSlide(@PathVariable int slideId) throws Exception {
		Slide s = slideService.findById(slideId);
		if (s == null) {
			throw new Exception("Slide Id not found");
		}
		slideService.deleteById(slideId);
		Map<String, String> message = new HashMap<>();
		message.put("message", "Delete slide success");
		return ResponseEntity.ok(message);
	}

//	@GetMapping
//	public ResponseEntity<?> getSlides() {
//		// Get user from access token
//		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
//		String currentPrincipalName = authentication.getName();
//		User user = userService.findByEmail(currentPrincipalName);
//
//		List<Presentation> presentationList = presentationService.findByUserUserId(user.getUserId());
//		Map<String, List<Presentation>> message = new HashMap<>();
//		message.put("presentation-list", presentationList);
//		return ResponseEntity.ok(message);
//	}

	@GetMapping("/{slideId}")
	public ResponseEntity<?> getPresentationDetail(@PathVariable int slideId) throws Exception {
		// Get user from access token
//		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
//		String currentPrincipalName = authentication.getName();
//		User user = userService.findByEmail(currentPrincipalName);

		Slide slide = slideService.findById(slideId);
		if (slide == null) {
			throw new Exception("Slid id not found");
		}
		Presentation presentation = slide.getPresentation();
		presentation.setCurrentSlide(slide);
		presentationService.save(presentation);
		
		// Call socket server
		//
		
		Map<String, Slide> message = new HashMap<>();
		message.put("slide", slide);
		return ResponseEntity.ok(message);
	}

	@GetMapping("/vote/{slideId}")
	public ResponseEntity<?> getPresentationDetailVote(@PathVariable int slideId) {
		// Get user from access token
//		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
//		String currentPrincipalName = authentication.getName();
//		User user = userService.findByEmail(currentPrincipalName);

		Slide slide = slideService.findById(slideId);
		Map<String, Slide> message = new HashMap<>();
		message.put("slide", slide);
		return ResponseEntity.ok(message);
	}

	public static void sendSocketMessage(Collection<SocketIOClient> clients, Option message) {
		for (SocketIOClient client : clients) {
			client.sendEvent("read_message", message);

		}
	}
}
