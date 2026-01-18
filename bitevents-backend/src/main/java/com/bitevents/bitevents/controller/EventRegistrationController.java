package com.bitevents.bitevents.controller;

import com.bitevents.bitevents.model.EventRegistration;
import com.bitevents.bitevents.model.User;
import com.bitevents.bitevents.service.EventRegistrationService;
import com.bitevents.bitevents.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/registrations")
public class EventRegistrationController {

    private final EventRegistrationService registrationService;
    private final UserService userService;

    public EventRegistrationController(EventRegistrationService registrationService, UserService userService) {
        this.registrationService = registrationService;
        this.userService = userService;
    }

    @PostMapping("/events/{eventId}")
    public ResponseEntity<EventRegistration> registerForEvent(
            @PathVariable Long eventId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.findByEmail(userDetails.getUsername());
        EventRegistration registration = registrationService.registerUserForEvent(eventId, user.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(registration);
    }

    @DeleteMapping("/{registrationId}")
    public ResponseEntity<Void> cancelRegistration(
            @PathVariable Long registrationId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.findByEmail(userDetails.getUsername());
        registrationService.cancelRegistration(registrationId, user.getId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/my")
    public ResponseEntity<List<EventRegistration>> getMyRegistrations(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.findByEmail(userDetails.getUsername());
        List<EventRegistration> registrations = registrationService.getUserRegistrations(user.getId());
        return ResponseEntity.ok(registrations);
    }

    @GetMapping("/events/{eventId}")
    public ResponseEntity<List<EventRegistration>> getEventRegistrations(@PathVariable Long eventId) {
        List<EventRegistration> registrations = registrationService.getEventRegistrations(eventId);
        return ResponseEntity.ok(registrations);
    }
}
