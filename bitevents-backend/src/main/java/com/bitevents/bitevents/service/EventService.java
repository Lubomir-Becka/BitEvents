package com.bitevents.bitevents.service;

import com.bitevents.bitevents.dto.EventDto;
import com.bitevents.bitevents.model.Event;
import com.bitevents.bitevents.repository.EventRepository;
import org.springframework.stereotype.Service;
import jakarta.persistence.EntityNotFoundException;
import java.util.List;

@Service
public class EventService {

    private final EventRepository eventRepository;

    public EventService(EventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }

    public Event createEvent(EventDto dto) {
        Event event = new Event();
        event.setOrganizerId(dto.getOrganizerId());
        event.setVenueId(dto.getVenueId());
        event.setName(dto.getName());
        event.setDescription(dto.getDescription());
        event.setType(dto.getType());
        event.setStartDateTime(dto.getStartDateTime());
        event.setEndDateTime(dto.getEndDateTime());
        event.setCapacity(dto.getCapacity());
        event.setPrice(dto.getPrice());
        event.setImageUrl(dto.getImageUrl());
        return eventRepository.save(event);
    }

    public List<Event> findAllEvents() {
        return eventRepository.findAll();
    }

    public Event findById(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Udalosť s ID " + id + " nebola nájdená."));
    }

    public Event updateEvent(Long id, EventDto dto) {
        Event existingEvent = findById(id);

        existingEvent.setOrganizerId(dto.getOrganizerId());
        existingEvent.setVenueId(dto.getVenueId());
        existingEvent.setName(dto.getName());
        existingEvent.setDescription(dto.getDescription());
        existingEvent.setType(dto.getType());
        existingEvent.setStartDateTime(dto.getStartDateTime());
        existingEvent.setEndDateTime(dto.getEndDateTime());
        existingEvent.setCapacity(dto.getCapacity());
        existingEvent.setPrice(dto.getPrice());
        existingEvent.setImageUrl(dto.getImageUrl());

        return eventRepository.save(existingEvent);
    }

    public void deleteEvent(Long id) {
        if (!eventRepository.existsById(id)) {
            throw new EntityNotFoundException("Udalosť s ID " + id + " nebola nájdená.");
        }
        eventRepository.deleteById(id);
    }
}