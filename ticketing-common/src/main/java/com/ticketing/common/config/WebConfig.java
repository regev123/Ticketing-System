package com.ticketing.common.config;

import com.ticketing.common.exception.GlobalExceptionHandler;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;

/**
 * Web layer configuration.
 * Imports shared components like GlobalExceptionHandler for consistent API behavior.
 */
@Configuration
@Import(GlobalExceptionHandler.class)
public class WebConfig {
}
