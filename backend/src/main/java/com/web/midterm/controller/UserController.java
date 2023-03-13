package com.web.midterm.controller;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;

import javax.validation.Valid;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.web.midterm.dto.user_dto.SocialUserDto;
import com.web.midterm.dto.user_dto.UpdateUserDto;
import com.web.midterm.dto.user_dto.UserLoginRequestDto;
import com.web.midterm.dto.user_dto.UserLoginResponseDto;
import com.web.midterm.dto.user_dto.UserRegisterRequestDto;
import com.web.midterm.dto.user_dto.UserResponseDto;
import com.web.midterm.entity.User;
import com.web.midterm.service.user.UserService;
import com.web.midterm.service.verifyToken.VerifytokenService;
import com.web.midterm.utils.JWTHandler;

@RestController
@RequestMapping("/api/users")
public class UserController {
	@Autowired
	private UserService userService;
	@Autowired
	private VerifytokenService verifytokenService;
	@Autowired
	private JWTHandler jwtHandler;
	@Autowired
	private AuthenticationManager authenticationManager;

	@PostMapping("/login")
	public ResponseEntity<?> login(@RequestBody @Valid UserLoginRequestDto dto) throws Exception {
		try {
			authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(dto.getEmail(), dto.getPassword()));
		} catch (BadCredentialsException e) {
			throw new Exception("INVALID_CREDENTIALS", e);
		}
		User user = userService.findByEmail(dto.getEmail());
		String accessToken = jwtHandler.generateAccessToken(user);
		String refreshToken = jwtHandler.generateRefreshToken(user);
		return ResponseEntity.ok().body(new UserLoginResponseDto(accessToken, refreshToken, "Login success"));
	}

	@GetMapping
	@ResponseStatus(HttpStatus.OK)
	public ResponseEntity<User> getUserInfoByUserId() {
		User user = userService.getCurrentAuthUser();
		return ResponseEntity.ok().body(user);
	}

	@PostMapping
	@ResponseStatus(HttpStatus.OK)
	public ResponseEntity<?> updateUserProfile(@RequestBody @Valid UpdateUserDto updateUser) throws Exception {
		User user = userService.getCurrentAuthUser();
		updateUser.setUserId(user.getUserId());
		userService.update(updateUser);
		UserResponseDto response = new UserResponseDto(user.getEmail(), user.getFirstName(), user.getLastName(),
				"update user success");
		response.setUserId(user.getUserId());
		return ResponseEntity.ok().body(response);
	}

	@PostMapping("/register")
	@ResponseStatus(HttpStatus.CREATED)
	public ResponseEntity<?> registerUser(@RequestBody @Valid UserRegisterRequestDto user) throws Exception {
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
	@ResponseStatus(HttpStatus.OK)
	public ResponseEntity<?> loginWithOauth(@RequestBody @Valid SocialUserDto user) throws Exception {
		// Check exists email
		User theUser = userService.findByEmail(user.getEmail());
		boolean isAuthBeforeWithGoogle = false;
		if (theUser != null) {
			// Check register with local before
			if (theUser.getProvider().equals("GOOGLE")) {
				isAuthBeforeWithGoogle = true;
			} else {
				throw new Exception("Email has registerd with local authenicaiton");
			}
		}

		if (!isAuthBeforeWithGoogle) {
			userService.save(user);
		}

		UserLoginResponseDto response = userService.loginWithOauth2(user);
		return ResponseEntity.ok().body(response);
	}

	@GetMapping("/confirm")
	@ResponseStatus(HttpStatus.OK)
	public ResponseEntity<?> confirmedToken(@RequestParam String token) throws Exception {
		verifytokenService.confirmedToken(token);
		return ResponseEntity.ok("Confirmed OK");
	}

	@PostMapping("/renewPassword")
	@ResponseStatus(HttpStatus.OK)
	public ResponseEntity<?> renewPassword(@RequestBody Map<String, String> payload) throws Exception {
		String token = payload.get("token");
		String newPassword = payload.get("newPassword");
		userService.renewPassword(token, newPassword);
		return ResponseEntity.ok("Renew password success");
	}

	@PostMapping("/forgotPassword")
	@ResponseStatus(HttpStatus.OK)
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
	@ResponseStatus(HttpStatus.OK)
	public ResponseEntity<?> isUserAuthenicated() {
		User user = userService.getCurrentAuthUser();
		UserResponseDto response = new UserResponseDto();
		BeanUtils.copyProperties(user, response);
		response.setMessage("User Authenicated");
		return ResponseEntity.ok().body(response);
	}

	@GetMapping("/refreshToken")
	@ResponseStatus(HttpStatus.OK)
	public ResponseEntity<?> refreshToken(@RequestHeader(HttpHeaders.AUTHORIZATION) String authorization)
			throws Exception {
		if (authorization == null) {
			throw new Exception("Empty refresh token");
		}

		// Check exists email
		String email = jwtHandler.verifyRefreshToken(authorization);
		User theUser = userService.findByEmail(email);
		if (theUser == null) {
			throw new Exception("Email not found");
		}
		
		String accessToken = jwtHandler.generateAccessToken(theUser);
		UserLoginResponseDto response = new UserLoginResponseDto(accessToken, null, "Refresh token Success");
		return ResponseEntity.ok().body(response);
	}

}
