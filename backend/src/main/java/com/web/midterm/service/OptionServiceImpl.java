package com.web.midterm.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.web.midterm.entity.Option;
import com.web.midterm.repo.OptionRepository;

@Service
public class OptionServiceImpl implements OptionService {

	@Autowired
	private OptionRepository optionRepository;

	@Override
	public void deleteById(int optionId) throws Exception {
		optionRepository.deleteById(optionId);

	}
	
	@Override
	public Option findById(int optionId){
		return optionRepository.findById(optionId);

	}

}
