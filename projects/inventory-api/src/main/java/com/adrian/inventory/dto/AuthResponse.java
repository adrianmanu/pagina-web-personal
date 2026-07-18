package com.adrian.inventory.dto;

public record AuthResponse(String accessToken, String tokenType, UserResponse user) {
    public AuthResponse(String accessToken, UserResponse user) {
        this(accessToken, "bearer", user);
    }
}
