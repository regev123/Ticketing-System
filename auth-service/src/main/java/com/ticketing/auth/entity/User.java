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
@Document(collection = "users")
public class User {
    @Id
    private String id;

    @Indexed(unique = true)
    private String email;

    private String passwordHash;

    private UserRole role;

    private boolean isActive;

    private boolean emailVerified;

    private Instant createdAt;

    private Instant updatedAt;

    private Instant lastLoginAt;

    private int tokenVersion;

    private String firstName;

    private String lastName;

    private String scannerEventId;

    private String scannerEventTitle;

    private Instant scannerEventEndAt;
}
