package com.bitevents.bitevents.service;
import com.bitevents.bitevents.dto.VenueDto;
import com.bitevents.bitevents.model.User;
import com.bitevents.bitevents.model.Venue;
import com.bitevents.bitevents.repository.VenueRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@Transactional
public class VenueService {

    private final VenueRepository venueRepository;

    public VenueService(VenueRepository venueRepository) {
        this.venueRepository = venueRepository;
    }

    public Venue createVenue(VenueDto dto, User owner) {
        Venue venue = new Venue();

        venue.setUser(owner);

        venue.setName(dto.getName());
        venue.setAddress(dto.getAddress());
        venue.setCity(dto.getCity());
        venue.setLatitude(BigDecimal.valueOf(dto.getLatitude()));
        venue.setLongitude(BigDecimal.valueOf(dto.getLongitude()));
        venue.setGoogleMapsUrl(dto.getGoogleMapsUrl());

        return venueRepository.save(venue);
    }

    public Venue findById(Long id) {
        return venueRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Miesto konania s ID " + id + " nebolo nájdené."));
    }

    public List<Venue> findAllVenuesByUser(User user) {
        return venueRepository.findAllByUser(user);
    }
    
    public Venue updateVenue(Long id, VenueDto dto) {
        Venue existingVenue = findById(id);

        existingVenue.setName(dto.getName());
        existingVenue.setAddress(dto.getAddress());
        existingVenue.setCity(dto.getCity());
        existingVenue.setLatitude(BigDecimal.valueOf(dto.getLatitude()));
        existingVenue.setLongitude(BigDecimal.valueOf(dto.getLongitude()));
        existingVenue.setGoogleMapsUrl(dto.getGoogleMapsUrl());

        return venueRepository.save(existingVenue);
    }

    public void deleteVenue(Long id) {
        if (!venueRepository.existsById(id)) {
            throw new EntityNotFoundException("Miesto konania s ID " + id + " nebolo nájdené.");
        }
        venueRepository.deleteById(id);
    }
    
    public boolean isVenueOwner(Long venueId, Long userId) {
        Venue venue = findById(venueId);
        return venue.getUser() != null && venue.getUser().getId().equals(userId);
    }
}
