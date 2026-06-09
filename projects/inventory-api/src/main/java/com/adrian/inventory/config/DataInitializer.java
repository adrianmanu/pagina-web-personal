package com.adrian.inventory.config;

import com.adrian.inventory.model.Product;
import com.adrian.inventory.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initData(ProductRepository repository) {
        return args -> {
            if (repository.count() == 0) {
                repository.save(new Product("Laptop Pro 15", "LP-001", 25, 1299.99, "Electrónica"));
                repository.save(new Product("Monitor 27''", "MN-002", 40, 349.50, "Electrónica"));
                repository.save(new Product("Teclado Mecánico", "TK-003", 80, 89.99, "Accesorios"));
            }
        };
    }
}
