package com.bitevents.bitevents.service;

import com.bitevents.bitevents.dto.RegistrationRequest;
import com.bitevents.bitevents.model.User;
import com.bitevents.bitevents.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.ZonedDateTime;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User registerNewUser(RegistrationRequest request) {

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Používateľ s týmto e-mailom už existuje.");
        }

        User user = new User();
        user.setName(request.getName());
        user.setSurname(request.getSurname());
        user.setEmail(request.getEmail());
        user.setRegistrationDate(ZonedDateTime.now());


        String encodedPassword = passwordEncoder.encode(request.getPassword());
        user.setPasswordHash(encodedPassword);

        return userRepository.save(user);
    }
    
    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Používateľ nebol nájdený."));
    }
}
