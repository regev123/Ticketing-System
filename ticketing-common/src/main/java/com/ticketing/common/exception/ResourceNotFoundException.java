package com.ticketing.common.exception;

import org.springframework.http.HttpStatus;

public class ResourceNotFoundException extends ApiException {

    public ResourceNotFoundException(String message) {
        super(HttpStatus.NOT_FOUND, ErrorCodes.NOT_FOUND, message);
    }

    public static ResourceNotFoundException forResource(String resourceType, String id) {
        return new ResourceNotFoundException("%s not found: %s".formatted(resourceType, id));
    }
}
