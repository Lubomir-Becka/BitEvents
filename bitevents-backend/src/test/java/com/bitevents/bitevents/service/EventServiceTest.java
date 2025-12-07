package com.bitevents.bitevents.service;

import com.bitevents.bitevents.dto.EventDto;
import com.bitevents.bitevents.model.Event;
import com.bitevents.bitevents.model.User;
import com.bitevents.bitevents.model.Venue;
import com.bitevents.bitevents.repository.EventRepository;
import com.bitevents.bitevents.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EventServiceTest {

    @Mock
    private EventRepository eventRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private VenueService venueService;

    @InjectMocks
    private EventService eventService;

    private User organizer;
    private Venue venue;
    private EventDto eventDto;
    private Event event;

    @BeforeEach
    void setUp() {
        organizer = new User();
        organizer.setId(1L);
        organizer.setFullName("Test Organizer");
        organizer.setEmail("organizer@example.com");

        venue = new Venue();
        venue.setId(1L);
        venue.setName("Test Venue");

        eventDto = new EventDto();
        eventDto.setOrganizerId(1L);
        eventDto.setVenueId(1L);
        eventDto.setName("Test Event");
        eventDto.setDescription("Test Description");
        eventDto.setType("Conference");
        eventDto.setCreationDateTime(OffsetDateTime.now());
        eventDto.setStartDateTime(OffsetDateTime.now().plusDays(1));
        eventDto.setEndDateTime(OffsetDateTime.now().plusDays(2));
        eventDto.setCapacity(100);
        eventDto.setPrice(BigDecimal.valueOf(50.00));
        eventDto.setImageUrl("https://example.com/image.jpg");
        eventDto.setStatus("Upcoming");

        event = new Event();
        event.setId(1L);
        event.setOrganizer(organizer);
        event.setVenue(venue);
        event.setName("Test Event");
        event.setDescription("Test Description");
        event.setType("Conference");
        event.setStartDateTime(OffsetDateTime.now().plusDays(1));
        event.setEndDateTime(OffsetDateTime.now().plusDays(2));
        event.setCapacity(100);
        event.setPrice(BigDecimal.valueOf(50.00));
    }

    @Test
    void createEvent_ShouldCreateAndReturnEvent() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.of(organizer));
        when(venueService.findById(1L)).thenReturn(venue);
        when(eventRepository.save(any(Event.class))).thenReturn(event);

        // Act
        Event result = eventService.createEvent(eventDto);

        // Assert
        assertNotNull(result);
        assertEquals("Test Event", result.getName());
        assertEquals("Conference", result.getType());
        verify(userRepository).findById(1L);
        verify(venueService).findById(1L);
        verify(eventRepository).save(any(Event.class));
    }

    @Test
    void createEvent_ShouldThrowException_WhenOrganizerNotFound() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        EntityNotFoundException exception = assertThrows(EntityNotFoundException.class,
                () -> eventService.createEvent(eventDto));
        assertTrue(exception.getMessage().contains("Organizátor"));
        verify(userRepository).findById(1L);
        verify(eventRepository, never()).save(any(Event.class));
    }

    @Test
    void createEvent_ShouldThrowException_WhenStartDateTimeIsNull() {
        // Arrange
        eventDto.setStartDateTime(null);

        // Act & Assert
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> eventService.createEvent(eventDto));
        assertTrue(exception.getMessage().contains("Dátum začiatku"));
    }

    @Test
    void createEvent_ShouldThrowException_WhenEndDateTimeBeforeStartDateTime() {
        // Arrange
        eventDto.setStartDateTime(OffsetDateTime.now().plusDays(2));
        eventDto.setEndDateTime(OffsetDateTime.now().plusDays(1));

        // Act & Assert
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> eventService.createEvent(eventDto));
        assertTrue(exception.getMessage().contains("pred dátumom začiatku"));
    }

    @Test
    void findAllEvents_ShouldReturnListOfEvents() {
        // Arrange
        Event event2 = new Event();
        event2.setId(2L);
        event2.setName("Second Event");
        List<Event> events = Arrays.asList(event, event2);
        when(eventRepository.findAll()).thenReturn(events);

        // Act
        List<Event> result = eventService.findAllEvents();

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        verify(eventRepository).findAll();
    }

    @Test
    void findById_ShouldReturnEvent_WhenEventExists() {
        // Arrange
        when(eventRepository.findById(1L)).thenReturn(Optional.of(event));

        // Act
        Event result = eventService.findById(1L);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("Test Event", result.getName());
        verify(eventRepository).findById(1L);
    }

    @Test
    void findById_ShouldThrowException_WhenEventNotFound() {
        // Arrange
        when(eventRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        EntityNotFoundException exception = assertThrows(EntityNotFoundException.class,
                () -> eventService.findById(999L));
        assertTrue(exception.getMessage().contains("999"));
        verify(eventRepository).findById(999L);
    }

    @Test
    void updateEvent_ShouldUpdateAndReturnEvent() {
        // Arrange
        EventDto updateDto = new EventDto();
        updateDto.setOrganizerId(1L);
        updateDto.setVenueId(1L);
        updateDto.setName("Updated Event");
        updateDto.setDescription("Updated Description");
        updateDto.setType("Workshop");
        updateDto.setStartDateTime(OffsetDateTime.now().plusDays(3));
        updateDto.setEndDateTime(OffsetDateTime.now().plusDays(4));
        updateDto.setCapacity(200);
        updateDto.setPrice(BigDecimal.valueOf(100.00));

        when(eventRepository.findById(1L)).thenReturn(Optional.of(event));
        when(eventRepository.save(any(Event.class))).thenReturn(event);

        // Act
        Event result = eventService.updateEvent(1L, updateDto);

        // Assert
        assertNotNull(result);
        verify(eventRepository).findById(1L);
        verify(eventRepository).save(any(Event.class));
    }

    @Test
    void updateEvent_ShouldChangeOrganizer_WhenOrganizerIdIsDifferent() {
        // Arrange
        User newOrganizer = new User();
        newOrganizer.setId(2L);
        
        EventDto updateDto = new EventDto();
        updateDto.setOrganizerId(2L);
        updateDto.setVenueId(1L);
        updateDto.setName("Test Event");
        updateDto.setDescription("Test Description");
        updateDto.setType("Conference");
        updateDto.setStartDateTime(OffsetDateTime.now().plusDays(1));
        updateDto.setEndDateTime(OffsetDateTime.now().plusDays(2));
        updateDto.setCapacity(100);

        when(eventRepository.findById(1L)).thenReturn(Optional.of(event));
        when(userRepository.findById(2L)).thenReturn(Optional.of(newOrganizer));
        when(eventRepository.save(any(Event.class))).thenReturn(event);

        // Act
        Event result = eventService.updateEvent(1L, updateDto);

        // Assert
        assertNotNull(result);
        verify(userRepository).findById(2L);
    }

    @Test
    void deleteEvent_ShouldDeleteEvent_WhenEventExists() {
        // Arrange
        when(eventRepository.existsById(1L)).thenReturn(true);
        doNothing().when(eventRepository).deleteById(1L);

        // Act
        eventService.deleteEvent(1L);

        // Assert
        verify(eventRepository).existsById(1L);
        verify(eventRepository).deleteById(1L);
    }

    @Test
    void deleteEvent_ShouldThrowException_WhenEventNotFound() {
        // Arrange
        when(eventRepository.existsById(999L)).thenReturn(false);

        // Act & Assert
        EntityNotFoundException exception = assertThrows(EntityNotFoundException.class,
                () -> eventService.deleteEvent(999L));
        assertTrue(exception.getMessage().contains("999"));
        verify(eventRepository).existsById(999L);
        verify(eventRepository, never()).deleteById(anyLong());
    }
}

