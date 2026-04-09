# Build stage: build a single module (BUILD_MODULE) and its dependencies
ARG BUILD_MODULE
FROM maven:3.9-eclipse-temurin-21-alpine AS build
ARG BUILD_MODULE
WORKDIR /build

# Copy root POM and all module POMs/sources (needed for -am)
COPY pom.xml .
COPY ticketing-events ./ticketing-events
COPY ticketing-common ./ticketing-common
COPY api-gateway ./api-gateway
COPY catalog-service ./catalog-service
COPY availability-service ./availability-service
COPY reservation-service ./reservation-service
COPY order-service ./order-service
COPY payment-service ./payment-service
COPY notification-service ./notification-service

# Build only the requested module and its dependencies
RUN mvn -B -pl "${BUILD_MODULE}" -am package -DskipTests -q

# Runtime stage
FROM eclipse-temurin:21-jre-alpine
ARG BUILD_MODULE
# Copy the repackaged Spring Boot JAR (explicit name; glob can pick wrong file)
COPY --from=build /build/${BUILD_MODULE}/target/${BUILD_MODULE}-1.0.0-SNAPSHOT.jar /app/app.jar
WORKDIR /app
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
