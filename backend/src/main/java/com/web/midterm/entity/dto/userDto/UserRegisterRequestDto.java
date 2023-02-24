package com.web.midterm.entity.dto.userDto;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

public class UserRegisterRequestDto {

	@NotNull(message = "Email is required")
	@Email(message="Wrong email format")
	protected String email;

	@NotNull(message = "Password is required")
	@Size(min = 5, message = "password length greater than 5")
	private String password;

	@NotNull(message = "ConfirmPassword is required")
	@Size(min = 5, message = "password length greater than 5")
	private String confirmPassword;

	protected String firstName;

	protected String lastName;
	
	@NotNull(message = "Gender is required")
	private String gender;
	
	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public String getConfirmPassword() {
		return confirmPassword;
	}

	public void setConfirmPassword(String confirmPassword) {
		this.confirmPassword = confirmPassword;
	}

	public String getFirstName() {
		return firstName;
	}

	public void setFirstName(String firstName) {
		this.firstName = firstName;
	}

	public String getLastName() {
		return lastName;
	}

	public void setLastName(String lastName) {
		this.lastName = lastName;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}
	
	public String getGender() {
		return gender;
	}

	public void setGender(String gender) {
		this.gender = gender;
	}

	@Override
	public String toString() {
		return "UserDto [email=" + email + ", password=" + password + ", confirmPassword=" + confirmPassword
				+ ", firstName=" + firstName + ", lastName=" + lastName + "]";
	}
	
}

