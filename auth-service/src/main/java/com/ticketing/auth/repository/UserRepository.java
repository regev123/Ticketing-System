package com.ticketing.auth.repository;

import com.ticketing.auth.entity.User;
import com.ticketing.auth.entity.UserRole;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;
import java.util.List;
import java.time.Instant;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
    List<User> findByRoleOrderByCreatedAtDesc(UserRole role);
    List<User> findByRoleAndScannerEventEndAtBefore(UserRole role, Instant before);
}
