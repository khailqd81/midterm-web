package com.web.midterm.filter;

import java.io.IOException;
import java.io.InputStream;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;
import java.util.stream.Collectors;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.web.midterm.MidtermApplication;

public class CustomAuthenicationFilter extends UsernamePasswordAuthenticationFilter {
	
	public AuthenticationManager authenticationManager;
	
	public CustomAuthenicationFilter() {
		
	}
	
	public CustomAuthenicationFilter(AuthenticationManager authenticationManager) {
		this.authenticationManager = authenticationManager;
	}

	@Override
	public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response)
			throws AuthenticationException {
		String username = request.getParameter("email");
		String password = request.getParameter("password");
//		try {
//			Map<String, String> requestMap = new ObjectMapper().readValue(request.getInputStream(), Map.class);
//			
//		} catch (StreamReadException e) {
//			e.printStackTrace();
//		} catch (DatabindException e) {
//			e.printStackTrace();
//		} catch (IOException e) {
//			e.printStackTrace();
//		}
		UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(username,
				password);
		return authenticationManager.authenticate(authenticationToken);
	}

	@Override
	protected void successfulAuthentication(HttpServletRequest request, HttpServletResponse response, FilterChain chain,
			Authentication authentication) throws IOException, ServletException {
		Properties p = new Properties();
		String jwtSecret = null;
		try {
			InputStream input =  MidtermApplication.class.getResourceAsStream("/application.properties");
		    p.load(input);
		    jwtSecret = p.getProperty("jwt.secret");
		} catch (IOException ex) {
		    ex.printStackTrace();
		}
		
		User user = (User) authentication.getPrincipal();
		Algorithm algorithm = Algorithm.HMAC256(jwtSecret.getBytes());
		String access_token = JWT.create()
				.withSubject(user.getUsername())
				.withExpiresAt(new Date(System.currentTimeMillis() + 3600000*2))
				.withIssuer(request.getRequestURI().toString())
				.withClaim("roles",
						user.getAuthorities().stream().map(GrantedAuthority::getAuthority).collect(Collectors.toList()))
				.sign(algorithm);
		String refresh_token = JWT.create().withSubject(user.getUsername())
				.withExpiresAt(new Date(System.currentTimeMillis() + 10 * 86400000))
				.withIssuer(request.getRequestURI().toString()).sign(algorithm);

		Map<String, String> tokens = new HashMap<>();
		tokens.put("access_token", access_token);
		tokens.put("refresh_token", refresh_token);
		response.setContentType("application/json");
		new ObjectMapper().writeValue(response.getOutputStream(), tokens);
	}

	@Override
	protected void unsuccessfulAuthentication(HttpServletRequest request, HttpServletResponse response,
			AuthenticationException failed) throws IOException, ServletException {
		response.setContentType("application/json");
		//ErrorResponse error = new ErrorResponse(HttpStatus.UNAUTHORIZED.value(), "Invalid username or password", System.currentTimeMillis());
		response.setStatus(HttpStatus.UNAUTHORIZED.value());
		Map<String, String> error = new HashMap<>();
		error.put("message", "Invalid email or password");
		new ObjectMapper().writeValue(response.getOutputStream(),error);
	}
	
	
}
