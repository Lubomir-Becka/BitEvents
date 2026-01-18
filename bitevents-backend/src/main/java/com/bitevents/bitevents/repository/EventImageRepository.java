package com.bitevents.bitevents.repository;

import com.bitevents.bitevents.model.Event;
import com.bitevents.bitevents.model.EventImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EventImageRepository extends JpaRepository<EventImage, Long> {

    List<EventImage> findByEventOrderByDisplayOrderAsc(Event event);

    Optional<EventImage> findByEventAndIsPrimaryTrue(Event event);

    void deleteByEvent(Event event);
}
