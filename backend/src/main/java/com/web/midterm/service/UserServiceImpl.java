package com.web.midterm.service;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collection;
import java.util.Date;
import java.util.List;
import java.util.UUID;

import javax.mail.MessagingException;
import javax.mail.internet.AddressException;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;
import javax.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
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

	@Autowired
	private JavaMailSender mailSender;

	@Autowired
	private Environment env;

	@Override
	@Transactional
	public void save(UserDto user) {
		User newUser = new User();
		newUser.setEmail(user.getEmail());
		if (user.getPassword() != null) {
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
			verifytokenService.saveVerifytoken(
					new Verifytoken(token, new Date(), dt, userRepository.findByEmail(user.getEmail())));

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

	@Override
	public User getCurrentAuthUser() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		String currentPrincipalName = authentication.getName();
		User user = userRepository.findByEmail(currentPrincipalName);
		return user;
	}

	@Override
	public void sendEmailRenewPassword(String toAddress) throws AddressException, MessagingException, Exception {
		User user = userRepository.findByEmail(toAddress);
		if (user == null) {
			throw new Exception("There is no user with this email: " + toAddress);
		}
		MimeMessage message = mailSender.createMimeMessage();
		message.setRecipient(MimeMessage.RecipientType.TO, new InternetAddress(toAddress, false));
		String token = UUID.randomUUID().toString();
		//String encodeToken = passwordEncoder.encode(token);
		// Store renew token
		Date dt = new Date();
		Calendar c = Calendar.getInstance();
		c.setTime(dt);
		c.add(Calendar.MINUTE, 15);
		dt = c.getTime();
		verifytokenService.saveVerifytoken(new Verifytoken(token, new Date(), dt, user));
		message.setSubject("Renew Password Link");
		String renewLink = env.getProperty("frontend.url") + "/renewPassword/" + token;
		//message.setContent("<h1>Link to renew your password: </h1>" + renewLink, "text/html; charset=utf-8");
		message.setContent("<div style=\"text-align: left; font-size: 16px\" >"
				+ "<div style=\"font-weight: bold;font-size: 20px\">Link to renew password (expire in 15 minutes):</div>"
				+ "<div>"
				+ renewLink                  
				+ "</div>"
				+ "</div>","text/html; charset=utf-8");
		mailSender.send(message);
	}

	@Override
	public void renewPassword(String token, String newPassword) throws Exception {
		Verifytoken verifytoken = verifytokenService.findByToken(token);
		if (verifytoken != null) {
			if (verifytoken.getExpiredAt().before(new Date())) {
				throw new Exception("Token expired.");
			}
			User user = verifytoken.getUser();
			user.setPassword(passwordEncoder.encode(newPassword));
			userRepository.save(user);
		} else {
			throw new Exception("Invalid token.");
		}
	}

}
