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
import java.util.stream.Collectors;

import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.web.midterm.entity.SocialUserDto;
import com.web.midterm.entity.User;
import com.web.midterm.entity.UserDto;
import com.web.midterm.entity.Verifytoken;
import com.web.midterm.service.UserService;
import com.web.midterm.service.VerifytokenService;

@RestController
@RequestMapping("/api/user")
public class UserController {
	@Autowired
	private UserService userService;
	@Autowired
	private VerifytokenService verifytokenService;
	@Autowired
	private Environment env;
	
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
		if (theUser != null) {
			jsonResponse.put("message", "Email has existed");
			return ResponseEntity.badRequest().body(jsonResponse);
			// throw new Exception("Email has existed");
		}

		userService.save(user);
		Algorithm algorithm = Algorithm.HMAC256(env.getProperty("jwt.secret").getBytes());
		String access_token = JWT.create()
				.withSubject(user.getEmail())
				.withExpiresAt(new Date(System.currentTimeMillis() + 3600000*2))
				//.withIssuer(request.getRequestURI().toString())
				.withClaim("roles", Arrays.asList("ROLE_USER"))
				.sign(algorithm);
		String refresh_token = JWT.create().withSubject(user.getEmail())
				.withExpiresAt(new Date(System.currentTimeMillis() + 10 * 86400000))
				//.withIssuer(request.getRequestURI().toString())
				.sign(algorithm);
		jsonResponse.put("message", "Authenication with Oauth2 Success");
		jsonResponse.put("access_token", access_token);
		jsonResponse.put("refresh_token", refresh_token);
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
		Map<String, String> jsonResponse = new HashMap<>();
		jsonResponse.put("Message: ", "User Authenicated");
		return ResponseEntity.ok().body(jsonResponse);
	}
}
