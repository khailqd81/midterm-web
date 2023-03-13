package com.web.midterm;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

import javax.mail.MessagingException;
import javax.mail.Session;
import javax.mail.internet.AddressException;
import javax.mail.internet.MimeMessage;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InOrder;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.env.Environment;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.web.midterm.dto.user_dto.SocialUserDto;
import com.web.midterm.dto.user_dto.UpdateUserDto;
import com.web.midterm.dto.user_dto.UserRegisterRequestDto;
import com.web.midterm.entity.User;
import com.web.midterm.repo.UserRepository;
import com.web.midterm.service.user.UserServiceImpl;
import com.web.midterm.service.verifyToken.VerifytokenService;
import com.web.midterm.utils.JWTHandler;

@ExtendWith(MockitoExtension.class)
public class UserServiceTests {
	@Mock
	private UserRepository userRepository;
	@Mock
	private PasswordEncoder passwordEncoder;
	@Mock
	private JavaMailSender mailSender;
	@Mock
	private VerifytokenService verifytokenService;
	@Mock
	private Environment env;
	@Mock
	private JWTHandler jwtHandler;
	
	@InjectMocks
	private UserServiceImpl userService = new UserServiceImpl();

//	@BeforeEach
//	void setUp() {
//		userService = new UserServiceImpl(userRepository);
//	}

	@Test
	void canFindByEmail() {
		String email = "hello@gmail.com";
		userService.findByEmail(email);
		ArgumentCaptor<String> stringCaptor = ArgumentCaptor.forClass(String.class);
		verify(userRepository).findByEmail(stringCaptor.capture());
		String capturedEmail = stringCaptor.getValue();
		assertThat(capturedEmail).isEqualTo(email);
	}

	@Test
	void canSaveRegisterUser() {
		UserRegisterRequestDto user = new UserRegisterRequestDto();
		user.setPassword("hello123");
		userService.save(user);
		verify(userRepository).save(any());
	}
	
	@Test
	void canSaveSocialUser() {
		SocialUserDto user = new SocialUserDto();
		userService.save(user);
		verify(userRepository).save(any());
	}
	
	@Test
	void canFindByUserId() {
		userService.findByUserId(100);
		verify(userRepository).findByUserId(anyInt());
	}
	
	@Test
	void canSaveUser() {
		userService.save(new User());
		verify(userRepository).save(any());
	}
	
	@Test
	void canUpdateUser() {
		int userId = 100;
		UpdateUserDto user = new UpdateUserDto();
		user.setUserId(userId);
		ArgumentCaptor<Integer> captor = ArgumentCaptor.forClass(Integer.class);
		given(userRepository.findByUserId(captor.capture())).willReturn(new User());
		userService.update(user);
		assertThat(captor.getValue()).isEqualTo(userId);
		verify(userRepository).save(any());
	}
	
	@Test
	void canThrowSendEmailRenewPassword() {
		String email = "hello@gmail.com";
		given(userRepository.findByEmail(any())).willReturn(null);
		assertThatThrownBy(() -> userService.sendEmailRenewPassword(email))
		.isInstanceOf(Exception.class)
		.hasMessageContaining("There is no user with this email: " + email);
	}
	
	@Test
	void canSendEmailRenewPassword() throws AddressException, MessagingException, Exception {
		String email = "hello@gmail.com";
		given(userRepository.findByEmail(any())).willReturn(new User());
		given(mailSender.createMimeMessage()).willReturn(new MimeMessage((Session)null));
		given(env.getProperty("frontend.url")).willReturn("frontend.url");
		userService.sendEmailRenewPassword(email);
		verify(mailSender).createMimeMessage();
		verify(verifytokenService).saveVerifytoken(any());
		verify(mailSender).send(any(MimeMessage.class));
	}
	
	@Test
	void canRegisterUser() {
		UserRegisterRequestDto registerUser = new UserRegisterRequestDto();
		userService.register(registerUser);
		//verify(userService).save(registerUser);
		verify(userRepository).findByEmail(any());
		verify(verifytokenService).saveVerifytoken(any());
		verify(verifytokenService).sendMail(any());
	}
	
	@Test
	void canLoginWithOauth2() {
		String email = "hello@gmail.com";
		String firstName = "Khai";
		String lastName = "Pham";
		SocialUserDto socialUser = new SocialUserDto();
		socialUser.setEmail(email);
		socialUser.setFirstName(firstName);
		socialUser.setLastName(lastName);
		userService.loginWithOauth2(socialUser);
		verify(jwtHandler).generateAccessToken(any(User.class));
		verify(jwtHandler).generateRefreshToken(any(User.class));
	}
}
