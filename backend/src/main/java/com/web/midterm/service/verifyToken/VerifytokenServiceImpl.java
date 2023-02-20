package com.web.midterm.service.verifyToken;

import java.util.Calendar;
import java.util.Date;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.web.midterm.entity.User;
import com.web.midterm.entity.Verifytoken;
import com.web.midterm.repo.VerifytokenRepository;

@Service
public class VerifytokenServiceImpl implements VerifytokenService {
	@Autowired
	private VerifytokenRepository verifytokenRepository;

	@Autowired
	private JavaMailSender mailSender;

	@Autowired
	private Environment env;
	
	@Override
	public void saveVerifytoken(Verifytoken token) {
		verifytokenRepository.save(token);
	}

	@Override
	public void confirmedToken(String token) throws Exception {
		Optional<Verifytoken> verifyToken = verifytokenRepository.findByToken(token);
		if (verifyToken.isPresent()) {
			Verifytoken theToken = verifyToken.get();
			if (theToken.getConfirmedAt() != null) {
				throw new Exception("Email already confirmed.");
			}
			if (theToken.getExpiredAt().before(new Date())) {
				throw new Exception("Token expired.");
			}
			theToken.setConfirmedAt(new Date());
			theToken.getUser().setEnabled(true);
			verifytokenRepository.save(theToken);
		} else {
			throw new Exception("Invalid token.");
		}
	}

	@Override
	public void sendMail(String toAddress) {
		String confirmationUrl = env.getProperty("frontend.url") +"/user/confirm?token=" + UUID.randomUUID().toString();
		SimpleMailMessage email = new SimpleMailMessage();
		email.setTo(toAddress);
		email.setSubject("Registration Confirmation");
		email.setText("Confirmation link to app: " + "\r\n" + confirmationUrl + "\nThis will expire in 15 minutes");
		mailSender.send(email);
	}

	@Override
	public Verifytoken findByToken(String token) {
		Optional<Verifytoken> verifytoken =verifytokenRepository.findByToken(token);
		if (verifytoken.isPresent()) {
			return verifytoken.get();
		}
		return null;
	}

	@Override
	public Verifytoken generate(User user) {
		String token = UUID.randomUUID().toString();
		Date dt = new Date();
		Calendar c = Calendar.getInstance();
		c.setTime(dt);
		c.add(Calendar.MINUTE, 15);
		dt = c.getTime();
		return new Verifytoken(token, new Date(), dt, user);
	}

}
