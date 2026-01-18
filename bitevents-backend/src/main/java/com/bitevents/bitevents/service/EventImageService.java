package com.bitevents.bitevents.service;

import com.bitevents.bitevents.model.Event;
import com.bitevents.bitevents.model.EventImage;
import com.bitevents.bitevents.repository.EventImageRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class EventImageService {

    private final EventImageRepository eventImageRepository;
    private final EventService eventService;

    public EventImageService(EventImageRepository eventImageRepository, EventService eventService) {
        this.eventImageRepository = eventImageRepository;
        this.eventService = eventService;
    }

    public EventImage addImageToEvent(Long eventId, String imageUrl, Boolean isPrimary, Integer displayOrder) {
        Event event = eventService.findById(eventId);

        // If this is primary, unset other primary images
        if (isPrimary != null && isPrimary) {
            eventImageRepository.findByEventAndIsPrimaryTrue(event)
                    .ifPresent(existingPrimary -> {
                        existingPrimary.setIsPrimary(false);
                        eventImageRepository.save(existingPrimary);
                    });
        }

        EventImage eventImage = new EventImage();
        eventImage.setEvent(event);
        eventImage.setImageUrl(imageUrl);
        eventImage.setIsPrimary(isPrimary != null ? isPrimary : false);
        eventImage.setDisplayOrder(displayOrder);

        return eventImageRepository.save(eventImage);
    }

    public List<EventImage> getEventImages(Long eventId) {
        Event event = eventService.findById(eventId);
        return eventImageRepository.findByEventOrderByDisplayOrderAsc(event);
    }

    public void setPrimaryImage(Long imageId) {
        EventImage image = eventImageRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("Image not found"));

        // Unset other primary images for this event
        eventImageRepository.findByEventAndIsPrimaryTrue(image.getEvent())
                .ifPresent(existingPrimary -> {
                    existingPrimary.setIsPrimary(false);
                    eventImageRepository.save(existingPrimary);
                });

        image.setIsPrimary(true);
        eventImageRepository.save(image);
    }

    public void deleteImage(Long imageId) {
        eventImageRepository.deleteById(imageId);
    }

    public EventImage getPrimaryImage(Long eventId) {
        Event event = eventService.findById(eventId);
        return eventImageRepository.findByEventAndIsPrimaryTrue(event).orElse(null);
    }
}
