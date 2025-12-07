package com.bitevents.bitevents.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "venues")
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
public class Venue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "address", columnDefinition = "TEXT", nullable = false)
    private String address;

    @Column(name = "city", nullable = false, length = 100)
    private String city;

    // Default hodnota TRUE
    @Column(name = "is_public", nullable = false)
    private Boolean isPublic = true;

    // SQL NUMERIC(10, 8) -> Java BigDecimal
    @Column(name = "latitude", precision = 10, scale = 8)
    private BigDecimal latitude;

    // SQL NUMERIC(11, 8) -> Java BigDecimal
    @Column(name = "longitude", precision = 11, scale = 8)
    private BigDecimal longitude;

    @Column(name = "google_maps_url", columnDefinition = "TEXT")
    private String googleMapsUrl;
}
