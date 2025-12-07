package com.bitevents.bitevents.controller;

import com.bitevents.bitevents.dto.RegistrationDto;
import com.bitevents.bitevents.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegistrationDto request) {
        try {
            userService.registerNewUser(request);
            return new ResponseEntity<>("Používateľ úspešne zaregistrovaný.", HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>("Chyba pri registrácii: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
