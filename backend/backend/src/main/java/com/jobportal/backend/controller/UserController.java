package com.jobportal.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.jobportal.backend.entity.User;
import com.jobportal.backend.jwt.JwtUtil;
import com.jobportal.backend.repository.UserRepository;
import java.util.Map;

@RestController
@CrossOrigin("*")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    // REGISTER API
    @PostMapping("/api/users/register")
    public ResponseEntity<?> register(@RequestBody User user) {

        if (userRepository.findByEmail(user.getEmail()) != null) {
            return ResponseEntity.badRequest().body("Email already registered");
        }

        if (user.getRole() == null || user.getRole().isBlank()) {
            user.setRole("USER");
        }

        return ResponseEntity.ok(userRepository.save(user));
    }

    // LOGIN API
    @PostMapping("/api/users/login")
    public ResponseEntity<?> login(@RequestBody User user) {

        User existingUser = userRepository.findByEmail(user.getEmail());

        if(existingUser != null &&
           existingUser.getPassword().equals(user.getPassword())) {

            return ResponseEntity.ok(Map.of(
                    "token", JwtUtil.generateToken(existingUser.getEmail(), existingUser.getRole()),
                    "user", Map.of(
                            "id", existingUser.getId(),
                            "name", existingUser.getName(),
                            "email", existingUser.getEmail(),
                            "role", existingUser.getRole()
                    )
            ));
        }

        return ResponseEntity.badRequest().body("Invalid Email or Password");
    }
}
