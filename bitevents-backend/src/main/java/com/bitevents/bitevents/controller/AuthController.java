package com.bitevents.bitevents.controller;

import com.bitevents.bitevents.dto.RegistrationDto;
import com.bitevents.bitevents.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegistrationDto request) {
        try {
            authService.register(request);
            return new ResponseEntity<>("Používateľ úspešne zaregistrovaný.", HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>("Chyba pri registrácii: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
