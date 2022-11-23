package com.web.midterm.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
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
    @Autowired
    private CustomAuthenticationProvider authProvider;

    @Bean
    public AuthenticationManager authManager(HttpSecurity http) throws Exception {
        AuthenticationManagerBuilder authenticationManagerBuilder = 
            http.getSharedObject(AuthenticationManagerBuilder.class);
        authenticationManagerBuilder.authenticationProvider(authProvider);
        return authenticationManagerBuilder.build();
    }
    
	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		CustomAuthenicationFilter authenicationFilter = 
				new CustomAuthenicationFilter(
						authenticationManager(http.getSharedObject(AuthenticationConfiguration.class)));
		authenicationFilter.setFilterProcessesUrl("/api/login");
		
		http.cors().configurationSource(request -> new CorsConfiguration().applyPermitDefaultValues());
		
		http.sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS);
		http.csrf().disable();
		
		http.authorizeHttpRequests()
			.antMatchers("/api/login").permitAll()
			.antMatchers("/api/user/register").permitAll()
			.antMatchers("/api/user/confirm").permitAll()
			.antMatchers("/api/user/oauth2").permitAll()
			.antMatchers("/api/groups/**").authenticated()
			.antMatchers("/api/user/**").authenticated();
		//http.authorizeHttpRequests().anyRequest().authenticated();
		
		http.addFilter(authenicationFilter);
		http.addFilterBefore(
				new CustomAuthorizationFilter(), UsernamePasswordAuthenticationFilter.class);
		return http.build();
	}

	
//	@Bean
//	public AuthenticationManager authManager(HttpSecurity http) 
//	  throws Exception {
//	    return http.getSharedObject(AuthenticationManagerBuilder.class)
//	      .userDetailsService(userDetailsService)
//	      .passwordEncoder(bCryptPasswordEncoder)
//	      .and()
//	      .build();
//	}
	
	@Bean
    AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception { 
        return authenticationConfiguration.getAuthenticationManager();
    }

}
