package com.web.midterm.service.user;


import javax.mail.MessagingException;
import javax.mail.internet.AddressException;

import com.web.midterm.dto.user_dto.SocialUserDto;
import com.web.midterm.dto.user_dto.UpdateUserDto;
import com.web.midterm.dto.user_dto.UserLoginResponseDto;
import com.web.midterm.dto.user_dto.UserRegisterRequestDto;
import com.web.midterm.entity.User;

public interface UserService {
	public void save(UserRegisterRequestDto user);
	public void save(SocialUserDto user);
	public void save(User user);
	public void update(UpdateUserDto updateUser);
	public User getCurrentAuthUser();
	public User findByEmail(String email);
	public User findByUserId(int id);
	public void sendEmailRenewPassword(String toAddress) throws AddressException, MessagingException, Exception;
	public void renewPassword(String token, String newPassword) throws Exception;
	public void register(UserRegisterRequestDto user);
	public UserLoginResponseDto loginWithOauth2(SocialUserDto user);
}
