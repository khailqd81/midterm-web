package com.web.midterm.security;

import java.util.Arrays;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
	@Value("${frontend.url}")
	private String frontendUrl;

//	@Autowired
//	private JWTHandler jwtHandler;

	@Autowired
	private CustomAuthorizationFilter customAuthorizationFilter;

	// Global authenticationManager
	// HTTP are match with last defined authenticationmanager.
	@Bean
	public AuthenticationManager authenicationManager(AuthenticationConfiguration configuration) throws Exception {
		return configuration.getAuthenticationManager();
	}
	
	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
//		CustomAuthenicationFilter authenicationFilter = new CustomAuthenicationFilter(
//				authenicationManager(http.getSharedObject(AuthenticationConfiguration.class)),jwtHandler);
//		authenicationFilter.setFilterProcessesUrl("/api/users/login");
		
		http.cors().configurationSource(request -> {
			CorsConfiguration cors = new CorsConfiguration().applyPermitDefaultValues();
			cors.addAllowedMethod(HttpMethod.DELETE);
			cors.addAllowedMethod(HttpMethod.PUT);
			cors.setAllowCredentials(true);
			cors.setAllowedOrigins(Arrays.asList(frontendUrl, "http://localhost:3000"));
			return cors;
		});

		http.sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS);
		http.csrf().disable();

		http.authorizeHttpRequests().antMatchers("/api/login").permitAll().antMatchers("/api/user/register").permitAll()
				.antMatchers("/v2/api-docs", "/swagger-resources/configuration/ui", "/swagger-resources",
						"/swagger-resources/configuration/security", "/swagger-ui.html", "/webjars/**")
				.permitAll().antMatchers("/api/presents/vote/**").permitAll().antMatchers("/api/slides/vote/**")
				.permitAll().antMatchers("/api/user/confirm").permitAll().antMatchers("/api/user/renewPassword")
				.permitAll().antMatchers("/api/user/forgotPassword").permitAll().antMatchers("/api/user/oauth2")
				.permitAll().antMatchers("/api/user/refreshToken").permitAll().antMatchers("/api/groups/**")
				.authenticated().antMatchers("/api/user/**").authenticated();

		//http.addFilter(authenicationFilter);
		http.addFilterBefore(customAuthorizationFilter, UsernamePasswordAuthenticationFilter.class);
		return http.build();
	}

}
