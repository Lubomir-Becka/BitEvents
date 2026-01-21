package com.bitevents.bitevents.service;

import com.bitevents.bitevents.config.JwtTokenProvider;
import com.bitevents.bitevents.dto.AuthResponseDto;
import com.bitevents.bitevents.dto.LoginDto;
import com.bitevents.bitevents.dto.RegistrationDto;
import com.bitevents.bitevents.model.User;
import com.bitevents.bitevents.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;
    
    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @InjectMocks
    private AuthService authService;

    private RegistrationDto registrationDto;
    private LoginDto loginDto;
    private User user;

    @BeforeEach
    void setUp() {
        registrationDto = new RegistrationDto();
        registrationDto.setFullName("Test User");
        registrationDto.setEmail("test@example.com");
        registrationDto.setPassword("password123");
        registrationDto.setIsOrganizer(true);

        loginDto = new LoginDto();
        loginDto.setEmail("test@example.com");
        loginDto.setPassword("password123");

        user = new User();
        user.setId(1L);
        user.setFullName("Test User");
        user.setEmail("test@example.com");
        user.setPasswordHash("encodedPassword");
        user.setIsOrganizer(true);
    }

    @Test
    void register_ShouldCreateNewUser_WhenEmailDoesNotExist() {
        // Arrange
        when(userRepository.findByEmail(registrationDto.getEmail())).thenReturn(Optional.empty());
        when(passwordEncoder.encode(registrationDto.getPassword())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(user);
        when(jwtTokenProvider.generateToken(user.getEmail())).thenReturn("testToken");

        // Act
        AuthResponseDto result = authService.register(registrationDto);

        // Assert
        assertNotNull(result);
        assertNotNull(result.getUser());
        assertEquals("Test User", result.getUser().getFullName());
        assertEquals("test@example.com", result.getUser().getEmail());
        assertEquals("testToken", result.getToken());
        verify(userRepository).findByEmail(registrationDto.getEmail());
        verify(passwordEncoder).encode(registrationDto.getPassword());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void register_ShouldThrowException_WhenEmailAlreadyExists() {
        // Arrange
        when(userRepository.findByEmail(registrationDto.getEmail())).thenReturn(Optional.of(user));

        // Act & Assert
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> authService.register(registrationDto));
        assertEquals("Email už existuje.", exception.getMessage());
        verify(userRepository).findByEmail(registrationDto.getEmail());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void login_ShouldReturnAuthResponse_WhenCredentialsAreCorrect() {
        // Arrange
        when(userRepository.findByEmail(loginDto.getEmail())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(loginDto.getPassword(), user.getPasswordHash())).thenReturn(true);
        when(jwtTokenProvider.generateToken(user.getEmail())).thenReturn("testToken");

        // Act
        AuthResponseDto result = authService.login(loginDto);

        // Assert
        assertNotNull(result);
        assertNotNull(result.getUser());
        assertEquals(user.getEmail(), result.getUser().getEmail());
        assertEquals("testToken", result.getToken());
        verify(userRepository).findByEmail(loginDto.getEmail());
        verify(passwordEncoder).matches(loginDto.getPassword(), user.getPasswordHash());
    }

    @Test
    void login_ShouldThrowException_WhenUserNotFound() {
        // Arrange
        when(userRepository.findByEmail(loginDto.getEmail())).thenReturn(Optional.empty());

        // Act & Assert
        EntityNotFoundException exception = assertThrows(EntityNotFoundException.class,
                () -> authService.login(loginDto));
        assertEquals("Nesprávne meno alebo heslo.", exception.getMessage());
        verify(userRepository).findByEmail(loginDto.getEmail());
        verify(passwordEncoder, never()).matches(anyString(), anyString());
    }

    @Test
    void login_ShouldThrowException_WhenPasswordIsIncorrect() {
        // Arrange
        when(userRepository.findByEmail(loginDto.getEmail())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(loginDto.getPassword(), user.getPasswordHash())).thenReturn(false);

        // Act & Assert
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> authService.login(loginDto));
        assertEquals("Nesprávne meno alebo heslo.", exception.getMessage());
        verify(userRepository).findByEmail(loginDto.getEmail());
        verify(passwordEncoder).matches(loginDto.getPassword(), user.getPasswordHash());
    }
}

