package com.bitevents.bitevents.controller;

import com.bitevents.bitevents.dto.EventDto;
import com.bitevents.bitevents.dto.PagedEventsResponseDto;
import com.bitevents.bitevents.model.Event;
import com.bitevents.bitevents.model.User;
import com.bitevents.bitevents.service.EventService;
import com.bitevents.bitevents.service.UserService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;
    private final UserService userService;

    public EventController(EventService eventService, UserService userService) {
        this.eventService = eventService;
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<Event> createEvent(
            @RequestBody @Valid EventDto eventDto,
            @AuthenticationPrincipal UserDetails userDetails) {
        User organizer = userService.findByEmail(userDetails.getUsername());
        eventDto.setOrganizerId(organizer.getId());
        Event newEvent = eventService.createEvent(eventDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(newEvent);
    }

    @GetMapping
    public ResponseEntity<PagedEventsResponseDto> getAllEvents(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) List<String> city,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "12") int limit) {

        // Spring Data uses 0-based page index
        // Use database column name for native query
        Pageable pageable = PageRequest.of(page - 1, limit, Sort.by(Sort.Direction.ASC, "start_date_time"));
        Page<Event> eventPage = eventService.findAllEvents(search, city, category, pageable);

        PagedEventsResponseDto response = new PagedEventsResponseDto(
                eventPage.getContent(),
                eventPage.getTotalElements(),
                page,
                limit,
                eventPage.getTotalPages()
        );

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Event> getEventById(@PathVariable Long id) {
        Event event = eventService.findById(id);
        return ResponseEntity.ok(event);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Event> updateEvent(
            @PathVariable Long id,
            @RequestBody @Valid EventDto eventDto,
            @AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = userService.findByEmail(userDetails.getUsername());
        
        if (!eventService.isEventOwner(id, currentUser.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        eventDto.setOrganizerId(currentUser.getId());
        Event updatedEvent = eventService.updateEvent(id, eventDto);
        return ResponseEntity.ok(updatedEvent);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = userService.findByEmail(userDetails.getUsername());
        
        if (!eventService.isEventOwner(id, currentUser.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        eventService.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }
}
