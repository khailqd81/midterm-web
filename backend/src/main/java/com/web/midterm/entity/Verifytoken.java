package com.web.midterm.entity;

import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

@Entity
@Table(name="verifytoken", schema="public")
public class Verifytoken {
	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	@Column(name="token_id")
	private int tokenId;
	
	@Column(name="token")
	private String token;
	@Column(name="created_at")
	private Date createdAt;
	@Column(name="expired_at")
	private Date expiredAt;
	@Column(name="confirmed_at")
	private Date confirmedAt;
	@ManyToOne
	@JoinColumn(name="user_id")
	private User user;
	
	public Verifytoken() {
		
	}
	
	public Verifytoken(String token, Date createdAt, Date expiredAt, User user) {
		this.token = token;
		this.createdAt = createdAt;
		this.expiredAt = expiredAt;
		this.user = user;
	}
	public int getTokenId() {
		return tokenId;
	}
	public void setTokenId(int tokenId) {
		this.tokenId = tokenId;
	}
	public Date getCreatedAt() {
		return createdAt;
	}
	public void setCreatedAt(Date createdAt) {
		this.createdAt = createdAt;
	}
	public Date getExpiredAt() {
		return expiredAt;
	}
	public void setExpiredAt(Date expiredAt) {
		this.expiredAt = expiredAt;
	}
	public Date getConfirmedAt() {
		return confirmedAt;
	}
	public void setConfirmedAt(Date confirmedAt) {
		this.confirmedAt = confirmedAt;
	}
	public User getUser() {
		return user;
	}
	public void setUser(User user) {
		this.user = user;
	}
	
	
}
