package com.ticketing.catalog.service.impl;

import com.ticketing.catalog.dto.CreateShowRequest;
import com.ticketing.catalog.entity.Show;
import com.ticketing.catalog.repository.ShowRepository;
import com.ticketing.catalog.service.ShowService;
import com.ticketing.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
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

    @Override
    public Show create(CreateShowRequest request) {
        Show show = new Show();
        show.setTitle(request.title());
        show.setCategory(request.category().trim());
        String description = request.description();
        show.setDescription(description != null && !description.isBlank() ? description.trim() : null);
        if (request.venue() != null) {
            var v = request.venue();
            show.setVenue(new Show.Venue(
                    v.venueName(),
                    v.city(),
                    v.country(),
                    v.address(),
                    new Show.Geo(v.geo().lat(), v.geo().lng())
            ));
        }
        show.setDoorsOpenTime(Instant.parse(request.doorsOpenTime()));
        show.setStartTime(Instant.parse(request.startTime()));
        show.setEndTime(Instant.parse(request.endTime()));
        show.setSeats(buildSeats(request.sections()));
        String cover = request.coverImageUrl();
        show.setCoverImageUrl(cover != null && !cover.isBlank() ? cover.trim() : null);
        return repository.save(show);
    }

    private static List<Show.Seat> buildSeats(List<CreateShowRequest.SectionInput> sections) {
        List<Show.Seat> seats = new ArrayList<>();
        for (CreateShowRequest.SectionInput sec : sections) {
            for (int row = 1; row <= sec.rowCount(); row++) {
                for (int num = 1; num <= sec.seatsPerRow(); num++) {
                    int seatIndex = (row - 1) * sec.seatsPerRow() + num;
                    String id = sec.section() + "-" + seatIndex;
                    seats.add(new Show.Seat(id, sec.section(), row, num, sec.price(), sec.currency()));
                }
            }
        }
        return seats;
    }
}
