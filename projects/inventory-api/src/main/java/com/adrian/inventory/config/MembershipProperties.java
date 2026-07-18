package com.adrian.inventory.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "membership")
public class MembershipProperties {

    private boolean enforcementEnabled = true;
    private int trialDays = 14;

    public boolean isEnforcementEnabled() {
        return enforcementEnabled;
    }

    public void setEnforcementEnabled(boolean enforcementEnabled) {
        this.enforcementEnabled = enforcementEnabled;
    }

    public int getTrialDays() {
        return trialDays;
    }

    public void setTrialDays(int trialDays) {
        this.trialDays = trialDays;
    }
}
