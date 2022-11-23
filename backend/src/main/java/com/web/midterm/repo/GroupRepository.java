package com.web.midterm.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.web.midterm.entity.Group;

@Repository
public interface GroupRepository extends JpaRepository<Group, Integer>{
	public Group findByGroupId(int id);
	public Group findByGroupLink(String groupLink);
}
