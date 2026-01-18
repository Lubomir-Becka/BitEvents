package com.bitevents.bitevents.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "saved_events")
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
public class SavedEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @Column(name = "saved_date", nullable = false)
    private OffsetDateTime savedDate = OffsetDateTime.now();
}
