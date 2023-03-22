package com.web.midterm.dto;


public class SimpleSuccessResponseDto {
	private String message;
	
	public SimpleSuccessResponseDto(String message) {
		this.setMessage(message);
	}

	public String getMessage() {
		return message;
	}

	public void setMessage(String message) {
		this.message = message;
	}
	
}
