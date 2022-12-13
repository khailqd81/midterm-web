package com.web.midterm.socketio;

import com.web.midterm.entity.Slide;

import lombok.Data;

@Data
public class SocketUpdateMessage {
	private String room;
	private String username;
	private Slide slide;
}
