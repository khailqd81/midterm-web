package com.web.midterm.entity;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;

import lombok.Data;

@Data
public class UpdateUser {
	@NotNull(message = "FirstName is required")
	private String firstName;
	@NotNull(message = "Lastname is required")
	private String lastName;
	@Pattern(regexp = "^[0-9]{10}$", message = "Phone contains 10 digits")
	private String phone;
	@Size(max = 100, message = "Maximum address length is 100")
	private String address;
	@Size(max = 1, message = "Maximum gender length is 1")
	private String gender;
	@Pattern(regexp = "^\\d{4}\\-(0[1-9]|1[012])\\-(0[1-9]|[12][0-9]|3[01])$", message = "Wrong date format")
	private String birthday;
}