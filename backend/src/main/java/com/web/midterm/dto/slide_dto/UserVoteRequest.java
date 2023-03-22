package com.web.midterm.dto.slide_dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserVoteRequest {
	private Integer userId;
	private Integer optionId;
}
