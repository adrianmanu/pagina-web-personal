package com.adrian.inventory.config;

import com.adrian.inventory.service.sri.DatilSriInvoiceAdapter;
import com.adrian.inventory.service.sri.FactuplanSriInvoiceAdapter;
import com.adrian.inventory.service.sri.SriInvoicePort;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SriInvoicePortConfig {

    @Bean
    SriInvoicePort sriInvoicePort(
            SriProviderProperties providerProperties,
            DatilSriInvoiceAdapter datilAdapter,
            FactuplanSriInvoiceAdapter factuplanAdapter) {
        if (providerProperties.isFactuplan()) {
            return factuplanAdapter;
        }
        return datilAdapter;
    }
}
