package com.adrian.inventory.service;

import com.adrian.inventory.dto.AuthResponse;
import com.adrian.inventory.dto.LoginRequest;
import com.adrian.inventory.dto.RegisterRequest;
import com.adrian.inventory.dto.UserResponse;
import com.adrian.inventory.exception.ApiException;
import com.adrian.inventory.model.User;
import com.adrian.inventory.model.UserRole;
import com.adrian.inventory.repository.UserRepository;
import com.adrian.inventory.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final BusinessSettingsService businessSettingsService;
    private final MembershipService membershipService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            AuthenticationManager authenticationManager,
            BusinessSettingsService businessSettingsService,
            MembershipService membershipService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.businessSettingsService = businessSettingsService;
        this.membershipService = membershipService;
    }

    @Transactional
    public UserResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "El email ya está registrado");
        }

        User user = new User(
                request.email(),
                passwordEncoder.encode(request.password()),
                request.fullName()
        );
        user.setRole(UserRole.ADMIN);
        userRepository.save(user);
        businessSettingsService.getOrCreateProfile(user);
        membershipService.startTrial(user);
        return toUserResponse(user);
    }

    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.email(), request.password())
            );
        } catch (Exception ex) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Credenciales inválidas");
        }

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Credenciales inválidas"));

        String token = jwtService.generateToken(user.getId(), user.getEmail());
        return new AuthResponse(token, toUserResponse(user));
    }

    public UserResponse me(User user) {
        return toUserResponse(user);
    }

    private UserResponse toUserResponse(User user) {
        var membership = membershipService.getOrCreate(user);
        return UserResponse.from(
                user,
                businessSettingsService.isOnboardingCompleted(user),
                businessSettingsService.onboardingStep(user),
                membership.getStatus().name(),
                membership.getPlan().name(),
                membershipService.canEmit(user));
    }
}
