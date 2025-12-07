package com.bitevents.bitevents.repository;

import com.bitevents.bitevents.model.User;
import com.bitevents.bitevents.model.Venue;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VenueRepository extends JpaRepository<Venue, Long> {
    List<Venue> findAllByUser(User user);
}
