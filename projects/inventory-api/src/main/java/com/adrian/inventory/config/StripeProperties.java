package com.adrian.inventory.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "stripe")
public class StripeProperties {

    private boolean enabled = false;
    private String apiKey = "";
    private String webhookSecret = "";
    private String priceStarter = "";
    private String pricePro = "";
    private String successUrl = "http://localhost:5176/membresia?success=1";
    private String cancelUrl = "http://localhost:5176/membresia?cancel=1";

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public String getApiKey() {
        return apiKey;
    }

    public void setApiKey(String apiKey) {
        this.apiKey = apiKey;
    }

    public String getWebhookSecret() {
        return webhookSecret;
    }

    public void setWebhookSecret(String webhookSecret) {
        this.webhookSecret = webhookSecret;
    }

    public String getPriceStarter() {
        return priceStarter;
    }

    public void setPriceStarter(String priceStarter) {
        this.priceStarter = priceStarter;
    }

    public String getPricePro() {
        return pricePro;
    }

    public void setPricePro(String pricePro) {
        this.pricePro = pricePro;
    }

    public String getSuccessUrl() {
        return successUrl;
    }

    public void setSuccessUrl(String successUrl) {
        this.successUrl = successUrl;
    }

    public String getCancelUrl() {
        return cancelUrl;
    }

    public void setCancelUrl(String cancelUrl) {
        this.cancelUrl = cancelUrl;
    }

    public boolean isConfigured() {
        return enabled && apiKey != null && !apiKey.isBlank();
    }
}
