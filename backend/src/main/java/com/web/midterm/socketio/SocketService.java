package com.web.midterm.socketio;

import org.springframework.stereotype.Service;

import com.corundumstudio.socketio.SocketIOClient;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SocketService {
	// private final MessageService messageService;

	public void sendSocketMessage(SocketIOClient senderClient, SocketMessage message, String room) {
		for (SocketIOClient client : senderClient.getNamespace().getRoomOperations(room).getClients()) {
			if (!client.getSessionId().equals(senderClient.getSessionId())) {
				client.sendEvent("read_message", message);
			}
		}
	}

//	    public void saveMessage(SocketIOClient senderClient, SocketMessage message) {
//	        SocketMessage storedMessage = messageService.saveMessage(SocketMessage.builder()
//	                .messageType(MessageType.CLIENT)
//	                .content(message.getContent())
//	                .room(message.getRoom())
//	                .username(message.getUsername())
//	                .build());
//	        sendSocketMessage(senderClient, storedMessage, message.getRoom());
//	    }
//
//	    public void saveInfoMessage(SocketIOClient senderClient, String message, String room) {
//	        SocketMessage storedMessage = messageService.saveMessage(SocketMessage.builder()
//	                .messageType(MessageType.SERVER)
//	                .content(message)
//	                .room(room)
//	                .build());
//	        sendSocketMessage(senderClient, storedMessage, room);
//	    }
}
