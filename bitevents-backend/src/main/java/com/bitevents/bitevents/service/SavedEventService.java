package com.bitevents.bitevents.service;

import com.bitevents.bitevents.model.Event;
import com.bitevents.bitevents.model.SavedEvent;
import com.bitevents.bitevents.model.User;
import com.bitevents.bitevents.repository.SavedEventRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class SavedEventService {

    private final SavedEventRepository savedEventRepository;
    private final EventService eventService;
    private final UserService userService;

    public SavedEventService(SavedEventRepository savedEventRepository,
                            EventService eventService,
                            UserService userService) {
        this.savedEventRepository = savedEventRepository;
        this.eventService = eventService;
        this.userService = userService;
    }

    public SavedEvent saveEvent(Long eventId, Long userId) {
        Event event = eventService.findById(eventId);
        User user = userService.findById(userId);

        // Check if already saved
        if (savedEventRepository.existsByUserAndEvent(user, event)) {
            throw new IllegalStateException("Event je už uložený medzi obľúbenými.");
        }

        SavedEvent savedEvent = new SavedEvent();
        savedEvent.setEvent(event);
        savedEvent.setUser(user);
        savedEvent.setSavedDate(OffsetDateTime.now());

        return savedEventRepository.save(savedEvent);
    }

    public void unsaveEvent(Long eventId, Long userId) {
        Event event = eventService.findById(eventId);
        User user = userService.findById(userId);

        savedEventRepository.deleteByUserAndEvent(user, event);
    }

    public List<Event> getUserSavedEvents(Long userId) {
        User user = userService.findById(userId);
        return savedEventRepository.findByUserOrderBySavedDateDesc(user)
                .stream()
                .map(SavedEvent::getEvent)
                .collect(Collectors.toList());
    }

    public boolean isEventSavedByUser(Long eventId, Long userId) {
        Event event = eventService.findById(eventId);
        User user = userService.findById(userId);
        return savedEventRepository.existsByUserAndEvent(user, event);
    }
}
