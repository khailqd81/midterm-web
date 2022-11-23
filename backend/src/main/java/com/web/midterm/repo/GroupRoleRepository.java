package com.web.midterm.repo;

import org.springframework.data.jpa.repository.JpaRepository;

import com.web.midterm.entity.GroupRole;

public interface GroupRoleRepository extends JpaRepository<GroupRole, Integer> {
	public GroupRole findByRoleName(String roleName);
}
