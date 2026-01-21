package com.bitevents.bitevents.controller;

import com.bitevents.bitevents.model.EventRegistration;
import com.bitevents.bitevents.model.User;
import com.bitevents.bitevents.service.EventRegistrationService;
import com.bitevents.bitevents.service.EventService;
import com.bitevents.bitevents.service.UserService;
import jakarta.validation.constraints.Min;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/registrations")
public class EventRegistrationController {

    private final EventRegistrationService registrationService;
    private final UserService userService;
    private final EventService eventService;

    public EventRegistrationController(EventRegistrationService registrationService,
                                      UserService userService,
                                      EventService eventService) {
        this.registrationService = registrationService;
        this.userService = userService;
        this.eventService = eventService;
    }


    @GetMapping("/events/my")
    public ResponseEntity<List<EventRegistration>> getMyRegistrations(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.findByEmail(userDetails.getUsername());
        List<EventRegistration> registrations = registrationService.getUserRegistrations(user.getId());
        return ResponseEntity.ok(registrations);
    }

    @PostMapping("/events/{eventId}")
    public ResponseEntity<EventRegistration> registerForEvent(
            @PathVariable @Min(1) Long eventId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.findByEmail(userDetails.getUsername());
        EventRegistration registration = registrationService.registerUserForEvent(eventId, user.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(registration);
    }

    @DeleteMapping("/events/{eventId}")
    public ResponseEntity<Void> unregisterFromEvent(
            @PathVariable @Min(1) Long eventId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.findByEmail(userDetails.getUsername());
        registrationService.cancelRegistrationByEvent(eventId, user.getId());
        return ResponseEntity.noContent().build();
    }


    @GetMapping("/events/{eventId}")
    public ResponseEntity<List<EventRegistration>> getEventRegistrations(
            @PathVariable @Min(1) Long eventId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.findByEmail(userDetails.getUsername());

        // Only event organizer can view registrations
        if (!eventService.isEventOwner(eventId, user.getId())) {
            throw new AccessDeniedException("Only event organizer can view registrations");
        }

        List<EventRegistration> registrations = registrationService.getEventRegistrations(eventId);
        return ResponseEntity.ok(registrations);
    }

    @GetMapping("/check/{eventId}")
    public ResponseEntity<Map<String, Boolean>> checkEventRegistration(
            @PathVariable @Min(1) Long eventId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.findByEmail(userDetails.getUsername());
        boolean isRegistered = registrationService.isUserRegistered(eventId, user.getId());
        return ResponseEntity.ok(Map.of("isRegistered", isRegistered));
    }
}
