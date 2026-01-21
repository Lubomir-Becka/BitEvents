package com.bitevents.bitevents.controller;

import com.bitevents.bitevents.dto.ChangePasswordDto;
import com.bitevents.bitevents.dto.UpdateProfileDto;
import com.bitevents.bitevents.dto.UserResponseDto;
import com.bitevents.bitevents.model.User;
import com.bitevents.bitevents.service.FileStorageService;
import com.bitevents.bitevents.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final FileStorageService fileStorageService;

    public UserController(UserService userService, FileStorageService fileStorageService) {
        this.userService = userService;
        this.fileStorageService = fileStorageService;
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

    @PutMapping("/me")
    public ResponseEntity<UserResponseDto> updateProfile(
            @RequestBody @Valid UpdateProfileDto updateDto,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.findByEmail(userDetails.getUsername());
        User updatedUser = userService.updateProfile(user.getId(), updateDto);

        UserResponseDto response = new UserResponseDto(
                updatedUser.getId(),
                updatedUser.getFullName(),
                updatedUser.getEmail(),
                updatedUser.getIsOrganizer(),
                updatedUser.getProfilePicture(),
                updatedUser.getRegistrationDate()
        );

        return ResponseEntity.ok(response);
    }

    @PutMapping("/me/password")
    public ResponseEntity<Void> changePassword(
            @RequestBody @Valid ChangePasswordDto changePasswordDto,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.findByEmail(userDetails.getUsername());
        userService.changePassword(user.getId(), changePasswordDto);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/me/profile-picture")
    public ResponseEntity<Map<String, String>> uploadProfilePicture(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = userService.findByEmail(userDetails.getUsername());

        // Store the file
        String fileName = fileStorageService.storeFile(file, "profiles");

        // Build the file URL
        String fileUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/api/files/")
                .path(fileName)
                .toUriString();

        // Update user profile picture
        UpdateProfileDto updateDto = new UpdateProfileDto();
        updateDto.setFullName(user.getFullName());
        updateDto.setProfilePicture(fileUrl);
        userService.updateProfile(user.getId(), updateDto);

        // Delete old profile picture if exists
        if (user.getProfilePicture() != null && !user.getProfilePicture().isEmpty()) {
            try {
                String oldFileName = user.getProfilePicture().substring(user.getProfilePicture().lastIndexOf("/") + 1);
                fileStorageService.deleteFile("profiles/" + oldFileName);
            } catch (Exception e) {
                // Ignore deletion errors
            }
        }

        Map<String, String> response = new HashMap<>();
        response.put("profilePictureUrl", fileUrl);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/me")
    public ResponseEntity<Void> deleteAccount(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.findByEmail(userDetails.getUsername());
        userService.deleteUser(user.getId());
        return ResponseEntity.noContent().build();
    }
}
