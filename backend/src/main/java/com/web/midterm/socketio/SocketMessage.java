package com.web.midterm.socketio;

import lombok.Data;

@Data
public class SocketMessage {
    private String content;
    private String room;
    private String username;
}
