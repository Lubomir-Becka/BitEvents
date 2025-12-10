package com.bitevents.bitevents.dto;

import lombok.Data;
import java.time.OffsetDateTime;

@Data
public class UserResponseDto {
    private Long id;
    private String fullName;
    private String email;
    private OffsetDateTime registrationDate;
    private String profilePicture;
    private Boolean isOrganizer;
}
