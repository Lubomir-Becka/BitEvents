package com.bitevents.bitevents.repository;

import com.bitevents.bitevents.model.Event;
import com.bitevents.bitevents.model.SavedEvent;
import com.bitevents.bitevents.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SavedEventRepository extends JpaRepository<SavedEvent, Long> {

    Optional<SavedEvent> findByUserAndEvent(User user, Event event);

    List<SavedEvent> findByUserOrderBySavedDateDesc(User user);

    boolean existsByUserAndEvent(User user, Event event);

    void deleteByUserAndEvent(User user, Event event);
}
