package com.web.midterm.service;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collection;
import java.util.Date;
import java.util.List;
import java.util.UUID;

import javax.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.web.midterm.entity.Group;
import com.web.midterm.entity.SocialUserDto;
import com.web.midterm.entity.User;
import com.web.midterm.entity.UserDto;
import com.web.midterm.entity.Verifytoken;
import com.web.midterm.repo.UserRepository;

@Service
public class UserServiceImpl implements UserService, UserDetailsService {
	@Autowired
	private UserRepository userRepository;
	
	@Autowired
	private PasswordEncoder passwordEncoder;
	
	@Autowired
	private VerifytokenService verifytokenService;
	
	@Override
	@Transactional
	public void save(UserDto user) {
		User newUser = new User();
		newUser.setEmail(user.getEmail());
		if (user.getPassword() != null ) {
			newUser.setPassword(passwordEncoder.encode(user.getPassword()));			
		}
		newUser.setProvider("LOCAL");
		newUser.setFirstName(user.getFirstName());
		newUser.setLastName(user.getLastName());
		newUser.setGender(user.getGender());
		newUser.setRole("ROLE_USER");
		userRepository.save(newUser);
	}
	
	@Override
	@Transactional
	public void save(SocialUserDto user) {
		User newUser = new User();
		newUser.setEmail(user.getEmail());
		newUser.setPassword(null);
		newUser.setEnabled(true);
		newUser.setProvider("GOOGLE");
		newUser.setFirstName(user.getFirstName());
		newUser.setLastName(user.getLastName());
		newUser.setRole("ROLE_USER");
		userRepository.save(newUser);
	}

	@Override
	@Transactional
	public User findByEmail(String email) {
		User user = userRepository.findByEmail(email);
		return user;
	}

	@Override
	public List<Group> getGroups(int userId) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
		User user = userRepository.findByEmail(email);
		
		if (user == null) {
			throw new UsernameNotFoundException("Invalid email or password");
		} 
		
		if (user != null && !user.isEnabled()) {
			// re-send verify email
			String token = UUID.randomUUID().toString();
			Date dt = new Date();
			Calendar c = Calendar.getInstance();
			c.setTime(dt);
			c.add(Calendar.MINUTE, 15);
			dt = c.getTime();
			verifytokenService
					.saveVerifytoken(new Verifytoken(token, new Date(), dt, userRepository.findByEmail(user.getEmail())));

			verifytokenService.sendMail(user.getEmail(), token);
			throw new UsernameNotFoundException("Account is not activated. Check your email for verify");
		} 
		
		if (user.getProvider().equals("GOOGLE")) {
			throw new UsernameNotFoundException("This email has been registered with Google before");
		}
		Collection<SimpleGrantedAuthority> authorities = new ArrayList<>();
		authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
		return new org.springframework.security.core.userdetails.User(email, user.getPassword(), authorities);
	}

	@Override
	public User findByUserId(int id) {
		
		return userRepository.findByUserId(id);
	}

	@Override
	public void save(User user) {
		userRepository.save(user);
	}

}
