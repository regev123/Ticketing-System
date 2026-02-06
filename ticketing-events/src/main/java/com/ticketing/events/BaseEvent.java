package com.ticketing.events;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.annotation.JsonTypeName;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

/**
 * Base for all domain events.
 * Liskov Substitution: subclasses can be used wherever BaseEvent is expected.
 */
@Getter
@Setter
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type")
@JsonTypeName("base")
public abstract class BaseEvent {
    private String id;
    private Instant timestamp;
    private String correlationId;

    protected BaseEvent() {
        this.id = java.util.UUID.randomUUID().toString();
        this.timestamp = Instant.now();
    }
}
