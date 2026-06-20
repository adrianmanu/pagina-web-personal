package com.adrian.inventory.config;

import com.adrian.inventory.model.Product;
import com.adrian.inventory.model.User;
import com.adrian.inventory.model.UserRole;
import com.adrian.inventory.repository.ProductRepository;
import com.adrian.inventory.repository.UserRepository;
import com.adrian.inventory.service.BusinessSettingsService;
import com.adrian.inventory.service.MembershipService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    private static final String DEMO_EMAIL = "demo@stockflow.dev";
    private static final String DEMO_PASSWORD = "demo1234";

    @Bean
    CommandLineRunner init(
            UserRepository userRepository,
            ProductRepository productRepository,
            PasswordEncoder passwordEncoder,
            BusinessSettingsService businessSettingsService,
            MembershipService membershipService,
            @Value("${stockflow.seed-demo:false}") boolean seedDemo) {
        return args -> {
            if (!seedDemo || userRepository.existsByEmail(DEMO_EMAIL)) {
                return;
            }

            User user = new User(DEMO_EMAIL, passwordEncoder.encode(DEMO_PASSWORD), "Usuario Demo");
            user.setRole(UserRole.ADMIN);
            userRepository.save(user);

            businessSettingsService.getOrCreateProfile(user);
            membershipService.startTrial(user);

            seedProduct(productRepository, user, "Laptop Pro 14\"", "TEC-001", 18, 1450.0, "Tecnología");
            seedProduct(productRepository, user, "Monitor 27\" 4K", "TEC-002", 32, 380.0, "Tecnología");
            seedProduct(productRepository, user, "Teclado mecánico RGB", "TEC-003", 54, 95.0, "Tecnología");
            seedProduct(productRepository, user, "Silla ergonómica", "OFI-001", 12, 320.0, "Oficina");
        };
    }

    private static void seedProduct(
            ProductRepository productRepository,
            User user,
            String name,
            String sku,
            int stock,
            double price,
            String category) {
        Product product = new Product();
        product.setUser(user);
        product.setName(name);
        product.setSku(sku);
        product.setStock(stock);
        product.setPrice(price);
        product.setCategory(category);
        productRepository.save(product);
    }
}
