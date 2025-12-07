package com.bitevents.bitevents.service;

import com.bitevents.bitevents.dto.VenueDto;
import com.bitevents.bitevents.model.User;
import com.bitevents.bitevents.model.Venue;
import com.bitevents.bitevents.repository.VenueRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VenueServiceTest {

    @Mock
    private VenueRepository venueRepository;

    @InjectMocks
    private VenueService venueService;

    private User owner;
    private VenueDto venueDto;
    private Venue venue;

    @BeforeEach
    void setUp() {
        owner = new User();
        owner.setId(1L);
        owner.setFullName("Test Owner");
        owner.setEmail("owner@example.com");

        venueDto = new VenueDto();
        venueDto.setName("Test Venue");
        venueDto.setAddress("123 Test Street");
        venueDto.setCity("Test City");
        venueDto.setLatitude(48.1486);
        venueDto.setLongitude(17.1077);
        venueDto.setGoogleMapsUrl("https://maps.google.com/test");

        venue = new Venue();
        venue.setId(1L);
        venue.setUser(owner);
        venue.setName("Test Venue");
        venue.setAddress("123 Test Street");
        venue.setCity("Test City");
        venue.setLatitude(BigDecimal.valueOf(48.1486));
        venue.setLongitude(BigDecimal.valueOf(17.1077));
        venue.setGoogleMapsUrl("https://maps.google.com/test");
    }

    @Test
    void createVenue_ShouldCreateAndReturnVenue() {
        // Arrange
        when(venueRepository.save(any(Venue.class))).thenReturn(venue);

        // Act
        Venue result = venueService.createVenue(venueDto, owner);

        // Assert
        assertNotNull(result);
        assertEquals("Test Venue", result.getName());
        assertEquals("Test City", result.getCity());
        verify(venueRepository).save(any(Venue.class));
    }

    @Test
    void findById_ShouldReturnVenue_WhenVenueExists() {
        // Arrange
        when(venueRepository.findById(1L)).thenReturn(Optional.of(venue));

        // Act
        Venue result = venueService.findById(1L);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("Test Venue", result.getName());
        verify(venueRepository).findById(1L);
    }

    @Test
    void findById_ShouldThrowException_WhenVenueNotFound() {
        // Arrange
        when(venueRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        EntityNotFoundException exception = assertThrows(EntityNotFoundException.class,
                () -> venueService.findById(999L));
        assertTrue(exception.getMessage().contains("999"));
        verify(venueRepository).findById(999L);
    }

    @Test
    void findAllVenuesByUser_ShouldReturnListOfVenues() {
        // Arrange
        Venue venue2 = new Venue();
        venue2.setId(2L);
        venue2.setName("Second Venue");
        List<Venue> venues = Arrays.asList(venue, venue2);
        when(venueRepository.findAllByUser(owner)).thenReturn(venues);

        // Act
        List<Venue> result = venueService.findAllVenuesByUser(owner);

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        verify(venueRepository).findAllByUser(owner);
    }

    @Test
    void updateVenue_ShouldUpdateAndReturnVenue() {
        // Arrange
        VenueDto updateDto = new VenueDto();
        updateDto.setName("Updated Venue");
        updateDto.setAddress("456 New Street");
        updateDto.setCity("New City");
        updateDto.setLatitude(48.2);
        updateDto.setLongitude(17.2);
        updateDto.setGoogleMapsUrl("https://maps.google.com/updated");

        when(venueRepository.findById(1L)).thenReturn(Optional.of(venue));
        when(venueRepository.save(any(Venue.class))).thenReturn(venue);

        // Act
        Venue result = venueService.updateVenue(1L, updateDto);

        // Assert
        assertNotNull(result);
        verify(venueRepository).findById(1L);
        verify(venueRepository).save(any(Venue.class));
    }

    @Test
    void deleteVenue_ShouldDeleteVenue_WhenVenueExists() {
        // Arrange
        when(venueRepository.existsById(1L)).thenReturn(true);
        doNothing().when(venueRepository).deleteById(1L);

        // Act
        venueService.deleteVenue(1L);

        // Assert
        verify(venueRepository).existsById(1L);
        verify(venueRepository).deleteById(1L);
    }

    @Test
    void deleteVenue_ShouldThrowException_WhenVenueNotFound() {
        // Arrange
        when(venueRepository.existsById(999L)).thenReturn(false);

        // Act & Assert
        EntityNotFoundException exception = assertThrows(EntityNotFoundException.class,
                () -> venueService.deleteVenue(999L));
        assertTrue(exception.getMessage().contains("999"));
        verify(venueRepository).existsById(999L);
        verify(venueRepository, never()).deleteById(anyLong());
    }
}

