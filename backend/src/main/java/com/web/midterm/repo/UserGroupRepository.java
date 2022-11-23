package com.web.midterm.repo;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.web.midterm.entity.UserGroup;
import com.web.midterm.entity.UserGroupId;
public interface UserGroupRepository extends JpaRepository<UserGroup, UserGroupId> {
	public List<UserGroup> findByPrimaryKeyUserUserId(int id);
	public List<UserGroup> findByPrimaryKeyGroupGroupId(int id);
}
