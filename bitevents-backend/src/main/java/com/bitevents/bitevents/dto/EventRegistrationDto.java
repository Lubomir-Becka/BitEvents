package com.bitevents.bitevents.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventRegistrationDto {
    private Long id;
    private Long eventId;
    private Long userId;
    private OffsetDateTime registrationDate;
    private String status;
    private String ticketCode;
    private String notes;
}
