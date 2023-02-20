package com.web.midterm.service.verifyToken;

import com.web.midterm.entity.User;
import com.web.midterm.entity.Verifytoken;

public interface VerifytokenService {
	public void saveVerifytoken(Verifytoken token);
	public void confirmedToken(String token) throws Exception;
	public void sendMail(String toAddress);
	public Verifytoken findByToken(String token);
	public Verifytoken generate(User user);
}
