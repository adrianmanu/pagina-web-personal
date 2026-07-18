package com.adrian.inventory.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "datil")
public class DatilProperties {

    private boolean enabled = false;
    private String apiUrl = "https://link.datil.co";
    private String apiKey = "";
    private String certificatePassword = "";
    private int ambiente = 1;
    private String ruc = "";
    private String razonSocial = "";
    private String nombreComercial = "";
    private String direccion = "";
    private boolean obligadoContabilidad = true;
    private String contribuyenteEspecial = "";
    private String establecimientoCodigo = "001";
    private String puntoEmision = "001";
    private String establecimientoDireccion = "";
    private double ivaRate = 15.0;
    private String ivaCodigoPorcentaje = "4";
    private boolean pricesIncludeIva = true;
    private int secuencialInicial = 0;
    private boolean agenteRetencion = false;
    private String agenteRetencionResolucion = "";
    private int emissionOffsetDays = 0;

    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }
    public String getApiUrl() { return apiUrl; }
    public void setApiUrl(String apiUrl) { this.apiUrl = apiUrl; }
    public String getApiKey() { return apiKey; }
    public void setApiKey(String apiKey) { this.apiKey = apiKey; }
    public String getCertificatePassword() { return certificatePassword; }
    public void setCertificatePassword(String certificatePassword) { this.certificatePassword = certificatePassword; }
    public int getAmbiente() { return ambiente; }
    public void setAmbiente(int ambiente) { this.ambiente = ambiente; }
    public String getRuc() { return ruc; }
    public void setRuc(String ruc) { this.ruc = ruc; }
    public String getRazonSocial() { return razonSocial; }
    public void setRazonSocial(String razonSocial) { this.razonSocial = razonSocial; }
    public String getNombreComercial() { return nombreComercial; }
    public void setNombreComercial(String nombreComercial) { this.nombreComercial = nombreComercial; }
    public String getDireccion() { return direccion; }
    public void setDireccion(String direccion) { this.direccion = direccion; }
    public boolean isObligadoContabilidad() { return obligadoContabilidad; }
    public void setObligadoContabilidad(boolean obligadoContabilidad) { this.obligadoContabilidad = obligadoContabilidad; }
    public String getContribuyenteEspecial() { return contribuyenteEspecial; }
    public void setContribuyenteEspecial(String contribuyenteEspecial) { this.contribuyenteEspecial = contribuyenteEspecial; }
    public String getEstablecimientoCodigo() { return establecimientoCodigo; }
    public void setEstablecimientoCodigo(String establecimientoCodigo) { this.establecimientoCodigo = establecimientoCodigo; }
    public String getPuntoEmision() { return puntoEmision; }
    public void setPuntoEmision(String puntoEmision) { this.puntoEmision = puntoEmision; }
    public String getEstablecimientoDireccion() { return establecimientoDireccion; }
    public void setEstablecimientoDireccion(String establecimientoDireccion) { this.establecimientoDireccion = establecimientoDireccion; }
    public double getIvaRate() { return ivaRate; }
    public void setIvaRate(double ivaRate) { this.ivaRate = ivaRate; }
    public String getIvaCodigoPorcentaje() { return ivaCodigoPorcentaje; }
    public void setIvaCodigoPorcentaje(String ivaCodigoPorcentaje) { this.ivaCodigoPorcentaje = ivaCodigoPorcentaje; }
    public boolean isPricesIncludeIva() { return pricesIncludeIva; }
    public void setPricesIncludeIva(boolean pricesIncludeIva) { this.pricesIncludeIva = pricesIncludeIva; }
    public int getSecuencialInicial() { return secuencialInicial; }
    public void setSecuencialInicial(int secuencialInicial) { this.secuencialInicial = secuencialInicial; }
    public boolean isAgenteRetencion() { return agenteRetencion; }
    public void setAgenteRetencion(boolean agenteRetencion) { this.agenteRetencion = agenteRetencion; }
    public String getAgenteRetencionResolucion() { return agenteRetencionResolucion; }
    public void setAgenteRetencionResolucion(String agenteRetencionResolucion) {
        this.agenteRetencionResolucion = agenteRetencionResolucion;
    }
    public int getEmissionOffsetDays() { return emissionOffsetDays; }
    public void setEmissionOffsetDays(int emissionOffsetDays) { this.emissionOffsetDays = emissionOffsetDays; }

    public boolean isConfigured() {
        return enabled
                && apiKey != null && !apiKey.isBlank()
                && certificatePassword != null && !certificatePassword.isBlank()
                && ruc != null && !ruc.isBlank()
                && razonSocial != null && !razonSocial.isBlank();
    }
}
