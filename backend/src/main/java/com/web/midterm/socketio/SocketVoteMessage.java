package com.web.midterm.socketio;

import com.web.midterm.entity.Option;

import lombok.Data;

@Data
public class SocketVoteMessage {
    private int slideId;
    private String room;
    private String username;
    private Option option;
}
