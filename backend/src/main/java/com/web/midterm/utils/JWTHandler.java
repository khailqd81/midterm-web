package com.web.midterm.utils;

import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;

@Service
public class JWTHandler {
	@Value("${jwt.secret}")
	public String jwtSecret;
	
	public String generateAccessToken(String username, String uri, List<String> roleList) {
		Algorithm algorithm = Algorithm.HMAC256(jwtSecret.getBytes());
		String accessToken = JWT.create().withSubject(username)
				//.withExpiresAt(new Date(System.currentTimeMillis() + 3600000 * 2))
				.withExpiresAt(new Date(System.currentTimeMillis() + 6000))
				.withIssuer(uri)
				.withClaim("roles", roleList)
				.sign(algorithm);
		return accessToken;
	}
	public String generateRefreshToken(String username,String uri) {
		Algorithm algorithm = Algorithm.HMAC256(jwtSecret.getBytes());
		String refreshToken = JWT.create().withSubject(username)
				.withExpiresAt(new Date(System.currentTimeMillis() + 10 * 86400000))
				.withIssuer(uri)
				.sign(algorithm);
		return refreshToken;
	}
	public String getJwtSecret() {
		return jwtSecret;
	}
	
	
}
