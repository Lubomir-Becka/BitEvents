package com.bitevents.bitevents.service;

import com.bitevents.bitevents.config.JwtTokenProvider;
import com.bitevents.bitevents.dto.AuthResponseDto;
import com.bitevents.bitevents.dto.LoginDto;
import com.bitevents.bitevents.dto.RegistrationDto;
import com.bitevents.bitevents.dto.UserResponseDto;
import com.bitevents.bitevents.model.User;
import com.bitevents.bitevents.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    public AuthResponseDto register(RegistrationDto request) {
        log.info("Registration attempt for email={}", request.getEmail());
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            log.warn("Registration failed - email already exists: {}", request.getEmail());
            throw new IllegalArgumentException("Email už existuje.");
        }

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setRegistrationDate(OffsetDateTime.now());
        user.setIsOrganizer(request.isOrganizer());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));

        User savedUser = userRepository.save(user);
        String token = jwtTokenProvider.generateToken(savedUser.getEmail());
        log.info("User registered: id={}, email={}", savedUser.getId(), savedUser.getEmail());

        return new AuthResponseDto(token, mapToUserResponseDto(savedUser));
    }

    public AuthResponseDto login(LoginDto request) {
        log.info("Login attempt for email={}", request.getEmail());
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new EntityNotFoundException("Nesprávne meno alebo heslo."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            log.warn("Failed login for email={}", request.getEmail());
            throw new IllegalArgumentException("Nesprávne meno alebo heslo.");
        }

        String token = jwtTokenProvider.generateToken(user.getEmail());
        log.info("User logged in: id={}, email={}", user.getId(), user.getEmail());
        return new AuthResponseDto(token, mapToUserResponseDto(user));
    }

    private UserResponseDto mapToUserResponseDto(User user) {
        UserResponseDto dto = new UserResponseDto();
        dto.setId(user.getId());
        dto.setFullName(user.getFullName());
        dto.setEmail(user.getEmail());
        dto.setProfilePicture(user.getProfilePicture());
        dto.setIsOrganizer(user.getIsOrganizer());
        return dto;
    }
}