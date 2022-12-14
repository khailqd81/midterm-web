package com.web.midterm;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import javax.annotation.PreDestroy;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;

import com.corundumstudio.socketio.AckRequest;
import com.corundumstudio.socketio.Configuration;
import com.corundumstudio.socketio.SocketIOClient;
import com.corundumstudio.socketio.SocketIOServer;
import com.corundumstudio.socketio.listener.ConnectListener;
import com.corundumstudio.socketio.listener.DataListener;
import com.corundumstudio.socketio.listener.DisconnectListener;
import com.web.midterm.socketio.SocketService;
import com.web.midterm.socketio.SocketVoteMessage;

@org.springframework.context.annotation.Configuration
public class SocketIOConfig {
	
	private SocketIOServer server;
//	
//	@Autowired
//	private SocketService socketService;
	
	@Value("${frontend.url}")
	private String frontendUrl;
	@Value("${backend.url}")
	private String backendUrl;
	
	@Bean
	public SocketIOServer socketIOServer() {
		Configuration config = new Configuration();
		System.out.println("backend: "+ backendUrl);
		System.out.println("frontend: "+ frontendUrl);
		//config.setHostname("/");
		config.setPort(80);
		config.setOrigin(frontendUrl);
		config.setRandomSession(true);
		server = new SocketIOServer(config);
		server.start();
		
		server.addConnectListener(new ConnectListener() {
			@Override
			public void onConnect(SocketIOClient client) {
				System.out.println("Client connected: " + client.getSessionId());
	            Map<String, List<String>> params = client.getHandshakeData().getUrlParams();
	            String room = params.get("room").stream().collect(Collectors.joining());
	            String username = params.get("username").stream().collect(Collectors.joining());
	            System.out.println("room: " + room);
	            System.out.println("username: " + username);
	            
	            SocketIOClient oldClient = client.getNamespace().getClient(client.getSessionId());
	            if (oldClient != null) {
	            	System.out.println("Connected before");
	            }
	            client.joinRoom(room);
			}
		});
		
//		server.addEventListener("send_vote", SocketVoteMessage.class, new DataListener<SocketVoteMessage>() {
//			@Override
//			public void onData(SocketIOClient client, SocketVoteMessage data, AckRequest ackSender) throws Exception {
//				System.out.println("onVoteReceived");
//				System.out.println("Data: " + data);
//				socketService.sendSocketMessage(client, data, data.getRoom());
//			}
//		});
		
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
