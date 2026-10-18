package com.example.weatherallert.controller;
import com.example.weatherallert.dto.AuthRequest;
import com.example.weatherallert.service.AuthenticationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.weatherallert.dto.AuthRequest;
@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthenticationController {
    private final AuthenticationService authService;

    public AuthenticationController(AuthenticationService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody AuthRequest request) {
        if (authService.Registration(request.login(), request.password())) {
            return ResponseEntity.status(HttpStatus.CREATED).body("Zarejestrowano");
        }else{
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Login zajęty");
        }
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody AuthRequest request) {
        if (authService.Login(request.login(), request.password())) {
            return ResponseEntity.ok("Zalogowano");
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Błędny login lub hasło");
    }
}