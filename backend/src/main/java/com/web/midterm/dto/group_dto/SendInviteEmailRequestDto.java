package com.web.midterm.dto.group_dto;

import javax.validation.constraints.NotNull;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@AllArgsConstructor
@Getter
@Setter
public class SendInviteEmailRequestDto {
	@NotNull(message = "GroupId is required")
	private int groupId;

	@NotNull(message = "UserId is required")
	private String memberEmail;

}
