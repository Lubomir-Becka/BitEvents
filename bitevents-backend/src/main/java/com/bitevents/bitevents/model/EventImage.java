package com.bitevents.bitevents.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "event_images")
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
public class EventImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @Column(name = "image_url", nullable = false)
    private String imageUrl;

    @Column(name = "is_primary", nullable = false)
    private Boolean isPrimary = false;

    @Column(name = "display_order")
    private Integer displayOrder;
}
