package com.web.midterm.dto.user_dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@AllArgsConstructor
@Getter
@Setter
public class UserLoginResponseDto {
	
	protected String accessToken;

	protected String refreshToken;

	protected String message;
}
