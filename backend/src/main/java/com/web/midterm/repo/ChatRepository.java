package com.web.midterm.repo;


import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

import com.web.midterm.entity.Chat;

@Repository
public interface ChatRepository extends PagingAndSortingRepository<Chat, Integer>{
	public Page<Chat> findByPresentPresentId(int id, Pageable p);
}
