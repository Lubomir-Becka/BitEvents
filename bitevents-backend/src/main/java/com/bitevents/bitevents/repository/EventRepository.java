package com.bitevents.bitevents.repository;

import com.bitevents.bitevents.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EventRepository extends JpaRepository<Event, Long> {
}
