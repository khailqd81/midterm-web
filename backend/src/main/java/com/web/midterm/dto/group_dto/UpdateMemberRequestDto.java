package com.web.midterm.dto.group_dto;

import javax.validation.constraints.NotNull;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@AllArgsConstructor
@Getter
@Setter
public class UpdateMemberRequestDto {
	@NotNull(message = "GroupId is required")
	private int groupId;

	@NotNull(message = "UserId is required")
	private int userId;

	@NotNull(message = "Role is required")
	private String role;

}
