# Ticket Booking Platform

Production-style ticket booking microservices built with **Java 21** and **Spring Boot 3**. Designed with clean code principles, SOLID design, and event-driven architecture.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Services](#services)
- [Event Flow](#event-flow)
- [Code Quality & Design Principles](#code-quality--design-principles)
- [Refactoring Summary](#refactoring-summary)
- [Quick Start](#quick-start)
- [API Endpoints](#api-endpoints)
- [Shared Modules](#shared-modules)
- [Environment Variables](#environment-variables)
- [Roadmap](#roadmap)

---

## Overview

The platform enables ticket booking with anti-double-booking guarantees:

1. **Catalog** – Browse shows and seats (MongoDB)
2. **Availability** – Seat availability cached from catalog (Redis)
3. **Reservation** – Hold seats for 7 minutes with Redis locks (Redis + Kafka)
4. **Order** – Create orders and integrate with payment flow (PostgreSQL + Kafka)

The system uses Kafka for event-driven communication and Redis for caching and distributed locking.

---

## Architecture

```
┌─────────────────┐     HTTP      ┌──────────────────┐     HTTP      ┌─────────────────┐
│ Catalog Service │◄──────────────│ Availability     │               │ Reservation     │
│ (MongoDB)       │               │ Service (Redis)  │◄──────────────│ Service (Redis) │
└─────────────────┘               └──────────────────┘               └────────┬────────┘
                                                                              │
                                                                              │ POST hold
                                                                              ▼
┌─────────────────┐     Kafka     ┌──────────────────┐               ┌─────────────────┐
│ Payment Service │◄──────────────│ Order Service    │◄──────────────│ Client / UI     │
│ (mock)          │               │ (PostgreSQL)     │   POST order  └─────────────────┘
└────────┬────────┘               └────────┬─────────┘
         │                                │
         │ payment.succeeded/failed       │ order.confirmed/cancelled
         └────────────────────────────────┘
```

---

## Technology Stack

| Component       | Technology                        |
|----------------|-----------------------------------|
| Runtime        | Java 21                           |
| Framework      | Spring Boot 3.2                   |
| Databases      | MongoDB, PostgreSQL               |
| Cache / Store  | Redis                             |
| Messaging      | Apache Kafka                      |
| API Docs       | SpringDoc OpenAPI 3               |
| Build          | Maven                             |

---

## Project Structure

```
ticketing-system/
├── pom.xml                      # Parent POM (modules)
├── docker-compose.yml           # Infrastructure (Postgres, Mongo, Redis, Kafka, Zookeeper)
├── README.md
│
├── ticketing-events/            # Shared Kafka event DTOs
├── ticketing-common/            # Shared utilities, exceptions, mappers, contracts
│
├── catalog-service/             # Show catalog (port 8081)
├── availability-service/        # Seat availability cache (port 8082)
├── reservation-service/         # Seat holds & locks (port 8083)
└── order-service/               # Orders & payment flow (port 8084)
```

### Per-Service Structure (Aligned Across All Services)

```
service/
├── config/          # Infrastructure (OpenAPI, Redis, WebClient, etc.)
├── controller/      # HTTP layer – delegates to service
├── service/         # Business logic (interface + impl)
├── repository/      # Data access (interface + impl or Spring Data)
├── mapper/          # DTO/entity/event mappers (ToEntityMapper, ToDtoMapper, ToEventMapper)
├── event/           # Kafka event publishers (interface + impl)
├── handler/         # Domain event handlers (where applicable)
├── consumer/        # Kafka consumers (where applicable)
├── constant/        # ApiPaths, OpenApiConstants
├── dto/             # Request/Response DTOs
└── entity/          # Domain entities
```

---

## Services

| Service            | Port | Database   | Responsibility |
|--------------------|------|------------|----------------|
| catalog-service    | 8081 | MongoDB    | Shows, venues, seats; source of truth |
| availability-service | 8082 | Redis (cache) | Seat availability; calls catalog, caches 5 min |
| reservation-service | 8083 | Redis      | Seat locks (SET NX PX 7 min); holds, expiry events |
| order-service      | 8084 | PostgreSQL | Orders; payment.requested; consumes payment.succeeded/failed |

---

## Event Flow

| Event               | Publisher         | Consumer(s)    | Purpose |
|---------------------|-------------------|----------------|---------|
| `reservation.created` | reservation-service | —              | Hold created |
| `reservation.expired` | reservation-service | —              | Hold expired (Redis TTL) |
| `payment.requested` | order-service      | payment-service | Trigger payment |
| `payment.succeeded` | payment-service    | order-service   | Confirm order |
| `payment.failed`    | payment-service    | order-service   | Cancel order |
| `order.confirmed`   | order-service      | reservation-service (future) | Confirm hold |
| `order.cancelled`   | order-service      | reservation-service (future) | Release hold |

---

## Code Quality & Design Principles

### SOLID

| Principle | Implementation |
|-----------|----------------|
| **S**ingle Responsibility | Controllers (HTTP), services (orchestration), handlers (event logic), mappers (conversion), repositories (persistence) |
| **O**pen/Closed | Interfaces for publishers, clients, services; new implementations can be added without changing callers |
| **L**iskov Substitution | Entities and DTOs substitutable within their hierarchies |
| **I**nterface Segregation | Small, focused interfaces (`ReservationService`, `CatalogClient`, `PaymentEventPublisher`, etc.) |
| **D**ependency Inversion | Services depend on abstractions (`ReservationEventPublisher`, `HoldDataRepository`, `CatalogClient`) |

### Clean Code

- **Meaningful names** – `createHold`, `releaseHold`, `HoldData`, `seatLockKey`
- **Small functions** – Logic split into handlers, mappers, and helpers
- **Constants** – No magic values; `RedisKeys`, `ApiPaths`, `HttpStatusCodes`, `SharedOpenApiConstants`
- **Javadoc** – SRP/DIP noted at class level where relevant
- **Consistent structure** – Same layout across services for easier navigation and onboarding

---

## Refactoring Summary

### ticketing-common

- **SharedOpenApiConstants.API_VERSION** – Single source for `"1.0.0"` across services
- **Mapper interfaces** – `ToEntityMapper<T,E>`, `ToDtoMapper<E,D>`, `ToEventMapper<E,V>` with SRP-focused Javadoc

### catalog-service

- **OpenApiConstants** – Uses `SharedOpenApiConstants.API_VERSION`
- **ShowRepository** – ISP Javadoc
- **ShowService / ShowServiceImpl** – DIP/SRP Javadoc
- **ShowController** – SRP/DIP Javadoc
- **DataLoader** – SRP Javadoc
- **ShowMapper** – Maps `Show` → `CatalogShowResponse` for shared contract use

### availability-service

- **OpenApiConstants** – Uses `SharedOpenApiConstants.API_VERSION`
- **CatalogClient** – Interface with Javadoc; `CatalogClientImpl` for WebClient
- **SeatAvailabilityMapper** – Implements `ToEntityMapper<CatalogShowResponse, SeatAvailability>`
- **AvailabilityController / Service** – SRP/DIP Javadoc

### reservation-service

- **HoldDataRepository** – Interface abstracting Redis; `RedisHoldDataRepository` impl with `acquireSeatLocks`, `save`, `findById`, `findHoldMeta`, `delete`
- **ReservationEventPublisher** – Interface; `KafkaReservationEventPublisher` impl
- **HoldExpiryHandler** – Dedicated handler for hold expiry (moved out of `RedisConfig`)
- **RedisConfig** – Config-only; delegates hold expiry to `HoldExpiryHandler`
- **Event mappers** – `HoldDataToReservationCreatedEventMapper`, `HoldExpiredToReservationExpiredEventMapper` implement `ToEventMapper`
- **OpenApiConstants** – Uses `SharedOpenApiConstants.API_VERSION`

### order-service

- **PaymentEventPublisher** – Interface; `KafkaPaymentEventPublisher` impl
- **OrderEventPublisher** – Interface; `KafkaOrderEventPublisher` impl
- **PaymentEventHandler** – Handles `payment.succeeded` / `payment.failed`; updates order, publishes `order.confirmed` / `order.cancelled`
- **PaymentEventConsumer** – Deserializes and routes events to `PaymentEventHandler`
- **Event mappers** – `OrderToPaymentRequestedEventMapper`, `OrderToOrderConfirmedEventMapper`, `OrderToOrderCancelledEventMapper` (with `OrderCancelledEventSource`)
- **OrderMapper** – Implements `ToEntityMapper` and `ToDtoMapper`
- **OpenApiConstants** – Uses `SharedOpenApiConstants.API_VERSION`

---

## Quick Start

### 1. Start Infrastructure

```bash
docker compose up -d
```

| Service    | Host        | Details |
|------------|-------------|---------|
| PostgreSQL | localhost:5432 | DB: `ticketing_orders`, user: `ticketing`, password: `ticketing_secret` |
| MongoDB    | localhost:27017 | |
| Redis      | localhost:6379  | Keyspace notifications enabled |
| Kafka      | localhost:9092  | |
| Zookeeper  | localhost:2181  | |

### 2. Build

```bash
mvn clean install
```

### 3. Run Services (in separate terminals)

```bash
# Catalog (required for availability)
mvn -pl catalog-service spring-boot:run

# Availability (depends on catalog)
mvn -pl availability-service spring-boot:run

# Reservation (Redis + Kafka)
mvn -pl reservation-service spring-boot:run

# Order (PostgreSQL + Kafka)
mvn -pl order-service spring-boot:run
```

### 4. Verify

- Catalog: http://localhost:8081/swagger-ui.html
- Availability: http://localhost:8082/swagger-ui.html
- Reservation: http://localhost:8083/swagger-ui.html
- Order: http://localhost:8084/swagger-ui.html

---

## API Endpoints

| Service    | Method | Path                         | Description |
|------------|--------|------------------------------|-------------|
| Catalog    | GET    | /api/shows                   | List all shows |
| Catalog    | GET    | /api/shows/{id}              | Get show by ID |
| Availability | GET  | /api/availability/{showId}   | Get seat availability (cached) |
| Reservation | POST  | /api/reservations            | Create hold (holdId, showId, seatIds, userId) |
| Reservation | DELETE | /api/reservations/{holdId}   | Release hold |
| Order      | POST   | /api/orders                  | Create order (holdId, showId, seatIds, userId, amount, currency) |

---

## Shared Modules

### ticketing-events

Kafka event DTOs with `@JsonTypeName` for polymorphic deserialization:

- `reservation.created`, `reservation.expired`
- `payment.requested`, `payment.succeeded`, `payment.failed`
- `order.confirmed`, `order.cancelled`
- `notification.requested`

### ticketing-common

| Package       | Contents |
|---------------|----------|
| `exception`   | `ApiException`, `ResourceNotFoundException`, `ConflictException`, `BadRequestException`, `GlobalExceptionHandler`, `ErrorResponse` |
| `constant`    | `HttpStatusCodes`, `SharedOpenApiConstants` |
| `config`      | `OpenApiConfigurer`, `WebConfig` |
| `contract/catalog` | `CatalogShowResponse`, `CatalogApiPaths` |
| `mapper`      | `ToEntityMapper<T,E>`, `ToDtoMapper<E,D>`, `ToEventMapper<E,V>` |

Use `@Import(WebConfig.class)` in your service application.

---

## Environment Variables

| Variable               | Default        | Used By |
|------------------------|----------------|---------|
| `REDIS_HOST`           | localhost      | availability, reservation |
| `REDIS_PORT`           | 6379           | availability, reservation |
| `KAFKA_BOOTSTRAP_SERVERS` | localhost:9092 | reservation, order |
| `POSTGRES_HOST`        | localhost      | order |
| `POSTGRES_PORT`        | 5432           | order |
| `POSTGRES_DB`          | ticketing_orders | order |
| `POSTGRES_USER`        | ticketing      | order |
| `POSTGRES_PASSWORD`    | ticketing_secret | order |
| `catalog.service.url`  | http://localhost:8081 | availability |

---

## Roadmap

- [ ] Payment service (mock; consumes `payment.requested`, publishes succeeded/failed)
- [ ] Notification service (consumes `notification.requested`)
- [ ] API Gateway
- [ ] Reservation-service consumers for `order.confirmed` / `order.cancelled` (confirm/release holds)
- [ ] Kubernetes manifests (Deployments, Services, Ingress, HPA)
- [ ] Testcontainers tests (reservation locking, order–payment flow)

---

## License

Proprietary – All rights reserved.
