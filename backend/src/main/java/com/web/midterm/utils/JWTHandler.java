package com.web.midterm.utils;

import java.io.Serializable;
import java.util.Date;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.auth0.jwt.interfaces.JWTVerifier;
import com.web.midterm.entity.User;

@Component
public class JWTHandler implements Serializable{
	/**
	 * 
	 */
	private static final long serialVersionUID = -9025984961467588073L;
	
	@Value("${jwt.secret}")
	public String jwtSecret;

	public String generateAccessToken(User user) {
		Algorithm algorithm = Algorithm.HMAC256(jwtSecret.getBytes());
		String accessToken = JWT.create().withSubject(user.getEmail())
				.withExpiresAt(new Date(System.currentTimeMillis() + 3600000 * 2))
				.withIssuedAt(new Date(System.currentTimeMillis())).withClaim("userId", user.getUserId())
				.withClaim("fullname", user.getFirstName()).withClaim("roles", user.getRole()).sign(algorithm);
		return accessToken;
	}
	
	public String generateAccessToken(org.springframework.security.core.userdetails.User user) {
		Algorithm algorithm = Algorithm.HMAC256(jwtSecret.getBytes());
		String accessToken = JWT.create().withSubject(user.getUsername())
				.withExpiresAt(new Date(System.currentTimeMillis() + 3600000 * 2))
				.withIssuedAt(new Date(System.currentTimeMillis()))
				.withClaim("roles", user.getAuthorities().stream().map(GrantedAuthority::getAuthority).collect(Collectors.toList())).sign(algorithm);
		return accessToken;
	}

	public String generateRefreshToken(User user) {
		Algorithm algorithm = Algorithm.HMAC256(jwtSecret.getBytes());
		String refreshToken = JWT.create().withSubject(user.getEmail())
				.withExpiresAt(new Date(System.currentTimeMillis() + 10 * 86400000))
				.withIssuedAt(new Date(System.currentTimeMillis())).sign(algorithm);
		return refreshToken;
	}
	
	public String generateRefreshToken(org.springframework.security.core.userdetails.User user) {
		Algorithm algorithm = Algorithm.HMAC256(jwtSecret.getBytes());
		String refreshToken = JWT.create().withSubject(user.getUsername())
				.withExpiresAt(new Date(System.currentTimeMillis() + 10 * 86400000))
				.withIssuedAt(new Date(System.currentTimeMillis())).sign(algorithm);
		return refreshToken;
	}

	public DecodedJWT verifyAccessToken(String token) throws Exception {
		Algorithm algorithm = Algorithm.HMAC256(this.getJwtSecret().getBytes());
		JWTVerifier verifier = JWT.require(algorithm).build();
		DecodedJWT decodedJWT = null;
		try {
			decodedJWT = verifier.verify(token);
		} catch (Exception e) {
			throw new JWTVerificationException(e.getMessage());
		}
		if (decodedJWT != null && decodedJWT.getExpiresAt().before(new Date())) {
			throw new Exception("Token expired");
		}
		return decodedJWT;
	}
	
	public String verifyRefreshToken(String token) throws Exception {
		Algorithm algorithm = Algorithm.HMAC256(this.getJwtSecret().getBytes());
		JWTVerifier verifier = JWT.require(algorithm).build();
		DecodedJWT decodedJWT = verifier.verify(token);
		if (decodedJWT.getExpiresAt().before(new Date())) {
			throw new Exception("Token expired");
		}
		return decodedJWT.getSubject();
	}

	public String getJwtSecret() {
		return jwtSecret;
	}

}
