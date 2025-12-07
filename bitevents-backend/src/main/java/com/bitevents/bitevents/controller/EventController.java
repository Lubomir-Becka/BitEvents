package com.bitevents.bitevents.controller;

import com.bitevents.bitevents.dto.EventDto;
import com.bitevents.bitevents.model.Event;
import com.bitevents.bitevents.service.EventService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @PostMapping
    public ResponseEntity<Event> createEvent(@RequestBody @Valid EventDto eventDto) {
        Event newEvent = eventService.createEvent(eventDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(newEvent); // 201 Created
    }

    @GetMapping
    public ResponseEntity<List<Event>> getAllEvents() {
        List<Event> events = eventService.findAllEvents();
        return ResponseEntity.ok(events); // 200 OK
    }

    @GetMapping("/{id}")
    public ResponseEntity<Event> getEventById(@PathVariable Long id) {
        Event event = eventService.findById(id);
        return ResponseEntity.ok(event); // 200 OK
    }

    @PutMapping("/{id}")
    public ResponseEntity<Event> updateEvent(
            @PathVariable Long id,
            @RequestBody @Valid EventDto eventDto) {
        Event updatedEvent = eventService.updateEvent(id, eventDto);
        return ResponseEntity.ok(updatedEvent); // 200 OK
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id) {
        eventService.deleteEvent(id);
        return ResponseEntity.noContent().build(); // 204 No Content
    }
}
