package com.adrian.inventory.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
@EnableConfigurationProperties({SriProviderProperties.class, FactuplanProperties.class})
public class SriProviderConfig {

    @Bean
    RestClient factuplanRestClient(FactuplanProperties properties) {
        return RestClient.builder()
                .baseUrl(properties.getApiUrl())
                .build();
    }
}
