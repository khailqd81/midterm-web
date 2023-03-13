package com.web.midterm.service.presentation;

import java.util.List;

import com.web.midterm.dto.presentation_dto.PresentationDetailResponseGroupDto;
import com.web.midterm.dto.presentation_dto.PresentationDetailResponsePublicDto;
import com.web.midterm.dto.presentation_dto.PresentationListResponseDto;
import com.web.midterm.entity.Presentation;

public interface PresentationService {
	public Presentation findById(int id);

	public void createByName(String presentName);

	public void save(Presentation p);

	public List<Presentation> findByUserUserId(int userId);

	public void deleteById(int preId) throws Exception;

	public void updatePresentationPublic(int presentId, boolean isPublic) throws Exception;

	public PresentationListResponseDto getPresentations() throws Exception;

	public Presentation getPresentationDetail(int presentId) throws Exception;

	public PresentationDetailResponsePublicDto getPresentationDetailPublic(int presentId) throws Exception;

	public PresentationDetailResponseGroupDto getPresentationDetailGroup(int presentId) throws Exception;

	public void updateCurrentSlide(int presentId, int slideId) throws Exception;

	public void updatePresentationGroup(int presentId, int groupId) throws Exception;

	public String addPresentCollaborator(int presentId, String email) throws Exception;
	public void removePresentCollaborator(int presentId, int userId) throws Exception;
}
