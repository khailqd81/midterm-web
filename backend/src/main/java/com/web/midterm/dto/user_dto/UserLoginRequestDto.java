package com.web.midterm.dto.user_dto;

import javax.validation.constraints.NotNull;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class UserLoginRequestDto {
	
	@NotNull(message = "Email is required")
	private String email;
	@NotNull(message = "Password is required")
	private String password;

}
