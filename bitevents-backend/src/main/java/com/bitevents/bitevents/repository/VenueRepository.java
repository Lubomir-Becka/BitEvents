package com.bitevents.bitevents.repository;

import com.bitevents.bitevents.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VenueRepository extends JpaRepository<User, Long> {
}
