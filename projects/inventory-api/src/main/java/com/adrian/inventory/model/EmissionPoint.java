package com.adrian.inventory.model;

import jakarta.persistence.*;

@Entity
@Table(name = "emission_points")
public class EmissionPoint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 3)
    private String establishmentCode;

    @Column(nullable = false, length = 3)
    private String emissionPointCode;

    @Column(nullable = false)
    private String label;

    private String address;

    @Column(nullable = false)
    private boolean defaultPoint;

    public EmissionPoint() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getEstablishmentCode() { return establishmentCode; }
    public void setEstablishmentCode(String establishmentCode) { this.establishmentCode = establishmentCode; }
    public String getEmissionPointCode() { return emissionPointCode; }
    public void setEmissionPointCode(String emissionPointCode) { this.emissionPointCode = emissionPointCode; }
    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public boolean isDefaultPoint() { return defaultPoint; }
    public void setDefaultPoint(boolean defaultPoint) { this.defaultPoint = defaultPoint; }
}
