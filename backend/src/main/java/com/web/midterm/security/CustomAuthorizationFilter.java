package com.web.midterm.security;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.auth0.jwt.interfaces.DecodedJWT;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.web.midterm.utils.JWTHandler;

@Component
public class CustomAuthorizationFilter extends OncePerRequestFilter {

	@Autowired
	private JWTHandler jwtHandler;

	private List<String> excludeUrlPatterns = new ArrayList<String>(Arrays.asList("swagger-ui", "swagger-resources",
			"v2/api-docs", "webjars", "configuration/security", "configuration", "/favicon.ico", "/api/users/login",
			"/api/users/register", "/api/users/oauth2", "/api/users/confirm", "/api/users/renewPassword",
			"/api/users/forgotPassword", "/api/users/refreshToken", "/api/presents/vote", "/api/slides/vote",
			"/api/chats/public", "/api/questions/public"));

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {
		String authorizationHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
		if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
			try {
				String token = authorizationHeader.substring("Bearer ".length());
				DecodedJWT decodedJWT = jwtHandler.verifyAccessToken(token);
				String username = decodedJWT.getSubject();
				String[] roles = decodedJWT.getClaim("roles").asArray(String.class);
				Collection<SimpleGrantedAuthority> authorities = new ArrayList<>();
				Arrays.stream(roles).forEach(role -> {
					authorities.add(new SimpleGrantedAuthority(role));
				});
				UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
						username, null, authorities);
				SecurityContextHolder.getContext().setAuthentication(authenticationToken);
				filterChain.doFilter(request, response);
			} catch (Exception e) {
				response.setHeader("error", e.getMessage());
				response.setStatus(HttpStatus.FORBIDDEN.value());
				Map<String, String> error = new HashMap<>();
				error.put("error_message", e.getMessage());
				response.setContentType("application/json");
				new ObjectMapper().writeValue(response.getOutputStream(), error);
			}
		} else {
			response.sendError(HttpStatus.BAD_REQUEST.value(), "Access token is missing or invalid");
		}
	}

	@Override
	protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
		String path = request.getRequestURI();
		for (String p : excludeUrlPatterns) {
			if (path.contains(p)) {
				return true;
			}
		}
//		excludeUrlPatterns.stream()
//        .anyMatch(p -> pathMatcher.match(p, request.getServletPath()));
		return false;
	}
}
