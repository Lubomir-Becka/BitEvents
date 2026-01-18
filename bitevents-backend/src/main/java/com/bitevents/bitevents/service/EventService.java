package com.bitevents.bitevents.service;

import com.bitevents.bitevents.dto.EventDto;
import com.bitevents.bitevents.model.Event;
import com.bitevents.bitevents.model.User;
import com.bitevents.bitevents.model.Venue;
import com.bitevents.bitevents.repository.EventRepository;
import com.bitevents.bitevents.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

@Service
@Transactional
public class EventService {

    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final VenueService venueService; // Stále používame Service na nájdenie Venue

    public EventService(EventRepository eventRepository, UserRepository userRepository, VenueService venueService) {
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
        this.venueService = venueService;
    }

    public Event createEvent(EventDto dto) {
        validateTimeRange(dto.getStartDateTime(), dto.getEndDateTime());

        User organizer = userRepository.findById(dto.getOrganizerId())
                .orElseThrow(() -> new EntityNotFoundException("Organizátor s ID " + dto.getOrganizerId() + " nebol nájdený."));

        Venue venue = venueService.findById(dto.getVenueId());

        Event event = getEvent(dto, organizer, venue);
        event.setCreationDateTime(OffsetDateTime.now());

        return eventRepository.save(event);
    }

    private static Event getEvent(EventDto dto, User organizer, Venue venue) {
        Event event = new Event();
        event.setOrganizer(organizer);
        event.setVenue(venue);

        event.setName(dto.getName());
        event.setDescription(dto.getDescription());
        event.setType(dto.getType());
        event.setStartDateTime(dto.getStartDateTime());
        event.setEndDateTime(dto.getEndDateTime());
        event.setCapacity(dto.getCapacity());
        event.setPrice(dto.getPrice() != null ? dto.getPrice() : BigDecimal.ZERO);
        event.setImageUrl(dto.getImageUrl());
        event.setStatus(dto.getStatus() != null ? dto.getStatus() : "Upcoming");
        return event;
    }

    public List<Event> findAllEvents() {
        return eventRepository.findAll();
    }

    public Page<Event> findAllEvents(String search, List<String> cities, String type, Pageable pageable) {
        return eventRepository.findByFilters(search, cities, type, pageable);
    }

    public Event findById(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Udalosť s ID " + id + " nebola nájdená."));
    }

    public Event updateEvent(Long id, EventDto dto) {
        Event existingEvent = findById(id);

        validateTimeRange(dto.getStartDateTime(), dto.getEndDateTime());

        if (!existingEvent.getOrganizer().getId().equals(dto.getOrganizerId())) {
            User newOrganizer = userRepository.findById(dto.getOrganizerId())
                    .orElseThrow(() -> new EntityNotFoundException("Nový organizátor nebol nájdený."));
            existingEvent.setOrganizer(newOrganizer);
        }

        if (!existingEvent.getVenue().getId().equals(dto.getVenueId())) {
            Venue newVenue = venueService.findById(dto.getVenueId());
            existingEvent.setVenue(newVenue);
        }

        existingEvent.setName(dto.getName());
        existingEvent.setDescription(dto.getDescription());
        existingEvent.setType(dto.getType());
        existingEvent.setStartDateTime(dto.getStartDateTime());
        existingEvent.setEndDateTime(dto.getEndDateTime());
        existingEvent.setCapacity(dto.getCapacity());
        existingEvent.setPrice(dto.getPrice() != null ? dto.getPrice() : BigDecimal.ZERO);
        existingEvent.setImageUrl(dto.getImageUrl());

        if (dto.getStatus() != null) {
            existingEvent.setStatus(dto.getStatus());
        }

        return eventRepository.save(existingEvent);
    }

    public void deleteEvent(Long id) {
        if (!eventRepository.existsById(id)) {
            throw new EntityNotFoundException("Udalosť s ID " + id + " nebola nájdená.");
        }
        eventRepository.deleteById(id);
    }

    public boolean isEventOwner(Long eventId, Long userId) {
        Event event = findById(eventId);
        return event.getOrganizer().getId().equals(userId);
    }

    private void validateTimeRange(OffsetDateTime start, OffsetDateTime end) {
        if (start == null) {
            throw new IllegalArgumentException("Dátum začiatku je povinný.");
        }
        if (end != null && start.isAfter(end)) {
            throw new IllegalArgumentException("Dátum konca udalosti nemôže byť pred dátumom začiatku.");
        }
    }
}