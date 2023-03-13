package com.web.midterm.dto.group_dto;

import com.web.midterm.entity.User;

import lombok.Data;

@Data
public class UserGroupResponseDto {
	private User user;
	private String role;
}