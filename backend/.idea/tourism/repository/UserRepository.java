package com.northwollo.tourism.repository;

import com.northwollo.tourism.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);  // ✅ Used by TourismRatingServiceImpl
    Optional<User> findByEmail(String email);        // ✅ For registration/login
    boolean existsByUsername(String username);       // ✅ For validation
    boolean existsByEmail(String email);             // ✅ For validation
}
