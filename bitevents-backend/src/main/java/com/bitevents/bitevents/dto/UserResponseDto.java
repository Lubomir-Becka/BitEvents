package com.bitevents.bitevents.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserResponseDto {
    private Long id;
    private String fullName;
    private String email;
    private Boolean isOrganizer;
    private String profilePicture;
}
