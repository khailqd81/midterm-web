package com.web.midterm.entity.dto.groupDto;

import com.web.midterm.entity.User;

import lombok.Data;

@Data
public class UserGroupResponseDto {
	private User user;
	private String role;
}