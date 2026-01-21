package com.bitevents.bitevents.controller;

import com.bitevents.bitevents.dto.EventDto;
import com.bitevents.bitevents.model.Event;
import com.bitevents.bitevents.model.EventRegistration;
import com.bitevents.bitevents.model.User;
import com.bitevents.bitevents.service.EventRegistrationService;
import com.bitevents.bitevents.service.EventService;
import com.bitevents.bitevents.service.UserService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/organizer")
public class OrganizerController {

    private final EventService eventService;
    private final UserService userService;
    private final EventRegistrationService registrationService;

    public OrganizerController(EventService eventService, UserService userService,
                              EventRegistrationService registrationService) {
        this.eventService = eventService;
        this.userService = userService;
        this.registrationService = registrationService;
    }

    /**
     * Get all events created by the current organizer
     */
    @GetMapping("/events")
    public ResponseEntity<List<Event>> getMyEvents(@AuthenticationPrincipal UserDetails userDetails) {
        User organizer = userService.findByEmail(userDetails.getUsername());
        List<Event> events = eventService.getEventsByOrganizer(organizer.getId());
        return ResponseEntity.ok(events);
    }

    /**
     * Get statistics for a specific event
     */
    @GetMapping("/events/{eventId}/statistics")
    public ResponseEntity<Map<String, Object>> getEventStatistics(
            @PathVariable @Min(1) Long eventId,
            @AuthenticationPrincipal UserDetails userDetails) {

        User organizer = userService.findByEmail(userDetails.getUsername());

        // Verify ownership
        if (!eventService.isEventOwner(eventId, organizer.getId())) {
            throw new AccessDeniedException("Nemáte oprávnenie na zobrazenie štatistík tohto eventu");
        }

        Event event = eventService.findById(eventId);
        long registrationCount = registrationService.getRegistrationCount(eventId);
        List<EventRegistration> registrations = registrationService.getEventRegistrations(eventId);

        Map<String, Object> statistics = new HashMap<>();
        statistics.put("eventId", eventId);
        statistics.put("eventName", event.getName());
        statistics.put("totalRegistrations", registrationCount);
        statistics.put("capacity", event.getCapacity());
        statistics.put("availableSpots", event.getCapacity() != null ? event.getCapacity() - registrationCount : null);
        statistics.put("registrations", registrations);

        return ResponseEntity.ok(statistics);
    }

    /**
     * Create a new event (organizer only)
     */
    @PostMapping("/events")
    public ResponseEntity<Event> createEvent(
            @RequestBody @Valid EventDto eventDto,
            @AuthenticationPrincipal UserDetails userDetails) {

        User organizer = userService.findByEmail(userDetails.getUsername());

        // Verify user is organizer
        if (!organizer.getIsOrganizer()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        eventDto.setOrganizerId(organizer.getId());
        Event newEvent = eventService.createEvent(eventDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(newEvent);
    }

    /**
     * Update an existing event (only own events)
     */
    @PutMapping("/events/{id}")
    public ResponseEntity<Event> updateEvent(
            @PathVariable @Min(1) Long id,
            @RequestBody @Valid EventDto eventDto,
            @AuthenticationPrincipal UserDetails userDetails) {

        User organizer = userService.findByEmail(userDetails.getUsername());

        // Verify ownership
        if (!eventService.isEventOwner(id, organizer.getId())) {
            throw new AccessDeniedException("Nemáte oprávnenie na úpravu tohto eventu");
        }

        eventDto.setOrganizerId(organizer.getId());
        Event updatedEvent = eventService.updateEvent(id, eventDto);
        return ResponseEntity.ok(updatedEvent);
    }

    /**
     * Delete an event (only own events)
     */
    @DeleteMapping("/events/{id}")
    public ResponseEntity<Void> deleteEvent(
            @PathVariable @Min(1) Long id,
            @AuthenticationPrincipal UserDetails userDetails) {

        User organizer = userService.findByEmail(userDetails.getUsername());

        // Verify ownership
        if (!eventService.isEventOwner(id, organizer.getId())) {
            throw new AccessDeniedException("Nemáte oprávnenie na zmazanie tohto eventu");
        }

        eventService.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Get organizer dashboard statistics
     */
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard(@AuthenticationPrincipal UserDetails userDetails) {
        User organizer = userService.findByEmail(userDetails.getUsername());
        List<Event> events = eventService.getEventsByOrganizer(organizer.getId());

        long totalEvents = events.size();
        long totalRegistrations = events.stream()
                .mapToLong(event -> registrationService.getRegistrationCount(event.getId()))
                .sum();

        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("totalEvents", totalEvents);
        dashboard.put("totalRegistrations", totalRegistrations);
        dashboard.put("events", events);

        return ResponseEntity.ok(dashboard);
    }
}
