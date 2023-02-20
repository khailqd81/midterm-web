package com.web.midterm.controller;

import java.net.URI;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.validation.Valid;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.auth0.jwt.interfaces.JWTVerifier;
import com.web.midterm.entity.User;
import com.web.midterm.entity.dto.SocialUserDto;
import com.web.midterm.entity.dto.UpdateUserDto;
import com.web.midterm.entity.dto.UserDto;
import com.web.midterm.entity.dto.UserResponseDto;
import com.web.midterm.service.user.UserService;
import com.web.midterm.service.verifyToken.VerifytokenService;
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

	// Get user profile
	@GetMapping
	public ResponseEntity<User> getUser() {
		User user = userService.getCurrentAuthUser();
		return ResponseEntity.ok().body(user);
	}

	// Update user profile
	@PostMapping
	public ResponseEntity<?> updateUser(@RequestBody @Valid UpdateUserDto updateUser) throws Exception {
		User user = userService.getCurrentAuthUser();
		updateUser.setUserId(user.getUserId());
		userService.update(updateUser);
		UserResponseDto response = new UserResponseDto(user.getEmail(), user.getFirstName(), user.getLastName(),
				"update user success");
		return ResponseEntity.ok().body(response);
	}

	@PostMapping("/register")
	public ResponseEntity<?> registerUser(@RequestBody @Valid UserDto user) throws Exception {
		Map<String, String> jsonResponse = new HashMap<>();

		// Check exists email
		User theUser = userService.findByEmail(user.getEmail());
		if (theUser != null) {
			jsonResponse.put("message", "Email has existed");
			return ResponseEntity.badRequest().body(jsonResponse);
		}
		userService.register(user);
		URI uri = URI.create(ServletUriComponentsBuilder.fromCurrentContextPath().path("/api/user").toUriString());
		jsonResponse.put("message", "Register Success");
		return ResponseEntity.created(uri).body(jsonResponse);
	}

	@PostMapping("/oauth2")
	public ResponseEntity<?> loginWithOauth(@RequestBody @Valid SocialUserDto user)
			throws Exception {
		Map<String, String> jsonResponse = new HashMap<>();

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

	@PostMapping("/renewPassword")
	public ResponseEntity<?> renewPassword(@RequestBody Map<String, String> payload) throws Exception {
		String token = payload.get("token");
		String newPassword = payload.get("newPassword");
		userService.renewPassword(token, newPassword);
		Map<String, Object> response = new HashMap<>();
		response.put("message: ", "Renew password success");
		return ResponseEntity.ok().body(response);
	}

	@PostMapping("/forgotPassword")
	public ResponseEntity<?> forgotPassword(@RequestBody(required = false) Map<String, String> payload)
			throws Exception {
		if (payload == null) {
			throw new Exception("No body provided");
		}
		if (!payload.containsKey("email")) {
			throw new Exception("No email provided");
		}
		String email = payload.get("email");

		userService.sendEmailRenewPassword(email);
		Map<String, Object> response = new HashMap<>();
		response.put("message: ", "Send email renew password success");
		return ResponseEntity.ok().body(response);
	}

	@GetMapping("/isauth")
	public ResponseEntity<?> isUserAuthenicated() {
		User user = userService.getCurrentAuthUser();
		UserResponseDto response = new UserResponseDto();
		BeanUtils.copyProperties(user, response);
		response.setMessage("User Authenicated");
		return ResponseEntity.ok().body(response);
	}

	@GetMapping("/refreshToken")
	public ResponseEntity<?> refreshToken(@RequestHeader(HttpHeaders.AUTHORIZATION) String authorization)
			throws Exception {
		if (authorization == null) {
			throw new Exception("Empty refresh token");
		}

		// Check exists email
		Algorithm algorithm = Algorithm.HMAC256(jwtHandler.getJwtSecret().getBytes());
		JWTVerifier verifier = JWT.require(algorithm).build();
		DecodedJWT decodedJWT = verifier.verify(authorization);
		String email = decodedJWT.getSubject();
		User theUser = userService.findByEmail(email);
		if (theUser == null) {
			throw new Exception("Email not found");
		}

		List<String> roles = Arrays.asList("ROLE_USER");
		String uri = ServletUriComponentsBuilder.fromCurrentContextPath().path("/api/user/refreshToken").toString();
		String accessToken = jwtHandler.generateAccessToken(email, uri, roles);
		Map<String, String> jsonResponse = new HashMap<>();
		jsonResponse.put("message", "Refresh token Success");
		jsonResponse.put("access_token", accessToken);
		return ResponseEntity.ok().body(jsonResponse);
	}

}
