package com.adrian.inventory.security;

import com.adrian.inventory.model.User;
import com.adrian.inventory.model.UserRole;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.List;

public class UserPrincipal implements UserDetails {

    private final User user;

    public UserPrincipal(User user) {
        this.user = user;
    }

    public User getUser() {
        return user;
    }

    @Override
    public List<SimpleGrantedAuthority> getAuthorities() {
        UserRole role = user.getRole() == null ? UserRole.ADMIN : user.getRole();
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    public UserRole getRole() {
        return user.getRole() == null ? UserRole.ADMIN : user.getRole();
    }

    @Override
    public String getPassword() {
        return user.getPassword();
    }

    @Override
    public String getUsername() {
        return user.getEmail();
    }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return true; }
}
