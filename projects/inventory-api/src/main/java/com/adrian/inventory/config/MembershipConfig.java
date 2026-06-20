package com.adrian.inventory.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties({MembershipProperties.class, StripeProperties.class, PayPhoneProperties.class})
public class MembershipConfig {}
