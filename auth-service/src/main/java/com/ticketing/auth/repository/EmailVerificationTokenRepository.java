package com.ticketing.auth.repository;

import com.ticketing.auth.entity.EmailVerificationToken;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface EmailVerificationTokenRepository extends MongoRepository<EmailVerificationToken, String> {
    Optional<EmailVerificationToken> findByToken(String token);

    void deleteByUserId(String userId);
}
