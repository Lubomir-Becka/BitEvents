package com.bitevents.bitevents.controller;

import com.bitevents.bitevents.dto.EventDto;
import com.bitevents.bitevents.dto.EventWithRegistrationDto;
import com.bitevents.bitevents.dto.PagedEventsResponseDto;
import com.bitevents.bitevents.model.Event;
import com.bitevents.bitevents.model.EventImage;
import com.bitevents.bitevents.model.User;
import com.bitevents.bitevents.service.EventImageService;
import com.bitevents.bitevents.service.EventRegistrationService;
import com.bitevents.bitevents.service.EventService;
import com.bitevents.bitevents.service.FileStorageService;
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
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;
    private final UserService userService;
    private final EventRegistrationService registrationService;
    private final EventImageService eventImageService;
    private final FileStorageService fileStorageService;

    public EventController(EventService eventService, UserService userService,
                          EventRegistrationService registrationService,
                          EventImageService eventImageService,
                          FileStorageService fileStorageService) {
        this.eventService = eventService;
        this.userService = userService;
        this.registrationService = registrationService;
        this.eventImageService = eventImageService;
        this.fileStorageService = fileStorageService;
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
    public ResponseEntity<EventWithRegistrationDto> getEventById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        Event event = eventService.findById(id);
        long registrationCount = registrationService.getRegistrationCount(id);

        boolean isUserRegistered = false;
        if (userDetails != null) {
            User user = userService.findByEmail(userDetails.getUsername());
            isUserRegistered = registrationService.isUserRegistered(id, user.getId());
        }

        EventWithRegistrationDto dto = EventWithRegistrationDto.fromEvent(event, registrationCount, isUserRegistered);
        return ResponseEntity.ok(dto);
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

    // Event Image Management

    @PostMapping("/{eventId}/images")
    public ResponseEntity<EventImage> uploadEventImage(
            @PathVariable Long eventId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "isPrimary", required = false, defaultValue = "false") Boolean isPrimary,
            @RequestParam(value = "displayOrder", required = false) Integer displayOrder,
            @AuthenticationPrincipal UserDetails userDetails) {

        User currentUser = userService.findByEmail(userDetails.getUsername());

        if (!eventService.isEventOwner(eventId, currentUser.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        // Store the file
        String fileName = fileStorageService.storeFile(file, "events");

        // Build the file URL
        String fileUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/api/files/")
                .path(fileName)
                .toUriString();

        // Save image to database
        EventImage eventImage = eventImageService.addImageToEvent(eventId, fileUrl, isPrimary, displayOrder);

        return ResponseEntity.status(HttpStatus.CREATED).body(eventImage);
    }

    @GetMapping("/{eventId}/images")
    public ResponseEntity<List<EventImage>> getEventImages(@PathVariable Long eventId) {
        List<EventImage> images = eventImageService.getEventImages(eventId);
        return ResponseEntity.ok(images);
    }

    @PutMapping("/{eventId}/images/{imageId}/set-primary")
    public ResponseEntity<Void> setPrimaryImage(
            @PathVariable Long eventId,
            @PathVariable Long imageId,
            @AuthenticationPrincipal UserDetails userDetails) {

        User currentUser = userService.findByEmail(userDetails.getUsername());

        if (!eventService.isEventOwner(eventId, currentUser.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        eventImageService.setPrimaryImage(imageId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{eventId}/images/{imageId}")
    public ResponseEntity<Void> deleteEventImage(
            @PathVariable Long eventId,
            @PathVariable Long imageId,
            @AuthenticationPrincipal UserDetails userDetails) {

        User currentUser = userService.findByEmail(userDetails.getUsername());

        if (!eventService.isEventOwner(eventId, currentUser.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        eventImageService.deleteImage(imageId);
        return ResponseEntity.noContent().build();
    }
}
