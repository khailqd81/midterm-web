package com.web.midterm.socketio;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.corundumstudio.socketio.SocketIOServer;
import com.corundumstudio.socketio.listener.ConnectListener;
import com.corundumstudio.socketio.listener.DataListener;
import com.corundumstudio.socketio.listener.DisconnectListener;

public class SocketModule {
	private final SocketIOServer server;
    private final SocketService socketService;

    public SocketModule(SocketIOServer server, SocketService socketService) {
        this.server = server;
        this.socketService = socketService;
        server.addConnectListener(onConnected());
        server.addDisconnectListener(onDisconnected());
        server.addEventListener("send_message", SocketMessage.class, onChatReceived());

    }
    
    private DataListener<SocketMessage> onChatReceived() {
        return (senderClient, data, ackSender) -> {
        	System.out.println("onChatReceived");
            //socketService.saveMessage(senderClient, data);
        };
    }

    private ConnectListener onConnected() {
        return (client) -> {
//            String room = client.getHandshakeData().getSingleUrlParam("room");
//            String username = client.getHandshakeData().getSingleUrlParam("room");
        	System.out.println("onConnected");
            Map<String, List<String>> params = client.getHandshakeData().getUrlParams();
            String room = params.get("room").stream().collect(Collectors.joining());
            String username = params.get("username").stream().collect(Collectors.joining());
            client.joinRoom(room);
            //socketService.saveInfoMessage(client, String.format(Constants.WELCOME_MESSAGE, username), room);
        };

    }

    private DisconnectListener onDisconnected() {
        return client -> {
        	System.out.println("onDisconnected");
        	Map<String, List<String>> params = client.getHandshakeData().getUrlParams();
            String room = params.get("room").stream().collect(Collectors.joining());
            String username = params.get("username").stream().collect(Collectors.joining());
            //socketService.saveInfoMessage(client, String.format(Constants.DISCONNECT_MESSAGE, username), room);
        };
    }


}
