package com.web.midterm.dto.group_dto;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@AllArgsConstructor
@Getter
@Setter
public class IsMemberDto {
	private String message;

	private boolean isMember;
}
