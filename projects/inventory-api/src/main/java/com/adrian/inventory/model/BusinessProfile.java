package com.adrian.inventory.model;

import jakarta.persistence.*;

@Entity
@Table(name = "business_profiles")
public class BusinessProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false)
    private String businessName;

    @Column(nullable = false, length = 13)
    private String ruc;

    @Column(nullable = false)
    private String razonSocial;

    private String direccion;

    private String emailNotificaciones;

    @Column(nullable = false)
    private boolean onboardingCompleted;

    @Column(nullable = false)
    private int onboardingStep;

    public BusinessProfile() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getBusinessName() { return businessName; }
    public void setBusinessName(String businessName) { this.businessName = businessName; }
    public String getRuc() { return ruc; }
    public void setRuc(String ruc) { this.ruc = ruc; }
    public String getRazonSocial() { return razonSocial; }
    public void setRazonSocial(String razonSocial) { this.razonSocial = razonSocial; }
    public String getDireccion() { return direccion; }
    public void setDireccion(String direccion) { this.direccion = direccion; }
    public String getEmailNotificaciones() { return emailNotificaciones; }
    public void setEmailNotificaciones(String emailNotificaciones) { this.emailNotificaciones = emailNotificaciones; }
    public boolean isOnboardingCompleted() { return onboardingCompleted; }
    public void setOnboardingCompleted(boolean onboardingCompleted) { this.onboardingCompleted = onboardingCompleted; }
    public int getOnboardingStep() { return onboardingStep; }
    public void setOnboardingStep(int onboardingStep) { this.onboardingStep = onboardingStep; }
}
