package com.web.midterm.dto.presentation_dto;

import com.web.midterm.entity.Group;
import com.web.midterm.entity.Presentation;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class PresentationDetailResponseDto {
	private Group group;
	private Presentation presentation;
}
