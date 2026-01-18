package com.bitevents.bitevents.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "event_registrations")
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
public class EventRegistration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "registration_date", nullable = false)
    private OffsetDateTime registrationDate = OffsetDateTime.now();

    @Column(name = "status", nullable = false, length = 50)
    private String status = "Confirmed";

    @Column(name = "ticket_code", length = 100, unique = true)
    private String ticketCode;

    @Column(name = "notes")
    private String notes;
}
