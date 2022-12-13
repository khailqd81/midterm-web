package com.web.midterm.socketio;

import java.util.Collection;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.corundumstudio.socketio.AckRequest;
import com.corundumstudio.socketio.SocketIOClient;
import com.corundumstudio.socketio.SocketIOServer;
import com.corundumstudio.socketio.listener.DataListener;
import com.web.midterm.entity.Option;
import com.web.midterm.entity.Slide;
import com.web.midterm.repo.OptionRepository;
import com.web.midterm.repo.SlideRepository;
import com.web.midterm.service.SlideService;

import lombok.RequiredArgsConstructor;

@Service
public class SocketService {
	// private final MessageService messageService;
	
	@Autowired
	private SlideRepository slideRepository;
	@Autowired
	private OptionRepository optionRepository;
	
	private SocketIOServer socketIOServer;
	
	
	@Autowired
	public SocketService(SocketIOServer socketIOServer) {
		this.socketIOServer = socketIOServer;
		this.socketIOServer.addEventListener("send_vote", SocketVoteMessage.class, new DataListener<SocketVoteMessage>() {
			@Override
			public void onData(SocketIOClient client, SocketVoteMessage data, AckRequest ackSender) throws Exception {
				System.out.println("onVoteReceived");
				System.out.println("Data: " + data);
				sendSocketMessage(client, data, data.getRoom());
			}
		});
	}


	public void sendSocketMessage(SocketIOClient senderClient, SocketVoteMessage message, String room) throws Exception {
		Slide s = slideRepository.findBySlideIdOrderBySlideIdAsc(message.getSlideId());
		Option opt = message.getOption();
		if (s == null) {
			senderClient.sendEvent("read_message", message);
			throw new Exception("Slide Id not found");
		} else {
			s.getOptionList();
		}
		System.out.println("Option: " + opt);
		Option optDb = optionRepository.findById(opt.getOptionId());
		if (optDb == null ) {
			senderClient.sendEvent("read_message", message);
			throw new Exception("Option Id not found");
		}
		optDb.setVote(optDb.getVote() + 1);
		optionRepository.save(optDb);
		message.setOption(optDb);
		for (SocketIOClient client : senderClient.getNamespace().getRoomOperations(room).getClients()) {
//			if (!client.getSessionId().equals(senderClient.getSessionId())) {
//				client.sendEvent("read_message", message);
//			}
			client.sendEvent("read_message", message);
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
