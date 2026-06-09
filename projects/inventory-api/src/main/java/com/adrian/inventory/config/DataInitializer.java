package com.adrian.inventory.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner init() {
        return args -> {
            // Los productos se crean por cada usuario autenticado desde el panel.
        };
    }
}
