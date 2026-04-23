package com.ticketing.auth.entity;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@Document(collection = "email_verification_tokens")
public class EmailVerificationToken {
    @Id
    private String id;

    @Indexed(unique = true)
    private String token;

    @Indexed
    private String userId;

    @Indexed
    private String email;

    private Instant createdAt;
    @Indexed(expireAfterSeconds = 0)
    private Instant expiresAt;
    private Instant usedAt;
}
