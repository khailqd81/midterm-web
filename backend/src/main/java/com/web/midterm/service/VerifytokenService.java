package com.web.midterm.service;

import com.web.midterm.entity.Verifytoken;

public interface VerifytokenService {
	public void saveVerifytoken(Verifytoken token);
	public void confirmedToken(String token) throws Exception;
	public void sendMail(String toAddress, String token);
}
