package com.ticketing.catalog.service.impl;

import com.ticketing.catalog.entity.Show;
import com.ticketing.catalog.repository.ShowRepository;
import com.ticketing.catalog.service.ShowService;
import com.ticketing.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Implementation of ShowService.
 * SRP: orchestrate show catalog operations via repository.
 */
@Service
@RequiredArgsConstructor
public class ShowServiceImpl implements ShowService {

    private final ShowRepository repository;

    @Override
    public List<Show> findAll() {
        return repository.findAll();
    }

    @Override
    public Show findById(String id) {
        return repository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.forResource("Show", id));
    }
}
