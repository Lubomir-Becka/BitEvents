package com.bitevents.bitevents.controller;

import com.bitevents.bitevents.model.Event;
import com.bitevents.bitevents.model.SavedEvent;
import com.bitevents.bitevents.model.User;
import com.bitevents.bitevents.service.SavedEventService;
import com.bitevents.bitevents.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/saved-events")
public class SavedEventController {

    private final SavedEventService savedEventService;
    private final UserService userService;

    public SavedEventController(SavedEventService savedEventService, UserService userService) {
        this.savedEventService = savedEventService;
        this.userService = userService;
    }

    @PostMapping("/{eventId}")
    public ResponseEntity<SavedEvent> saveEvent(
            @PathVariable Long eventId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.findByEmail(userDetails.getUsername());
        SavedEvent savedEvent = savedEventService.saveEvent(eventId, user.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(savedEvent);
    }

    @DeleteMapping("/{eventId}")
    public ResponseEntity<Void> unsaveEvent(
            @PathVariable Long eventId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.findByEmail(userDetails.getUsername());
        savedEventService.unsaveEvent(eventId, user.getId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<Event>> getMySavedEvents(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.findByEmail(userDetails.getUsername());
        List<Event> savedEvents = savedEventService.getUserSavedEvents(user.getId());
        return ResponseEntity.ok(savedEvents);
    }

    @GetMapping("/check/{eventId}")
    public ResponseEntity<Map<String, Boolean>> checkIfEventSaved(
            @PathVariable Long eventId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.findByEmail(userDetails.getUsername());
        boolean isSaved = savedEventService.isEventSavedByUser(eventId, user.getId());
        return ResponseEntity.ok(Map.of("isSaved", isSaved));
    }
}
