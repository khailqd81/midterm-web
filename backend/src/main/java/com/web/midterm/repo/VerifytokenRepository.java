package com.web.midterm.repo;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.web.midterm.entity.Verifytoken;

public interface VerifytokenRepository extends JpaRepository<Verifytoken, Integer> {
	Optional<Verifytoken> findByToken(String token);
}
