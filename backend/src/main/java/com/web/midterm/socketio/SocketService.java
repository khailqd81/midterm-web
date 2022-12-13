package com.web.midterm.socketio;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
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
		
		this.socketIOServer.addEventListener("send_update", SocketUpdateMessage.class, new DataListener<SocketUpdateMessage>() {
			@Override
			public void onData(SocketIOClient client, SocketUpdateMessage data, AckRequest ackSender) throws Exception {
				System.out.println("onUpdateReceived");
				System.out.println("Data: " + data);
				sendUpdateSlideSocketMessage(client, data, data.getRoom());
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
	
	// User send update slide
	public void sendUpdateSlideSocketMessage(SocketIOClient senderClient, SocketUpdateMessage data, String room) throws Exception {
		Slide slideFromReq = data.getSlide();
		if (slideFromReq  == null) {
			throw new Exception("Slide not found");
		}
		//List<Option> optListFromReq = data.getSlide().getOptionList();
		Slide s = slideRepository.findBySlideIdOrderBySlideIdAsc(data.getSlide().getSlideId());
		if (s == null) {
			throw new Exception("Slide Id not found");
		}		
		List<Option> optionList = slideFromReq.getOptionList();
		// If slide has optionList
		if (optionList != null && optionList.size() > 0) {
			List<Option> newOptionList = new ArrayList<>();
			for (Option opt : optionList) {
				// if option is new
				if (opt.getOptionId() == 0) {
					newOptionList.add(opt);
				} else {
					// if update existed option
					Option theOpt = optionRepository.findById(opt.getOptionId());
					if (theOpt == null) {
						throw new Exception("Option Id not found");
					}
					if (theOpt.getSlide().getSlideId() != s.getSlideId()) {
						throw new Exception("Option Slide Id and Slide Id mis match");
					}
					theOpt.setOptionName(opt.getOptionName());
					theOpt.setVote(opt.getVote());
					newOptionList.add(theOpt);
				}
				opt.setSlide(s);
			}
			s.setOptionList(newOptionList);
		}
		s.setHeading(slideFromReq.getHeading());
		slideRepository.save(s);

		for (SocketIOClient client : senderClient.getNamespace().getRoomOperations(room).getClients()) {
//			if (!client.getSessionId().equals(senderClient.getSessionId())) {
//				client.sendEvent("read_message", message);
//			}
			client.sendEvent("read_message", data);
		}
	}
	// User send update slide
		public void sendUpdateSlideToClient(Collection<SocketIOClient> senderClient, SocketUpdateMessage data, String room) throws Exception {
			for (SocketIOClient client : socketIOServer.getRoomOperations(room).getClients()) {
				System.out.println("Send update slide");
//				if (!client.getSessionId().equals(senderClient.getSessionId())) {
//					client.sendEvent("read_message", message);
//				}
				client.sendEvent("read_message", data);
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
