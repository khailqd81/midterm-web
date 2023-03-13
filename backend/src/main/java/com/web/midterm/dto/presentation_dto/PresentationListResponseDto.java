package com.web.midterm.dto.presentation_dto;

import java.util.List;

import com.web.midterm.entity.Presentation;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@AllArgsConstructor
@Getter
@Setter
public class PresentationListResponseDto {
	private List<Presentation> presentationList;

	private List<Presentation> coPresentationList;
}
