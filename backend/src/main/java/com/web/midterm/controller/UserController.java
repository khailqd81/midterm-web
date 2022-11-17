package com.web.midterm.controller;

import java.net.URI;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

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
	
	@PostMapping("/register")
	public ResponseEntity<?> registerUser(@RequestBody @Valid UserDto user, BindingResult bindingResult) throws Exception {
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
			//throw new Exception("Validation failed: " + errorMessage);
		}

		// Check exists email
		User theUser = userService.findByEmail(user.getEmail());
		if (theUser != null) {
			jsonResponse.put("message", "Email has existed");
			return ResponseEntity.badRequest().body(jsonResponse);
			//throw new Exception("Email has existed");
		}

		userService.save(user);
		
		String token = UUID.randomUUID().toString();
		Date dt = new Date();
		Calendar c = Calendar.getInstance(); 
		c.setTime(dt); 
		c.add(Calendar.MINUTE, 15);
		dt = c.getTime();
		verifytokenService.saveVerifytoken(new Verifytoken(
				token, new Date(), dt, userService.findByEmail(user.getEmail())));
		
		verifytokenService.sendMail(user.getEmail(), token);
		
		URI uri = URI.create(ServletUriComponentsBuilder.fromCurrentContextPath().path("/api/user").toUriString());
		jsonResponse.put("message", "Register Success");
		jsonResponse.put("confirmToken", token);
		return ResponseEntity.created(uri).body(jsonResponse);
	}
	
	@GetMapping("/confirm")
	public ResponseEntity<?> confirmedToken(@RequestParam String token) throws Exception {
		verifytokenService.confirmedToken(token);
		Map<String, String> jsonResponse = new HashMap<>();
		jsonResponse.put("Message: ", "Confirmed OK");
		return ResponseEntity.ok().body(jsonResponse);
	}
}
