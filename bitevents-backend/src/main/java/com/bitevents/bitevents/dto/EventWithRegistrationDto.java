package com.bitevents.bitevents.dto;

import com.bitevents.bitevents.model.Event;
import lombok.Data;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data
public class EventWithRegistrationDto {
    private Long id;
    private String name;
    private String description;
    private String type;
    private OffsetDateTime creationDateTime;
    private OffsetDateTime startDateTime;
    private OffsetDateTime endDateTime;
    private Integer capacity;
    private BigDecimal price;
    private String imageUrl;
    private String status;
    private OrganizerDto organizer;
    private VenueInfoDto venue;

    // Registration info
    private long registrationCount;
    private Integer availableSpots;
    private boolean isUserRegistered;

    @Data
    public static class OrganizerDto {
        private Long id;
        private String fullName;
        private String email;
        private Boolean isOrganizer;
    }

    @Data
    public static class VenueInfoDto {
        private Long id;
        private String name;
        private String address;
        private String city;
        private String googleMapsUrl;
    }

    public static EventWithRegistrationDto fromEvent(Event event, long registrationCount, boolean isUserRegistered) {
        EventWithRegistrationDto dto = new EventWithRegistrationDto();
        dto.setId(event.getId());
        dto.setName(event.getName());
        dto.setDescription(event.getDescription());
        dto.setType(event.getType());
        dto.setCreationDateTime(event.getCreationDateTime());
        dto.setStartDateTime(event.getStartDateTime());
        dto.setEndDateTime(event.getEndDateTime());
        dto.setCapacity(event.getCapacity());
        dto.setPrice(event.getPrice());
        dto.setImageUrl(event.getImageUrl());
        dto.setStatus(event.getStatus());
        dto.setRegistrationCount(registrationCount);
        dto.setUserRegistered(isUserRegistered);

        if (event.getCapacity() != null) {
            dto.setAvailableSpots((int) (event.getCapacity() - registrationCount));
        }

        // Organizer
        OrganizerDto organizer = new OrganizerDto();
        organizer.setId(event.getOrganizer().getId());
        organizer.setFullName(event.getOrganizer().getFullName());
        organizer.setEmail(event.getOrganizer().getEmail());
        organizer.setIsOrganizer(event.getOrganizer().getIsOrganizer());
        dto.setOrganizer(organizer);

        // Venue
        VenueInfoDto venue = new VenueInfoDto();
        venue.setId(event.getVenue().getId());
        venue.setName(event.getVenue().getName());
        venue.setAddress(event.getVenue().getAddress());
        venue.setCity(event.getVenue().getCity());
        venue.setGoogleMapsUrl(event.getVenue().getGoogleMapsUrl());
        dto.setVenue(venue);

        return dto;
    }
}
