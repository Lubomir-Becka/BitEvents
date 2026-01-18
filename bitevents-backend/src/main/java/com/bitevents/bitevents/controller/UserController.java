package com.bitevents.bitevents.controller;

import com.bitevents.bitevents.dto.UserResponseDto;
import com.bitevents.bitevents.model.User;
import com.bitevents.bitevents.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponseDto> getCurrentUser(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.findByEmail(userDetails.getUsername());

        UserResponseDto response = new UserResponseDto(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getIsOrganizer(),
                user.getProfilePicture(),
                user.getRegistrationDate()
        );

        return ResponseEntity.ok(response);
    }
}
