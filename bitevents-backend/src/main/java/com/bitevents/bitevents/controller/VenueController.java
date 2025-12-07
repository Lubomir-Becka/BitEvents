package com.bitevents.bitevents.controller;

import com.bitevents.bitevents.dto.VenueDto;
import com.bitevents.bitevents.model.User;
import com.bitevents.bitevents.model.Venue;
import com.bitevents.bitevents.service.UserService;
import com.bitevents.bitevents.service.VenueService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/venues")
public class VenueController {

    private final VenueService venueService;
    private final UserService userService;

    public VenueController(VenueService venueService, UserService userService) {
        this.venueService = venueService;
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<Venue> createVenue(
            @Valid @RequestBody VenueDto venueDto,
            @AuthenticationPrincipal UserDetails userDetails) {
        User owner = userService.findByEmail(userDetails.getUsername());
        Venue newVenue = venueService.createVenue(venueDto, owner);
        return new ResponseEntity<>(newVenue, HttpStatus.CREATED); // 201 Created
    }

    @GetMapping
    public ResponseEntity<List<Venue>> getAllVenuesForUser(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.findByEmail(userDetails.getUsername());
        List<Venue> venues = venueService.findAllVenuesByUser(user);
        return ResponseEntity.ok(venues); // 200 OK
    }

    @GetMapping("/{id}")
    public ResponseEntity<Venue> getVenueById(@PathVariable Long id) {
        Venue venue = venueService.findById(id);
        return ResponseEntity.ok(venue); // 200 OK
    }

    @PutMapping("/{id}")
    public ResponseEntity<Venue> updateVenue(
            @PathVariable Long id,
            @Valid @RequestBody VenueDto venueDto) {
        Venue updatedVenue = venueService.updateVenue(id, venueDto);
        return ResponseEntity.ok(updatedVenue); // 200 OK
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVenue(@PathVariable Long id) {
        venueService.deleteVenue(id);
        return ResponseEntity.noContent().build(); // 204 No Content
    }
}
