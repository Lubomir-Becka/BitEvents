package com.bitevents.bitevents.service;

import com.bitevents.bitevents.dto.VenueDto;
import com.bitevents.bitevents.model.Venue;
import com.bitevents.bitevents.repository.VenueRepository;
import org.springframework.stereotype.Service;
import jakarta.persistence.EntityNotFoundException;
import java.util.List;

@Service
public class VenueService {

    private final VenueRepository venueRepository;

    public VenueService(VenueRepository venueRepository) {
        this.venueRepository = venueRepository;
    }

    public Venue createVenue(VenueDto dto) {
        Venue venue = new Venue();

        venue.setName(dto.getName());
        venue.setAddress(dto.getAddress());
        venue.setOwnerId(dto.getOwnerId());
        venue.setLatitude(dto.getLatitude());
        venue.setLongitude(dto.getLongitude());

        return venueRepository.save(venue);
    }

    public List<Venue> findAllVenues() {
        return venueRepository.findAll();
    }

    public Venue findById(Long id) {
        return venueRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Miesto konania s ID " + id + " nebolo nájdené."));
    }

    // U: UPDATE
    public Venue updateVenue(Long id, VenueDto dto) {
        Venue existingVenue = findById(id);

        // Aktualizácia polí
        existingVenue.setName(dto.getName());
        existingVenue.setAddress(dto.getAddress());
        existingVenue.setOwnerId(dto.getOwnerId());
        existingVenue.setLatitude(dto.getLatitude());
        existingVenue.setLongitude(dto.getLongitude());

        return venueRepository.save(existingVenue);
    }

    // D: DELETE
    public void deleteVenue(Long id) {
        if (!venueRepository.existsById(id)) {
            throw new EntityNotFoundException("Miesto konania s ID " + id + " nebolo nájdené.");
        }
        venueRepository.deleteById(id);
    }
}
