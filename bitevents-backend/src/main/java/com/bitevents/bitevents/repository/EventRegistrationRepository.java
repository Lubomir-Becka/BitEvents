package com.bitevents.bitevents.repository;

import com.bitevents.bitevents.model.Event;
import com.bitevents.bitevents.model.EventRegistration;
import com.bitevents.bitevents.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EventRegistrationRepository extends JpaRepository<EventRegistration, Long> {

    Optional<EventRegistration> findByEventAndUser(Event event, User user);

    List<EventRegistration> findAllByEvent(Event event);

    List<EventRegistration> findAllByUser(User user);

    long countByEvent(Event event);

    boolean existsByEventAndUser(Event event, User user);
}
