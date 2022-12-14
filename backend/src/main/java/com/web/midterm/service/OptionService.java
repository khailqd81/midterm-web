package com.web.midterm.service;

import com.web.midterm.entity.Option;

public interface OptionService {
	public void deleteById(int optionId) throws Exception;
	public Option findById(int optionId);
}
