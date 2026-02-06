package com.ticketing.catalog.config;

import com.ticketing.catalog.constant.SampleDataConstants;
import com.ticketing.catalog.entity.Show;
import com.ticketing.catalog.repository.ShowRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import java.time.Instant;
import java.util.stream.IntStream;

/**
 * Loads sample data when database is empty.
 * SRP: seed initial catalog data.
 * Profile-restricted: runs in dev/local/default to avoid polluting production.
 */
@Configuration
@Profile({"dev", "local", "default"})
public class DataLoader {

    @Bean
    CommandLineRunner init(ShowRepository repository) {
        return args -> {
            if (repository.count() == 0) {
                repository.save(createSampleShow());
            }
        };
    }

    private static Show createSampleShow() {
        var seats = IntStream.rangeClosed(1, SampleDataConstants.SEAT_COUNT)
                .mapToObj(DataLoader::createSeat)
                .toList();

        var show = new Show();
        show.setTitle(SampleDataConstants.SAMPLE_SHOW_TITLE);
        show.setVenueId(SampleDataConstants.SAMPLE_VENUE_ID);
        show.setStartTime(Instant.now().plusSeconds(86400L * SampleDataConstants.DAYS_UNTIL_SHOW));
        show.setSeats(seats);
        return show;
    }

    private static Show.Seat createSeat(int seatNumber) {
        int row = (seatNumber - 1) / 10 + 1;
        return new Show.Seat(
                SampleDataConstants.DEFAULT_SECTION + "-" + seatNumber,
                SampleDataConstants.DEFAULT_SECTION,
                row,
                seatNumber,
                SampleDataConstants.DEFAULT_SEAT_PRICE,
                SampleDataConstants.DEFAULT_CURRENCY
        );
    }
}
