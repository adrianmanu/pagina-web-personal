package com.adrian.inventory.controller;

import com.adrian.inventory.config.DemoDataSeeder;
import com.adrian.inventory.exception.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/dev")
public class DevSeedController {

    private final DemoDataSeeder demoDataSeeder;

    public DevSeedController(DemoDataSeeder demoDataSeeder) {
        this.demoDataSeeder = demoDataSeeder;
    }

    @PostMapping("/seed-demo")
    public Map<String, Object> seedDemo() {
        if (!demoDataSeeder.isEnabled()) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Seed demo deshabilitado");
        }
        DemoDataSeeder.SeedResult result = demoDataSeeder.seed();
        return Map.of(
                "message", "Datos de prueba cargados",
                "email", DemoDataSeeder.DEMO_EMAIL,
                "password", DemoDataSeeder.DEMO_PASSWORD,
                "productsAdded", result.productsAdded(),
                "customersAdded", result.customersAdded(),
                "suppliersAdded", result.suppliersAdded(),
                "invoicesAdded", result.invoicesAdded());
    }
}
