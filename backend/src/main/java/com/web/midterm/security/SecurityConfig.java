package com.web.midterm.security;

import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;

import com.web.midterm.filter.CustomAuthenicationFilter;
import com.web.midterm.filter.CustomAuthorizationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
	@Value("${frontend.url}")
	private String frontendUrl;
	@Autowired
	private CustomAuthenticationProvider authProvider;

	@Bean
	public AuthenticationManager authManager(HttpSecurity http) throws Exception {
		AuthenticationManagerBuilder authenticationManagerBuilder = http
				.getSharedObject(AuthenticationManagerBuilder.class);
		authenticationManagerBuilder.authenticationProvider(authProvider);
		return authenticationManagerBuilder.build();
	}

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		CustomAuthenicationFilter authenicationFilter = new CustomAuthenicationFilter(
				authenticationManager(http.getSharedObject(AuthenticationConfiguration.class)));
		authenicationFilter.setFilterProcessesUrl("/api/login");

		http.cors().configurationSource(request -> {
			CorsConfiguration cors = new CorsConfiguration().applyPermitDefaultValues();
			cors.addAllowedMethod(HttpMethod.DELETE);
			cors.addAllowedMethod(HttpMethod.PUT);
			//cors.addAllowedOrigin("*");
//			cors.addAllowedOrigin(frontendUrl);
//			cors.addAllowedOrigin("http://localhost:3000");
			cors.setAllowCredentials(true);
			cors.setAllowedOrigins(Arrays.asList(frontendUrl,"http://localhost:3000"));
			//cors.setAllowedOrigins(List.of(frontendUrl, "http://localhost:3000"));
			return cors;
		});

		http.sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS);
		http.csrf().disable();

		http.authorizeHttpRequests().antMatchers("/api/login").permitAll().antMatchers("/api/user/register").permitAll()
				.antMatchers("/api/presents/vote/**").permitAll()
				.antMatchers("/api/slides/vote/**").permitAll()
				.antMatchers("/api/user/confirm").permitAll()
				.antMatchers("/api/user/renewPassword").permitAll()
				.antMatchers("/api/user/forgotPassword").permitAll()
				.antMatchers("/api/user/oauth2").permitAll()
				.antMatchers("/api/user/refreshToken").permitAll().antMatchers("/api/groups/**").authenticated()
				.antMatchers("/api/user/**").authenticated();
		// http.authorizeHttpRequests().anyRequest().authenticated();

		http.addFilter(authenicationFilter);
		http.addFilterBefore(new CustomAuthorizationFilter(), UsernamePasswordAuthenticationFilter.class);
		return http.build();
	}
	
	@Bean
	AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration)
			throws Exception {
		return authenticationConfiguration.getAuthenticationManager();
	}

}
