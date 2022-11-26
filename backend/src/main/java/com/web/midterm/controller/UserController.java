package com.web.midterm.controller;

import java.net.URI;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.web.midterm.entity.SocialUserDto;
import com.web.midterm.entity.User;
import com.web.midterm.entity.UserDto;
import com.web.midterm.entity.Verifytoken;
import com.web.midterm.service.UserService;
import com.web.midterm.service.VerifytokenService;
import com.web.midterm.utils.JWTHandler;

@RestController
@RequestMapping("/api/user")
public class UserController {
	@Autowired
	private UserService userService;
	@Autowired
	private VerifytokenService verifytokenService;
	@Autowired
	private JWTHandler jwtHandler;

	@GetMapping
	public ResponseEntity<?> getUser() {
		// Get user from access token
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		String currentPrincipalName = authentication.getName();
		User user = userService.findByEmail(currentPrincipalName);
		Map<String, Object> response = new HashMap<>();
		response.put("userId", user.getUserId());
		response.put("email", user.getEmail());
		response.put("firstName", user.getFirstName());
		response.put("lastName", user.getLastName());
		return ResponseEntity.ok().body(response);
	}

	@PostMapping("/register")
	public ResponseEntity<?> registerUser(@RequestBody @Valid UserDto user, BindingResult bindingResult)
			throws Exception {
		Map<String, String> jsonResponse = new HashMap<>();
		// validation
		if (bindingResult.hasErrors()) {
			List<FieldError> errors = bindingResult.getFieldErrors();
			List<String> errorMessage = new ArrayList<>();
			for (FieldError error : errors) {
				errorMessage.add(error.getDefaultMessage());
				System.out.println(error.getObjectName() + " - " + error.getDefaultMessage());
			}

			jsonResponse.put("message", "Validation failed");
			return ResponseEntity.badRequest().body(jsonResponse);
			// throw new Exception("Validation failed: " + errorMessage);
		}

		// Check exists email
		User theUser = userService.findByEmail(user.getEmail());
		if (theUser != null) {
			jsonResponse.put("message", "Email has existed");
			return ResponseEntity.badRequest().body(jsonResponse);
			// throw new Exception("Email has existed");
		}

		userService.save(user);

		String token = UUID.randomUUID().toString();
		Date dt = new Date();
		Calendar c = Calendar.getInstance();
		c.setTime(dt);
		c.add(Calendar.MINUTE, 15);
		dt = c.getTime();
		verifytokenService
				.saveVerifytoken(new Verifytoken(token, new Date(), dt, userService.findByEmail(user.getEmail())));

		verifytokenService.sendMail(user.getEmail(), token);

		URI uri = URI.create(ServletUriComponentsBuilder.fromCurrentContextPath().path("/api/user").toUriString());
		jsonResponse.put("message", "Register Success");
		jsonResponse.put("confirmToken", token);
		return ResponseEntity.created(uri).body(jsonResponse);
	}

	@PostMapping("/oauth2")
	public ResponseEntity<?> loginWithOauth(@RequestBody @Valid SocialUserDto user, BindingResult bindingResult)
			throws Exception {
		Map<String, String> jsonResponse = new HashMap<>();
		// validation
		if (bindingResult.hasErrors()) {
			List<FieldError> errors = bindingResult.getFieldErrors();
			List<String> errorMessage = new ArrayList<>();
			for (FieldError error : errors) {
				errorMessage.add(error.getDefaultMessage());
				System.out.println(error.getObjectName() + " - " + error.getDefaultMessage());
			}

			jsonResponse.put("message", "Validation failed");
			return ResponseEntity.badRequest().body(jsonResponse);
			// throw new Exception("Validation failed: " + errorMessage);
		}

		// Check exists email
		User theUser = userService.findByEmail(user.getEmail());
		boolean isAuthBeforeWithGoogle = false;
		if (theUser != null) {
			if (theUser.getProvider().equals("GOOGLE")) {
				isAuthBeforeWithGoogle = true;
			} else {
				jsonResponse.put("message", "Email has registerd with local authenicaiton");
				return ResponseEntity.badRequest().body(jsonResponse);
			}

		}

		if (!isAuthBeforeWithGoogle) {
			userService.save(user);
		}

		String email = user.getEmail();
		List<String> roles = Arrays.asList("ROLE_USER");
		String uri = ServletUriComponentsBuilder.fromCurrentContextPath().path("/api/user/oauth2").toString();
		String accessToken = jwtHandler.generateAccessToken(email, uri, roles);
		String refreshToken = jwtHandler.generateAccessToken(email, uri, null);

		jsonResponse.put("message", "Authenication with Oauth2 Success");
		jsonResponse.put("access_token", accessToken);
		jsonResponse.put("refresh_token", refreshToken);
		return ResponseEntity.ok().body(jsonResponse);
	}

	@GetMapping("/confirm")
	public ResponseEntity<?> confirmedToken(@RequestParam String token) throws Exception {
		verifytokenService.confirmedToken(token);
		Map<String, String> jsonResponse = new HashMap<>();
		jsonResponse.put("Message: ", "Confirmed OK");
		return ResponseEntity.ok().body(jsonResponse);
	}

	@GetMapping("/isauth")
	public ResponseEntity<?> isUserAuthenicated() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		String currentPrincipalName = authentication.getName();
		User user = userService.findByEmail(currentPrincipalName);
		Map<String, Object> response = new HashMap<>();
		response.put("userId", user.getUserId());
		response.put("email", user.getEmail());
		response.put("firstName", user.getFirstName());
		response.put("lastName", user.getLastName());
		//Map<String, String> jsonResponse = new HashMap<>();
		response.put("message: ", "User Authenicated");
		return ResponseEntity.ok().body(response);
	}
}
