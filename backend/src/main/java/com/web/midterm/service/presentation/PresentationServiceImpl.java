package com.web.midterm.service.presentation;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.web.midterm.entity.Group;
import com.web.midterm.entity.Presentation;
import com.web.midterm.entity.User;
import com.web.midterm.repo.PresentationRepository;
import com.web.midterm.service.group.GroupService;
import com.web.midterm.service.user.UserService;

@Service
public class PresentationServiceImpl implements PresentationService {
	@Autowired
	private UserService userService;
	@Autowired
	private GroupService groupService;
	@Autowired
	private PresentationRepository presentationRepository;
	
	@Override
	public Presentation findById(int id) {
		Presentation p =  presentationRepository.findById(id);
		return p;
	}

	@Override
	public void save(Presentation p) {
		presentationRepository.save(p);
	}

	@Override
	public List<Presentation> findByUserUserId(int userId) {
		return presentationRepository.findByUserUserIdAndIsDeleted(userId, false);
	}

	@Override
	public void deleteById(int preId) throws Exception{
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
}
