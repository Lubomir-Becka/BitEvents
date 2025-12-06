package com.bitevents.bitevents.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.time.ZonedDateTime;

@Entity
@Table(name = "users")
@Data
@EqualsAndHashCode(of = "id")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "surname", nullable = false)
    private String surname;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "registration_date", nullable = false)
    private ZonedDateTime registrationDate;

    @Column(name = "profile_picture")
    private String profile_picture;
}
