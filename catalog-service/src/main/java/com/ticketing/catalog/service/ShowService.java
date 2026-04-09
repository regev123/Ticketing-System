package com.ticketing.catalog.service;

import com.ticketing.catalog.dto.CreateShowRequest;
import com.ticketing.catalog.entity.Show;

import java.util.List;

/**
 * Service interface for show catalog operations.
 * DIP: controllers depend on this abstraction, not the repository.
 */
public interface ShowService {

    List<Show> findAll();

    Show findById(String id);

    Show create(CreateShowRequest request);
}
