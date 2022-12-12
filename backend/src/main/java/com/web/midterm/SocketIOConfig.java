package com.web.midterm;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import javax.annotation.PreDestroy;

import org.springframework.context.annotation.Bean;

import com.corundumstudio.socketio.AckRequest;
import com.corundumstudio.socketio.Configuration;
import com.corundumstudio.socketio.SocketIOClient;
import com.corundumstudio.socketio.SocketIOServer;
import com.corundumstudio.socketio.listener.ConnectListener;
import com.corundumstudio.socketio.listener.DataListener;
import com.corundumstudio.socketio.listener.DisconnectListener;
import com.web.midterm.socketio.SocketMessage;

@org.springframework.context.annotation.Configuration
public class SocketIOConfig {
	
	private SocketIOServer server;
	
	@Bean
	public SocketIOServer socketIOServer() {
		Configuration config = new Configuration();
		config.setHostname("localhost");
		config.setPort(8085);
		config.setOrigin("http://localhost:3000");
		server = new SocketIOServer(config);
		server.start();
		
		server.addConnectListener(new ConnectListener() {
			@Override
			public void onConnect(SocketIOClient client) {
				System.out.println("Client connected: " + client.getSessionId());
	            Map<String, List<String>> params = client.getHandshakeData().getUrlParams();
	            String room = params.get("room").stream().collect(Collectors.joining());
	            String username = params.get("username").stream().collect(Collectors.joining());
	            System.out.println("room" + room);
	            System.out.println("username" + username);
	            client.joinRoom(room);
			}
		});
		
		
		server.addEventListener("send_message", SocketMessage.class, new DataListener<SocketMessage>() {

			@Override
			public void onData(SocketIOClient client, SocketMessage data, AckRequest ackSender) throws Exception {
				System.out.println("onChatReceived");
				System.out.println("Data: " + data);
				client.sendEvent("read_message", "notify");
			}
			
		});
		server.addDisconnectListener(new DisconnectListener() {
			@Override
			public void onDisconnect(SocketIOClient client) {
				System.out.println("Client disconnected: " + client.getSessionId());
			}
		});
		
		return server;
	}
	
	@PreDestroy
	public void stopSocketIOServer() {
		this.server.stop();
	}
//	 @Bean
//	    public SocketIOServer socketIOServer() {
//	        com.corundumstudio.socketio.Configuration config = new com.corundumstudio.socketio.Configuration();
//	        config.setHostname("localhost");
//	        config.setPort(8080);
//	        //config.setContext("/socket.io");
//	        return new SocketIOServer(config);
//	    }
}
