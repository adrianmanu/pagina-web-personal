package com.adrian.inventory.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "sri")
public class SriProviderProperties {

    private SriProviderType provider = SriProviderType.DATIL;

    public SriProviderType getProvider() {
        return provider;
    }

    public void setProvider(SriProviderType provider) {
        this.provider = provider != null ? provider : SriProviderType.DATIL;
    }

    public boolean isFactuplan() {
        return provider == SriProviderType.FACTUPLAN;
    }
}
