package com.bitevents.bitevents.service;

import com.bitevents.bitevents.dto.UpdateProfileDto;
import com.bitevents.bitevents.dto.ChangePasswordDto;
import com.bitevents.bitevents.model.User;
import com.bitevents.bitevents.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
    }

    public User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
    }

    public User updateProfile(Long userId, UpdateProfileDto updateDto) {
        User user = findById(userId);

        if (updateDto.getFullName() != null && !updateDto.getFullName().isBlank()) {
            user.setFullName(updateDto.getFullName());
        }

        if (updateDto.getProfilePicture() != null) {
            user.setProfilePicture(updateDto.getProfilePicture());
        }

        return userRepository.save(user);
    }

    public void changePassword(Long userId, ChangePasswordDto changePasswordDto) {
        User user = findById(userId);

        // Verify current password
        if (!passwordEncoder.matches(changePasswordDto.getCurrentPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Súčasné heslo nie je správne");
        }

        // Update to new password
        user.setPasswordHash(passwordEncoder.encode(changePasswordDto.getNewPassword()));
        userRepository.save(user);
    }

    public void deleteUser(Long userId) {
        User user = findById(userId);
        userRepository.delete(user);
    }
}
