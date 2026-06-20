package com.adrian.inventory.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "payphone")
public class PayPhoneProperties {

    private boolean enabled = false;
    private String token = "";
    private String storeId = "";
    private String apiUrl = "https://pay.payphonetodoesposible.com/api";
    private String responseUrl = "http://localhost:5176/membresia";

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getStoreId() {
        return storeId;
    }

    public void setStoreId(String storeId) {
        this.storeId = storeId;
    }

    public String getApiUrl() {
        return apiUrl;
    }

    public void setApiUrl(String apiUrl) {
        this.apiUrl = apiUrl;
    }

    public String getResponseUrl() {
        return responseUrl;
    }

    public void setResponseUrl(String responseUrl) {
        this.responseUrl = responseUrl;
    }

    public boolean isConfigured() {
        return enabled && token != null && !token.isBlank();
    }
}
