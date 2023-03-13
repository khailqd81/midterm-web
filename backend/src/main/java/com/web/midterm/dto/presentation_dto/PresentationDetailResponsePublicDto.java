package com.web.midterm.dto.presentation_dto;

import java.util.List;

import com.web.midterm.entity.Group;
import com.web.midterm.entity.Presentation;
import com.web.midterm.entity.UserAnswer;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@AllArgsConstructor
@Getter
@Setter
public class PresentationDetailResponsePublicDto {
	private Group group;
	private Presentation presentation;
	private List<UserAnswer> answerList;
}
