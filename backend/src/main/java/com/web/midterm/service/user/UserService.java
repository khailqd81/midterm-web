package com.web.midterm.service.user;

import java.util.List;

import javax.mail.MessagingException;
import javax.mail.internet.AddressException;

import com.web.midterm.entity.Group;
import com.web.midterm.entity.User;
import com.web.midterm.entity.dto.SocialUserDto;
import com.web.midterm.entity.dto.UpdateUserDto;
import com.web.midterm.entity.dto.UserDto;

public interface UserService {
	public void save(UserDto user);
	public void save(SocialUserDto user);
	public void save(User user);
	public void update(UpdateUserDto updateUser);
	public User getCurrentAuthUser();
	public User findByEmail(String email);
	public User findByUserId(int id);
	public void sendEmailRenewPassword(String toAddress) throws AddressException, MessagingException, Exception;
	public void renewPassword(String token, String newPassword) throws Exception;
	public List<Group> getGroups(int userId);
	public void register(UserDto user);
}
