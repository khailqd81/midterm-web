package com.web.midterm.service;

import java.util.List;

import com.web.midterm.entity.Group;
import com.web.midterm.entity.User;
import com.web.midterm.entity.UserDto;

public interface UserService {
	public void save(UserDto user);
	public User findByEmail(String email);
	public User findByUserId(int id);
	public List<Group> getGroups(int userId);
}
