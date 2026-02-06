package com.ticketing.catalog.repository;

import com.ticketing.catalog.entity.Show;
import org.springframework.data.mongodb.repository.MongoRepository;

/**
 * MongoDB repository for Show documents.
 * ISP: extends MongoRepository with Show-specific operations.
 */
public interface ShowRepository extends MongoRepository<Show, String> {
}
