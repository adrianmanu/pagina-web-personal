package com.adrian.inventory.dto;

import com.adrian.inventory.model.User;

public record UserResponse(Long id, String email, String fullName) {
    public static UserResponse from(User user) {
        return new UserResponse(user.getId(), user.getEmail(), user.getFullName());
    }
}
