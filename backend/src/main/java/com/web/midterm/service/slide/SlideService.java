package com.web.midterm.service.slide;

import java.util.List;

import com.web.midterm.dto.slide_dto.UserVoteRequest;
import com.web.midterm.entity.Slide;
import com.web.midterm.entity.UserAnswer;

public interface SlideService {
	public Slide findById(int slideId);
	public void save(Slide s);
	public Slide create(String typeName, int presentId) throws Exception;
	public void update(Slide s) throws Exception;
	public Slide getSlideDetailById(int slideId) throws Exception;
	public List<UserAnswer> getSlideAnswerList(int slideId) throws Exception;
	public Slide updateSlideVote(int slideId, UserVoteRequest dto) throws Exception;
	public void deleteById(int slideId) throws Exception;
}
