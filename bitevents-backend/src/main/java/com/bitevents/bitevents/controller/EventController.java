package com.bitevents.bitevents.controller;

import com.bitevents.bitevents.dto.EventDto;
import com.bitevents.bitevents.model.Event;
import com.bitevents.bitevents.service.EventService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @PostMapping
    public ResponseEntity<Event> createEvent(@Valid @RequestBody EventDto eventDto) {
        Event newEvent = eventService.createEvent(eventDto);
        return new ResponseEntity<>(newEvent, HttpStatus.CREATED); // 201 Created
    }


    @GetMapping
    public List<Event> getAllEvents() {
        return eventService.findAllEvents(); // 200 OK
    }


    @GetMapping("/{id}")
    public ResponseEntity<Event> getEventById(@PathVariable Long id) {
        Event event = eventService.findById(id);
        return ResponseEntity.ok(event); // 200 OK
    }


    @PutMapping("/{id}")
    public ResponseEntity<Event> updateEvent(@PathVariable Long id, @Valid @RequestBody EventDto eventDto) {
        Event updatedEvent = eventService.updateEvent(id, eventDto);
        return ResponseEntity.ok(updatedEvent); // 200 OK
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id) {
        eventService.deleteEvent(id);
        return ResponseEntity.noContent().build(); // 204 No Content
    }
}
