package com.bitevents.bitevents.service;

import com.bitevents.bitevents.model.Event;
import com.bitevents.bitevents.model.EventRegistration;
import com.bitevents.bitevents.model.User;
import com.bitevents.bitevents.repository.EventRegistrationRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class EventRegistrationService {

    private final EventRegistrationRepository registrationRepository;
    private final EventService eventService;
    private final UserService userService;

    public EventRegistrationService(EventRegistrationRepository registrationRepository,
                                   EventService eventService,
                                   UserService userService) {
        this.registrationRepository = registrationRepository;
        this.eventService = eventService;
        this.userService = userService;
    }

    public EventRegistration registerUserForEvent(Long eventId, Long userId) {
        Event event = eventService.findById(eventId);
        User user = userService.findById(userId);

        // Check if user is already registered
        if (registrationRepository.existsByEventAndUser(event, user)) {
            throw new IllegalStateException("Používateľ je už registrovaný na tento event.");
        }

        // Check capacity
        if (event.getCapacity() != null) {
            long currentRegistrations = registrationRepository.countByEvent(event);
            if (currentRegistrations >= event.getCapacity()) {
                throw new IllegalStateException("Event je už plne obsadený.");
            }
        }

        EventRegistration registration = new EventRegistration();
        registration.setEvent(event);
        registration.setUser(user);
        registration.setRegistrationDate(OffsetDateTime.now());
        registration.setStatus("Confirmed");
        registration.setTicketCode(generateTicketCode());

        return registrationRepository.save(registration);
    }

    public void cancelRegistration(Long registrationId, Long userId) {
        EventRegistration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new EntityNotFoundException("Registrácia nebola nájdená."));

        if (!registration.getUser().getId().equals(userId)) {
            throw new IllegalStateException("Nemôžete zrušiť registráciu iného používateľa.");
        }

        registration.setStatus("Cancelled");
        registrationRepository.save(registration);
    }

    public void cancelRegistrationByEvent(Long eventId, Long userId) {
        Event event = eventService.findById(eventId);
        User user = userService.findById(userId);

        EventRegistration registration = registrationRepository.findByEventAndUser(event, user)
                .orElseThrow(() -> new EntityNotFoundException("Registrácia nebola nájdená."));

        registrationRepository.delete(registration);
    }

    public List<EventRegistration> getUserRegistrations(Long userId) {
        User user = userService.findById(userId);
        return registrationRepository.findAllByUser(user);
    }

    public List<EventRegistration> getEventRegistrations(Long eventId) {
        Event event = eventService.findById(eventId);
        return registrationRepository.findAllByEvent(event);
    }

    public boolean isUserRegistered(Long eventId, Long userId) {
        Event event = eventService.findById(eventId);
        User user = userService.findById(userId);
        return registrationRepository.existsByEventAndUser(event, user);
    }

    public long getRegistrationCount(Long eventId) {
        Event event = eventService.findById(eventId);
        return registrationRepository.countByEvent(event);
    }

    private String generateTicketCode() {
        return "TKT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}
