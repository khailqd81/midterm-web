package com.web.midterm.entity.dto;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotNull;

import lombok.Data;

@Data
public class SocialUserDto {
	
	@NotNull(message = "Email is required")
	@Email(message="Wrong email format")
	private String email;
	private String firstName;
	private String lastName;
	
}
