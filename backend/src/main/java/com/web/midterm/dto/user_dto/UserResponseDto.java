package com.web.midterm.dto.user_dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@AllArgsConstructor
@Getter
@Setter
public class UserResponseDto {
	public UserResponseDto() {

	}

	public UserResponseDto(String email, String firstName, String lastName, String message) {
		this.email = email;
		this.firstName = firstName;
		this.lastName = lastName;
		this.message = message;
	}

	protected int userId;

	protected String email;

	protected String firstName;

	protected String lastName;

	protected String message;
}
