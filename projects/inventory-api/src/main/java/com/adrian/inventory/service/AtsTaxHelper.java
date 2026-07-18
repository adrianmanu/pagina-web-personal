package com.adrian.inventory.service;

import com.adrian.inventory.config.DatilProperties;

import java.math.BigDecimal;
import java.math.RoundingMode;

public final class AtsTaxHelper {

    private AtsTaxHelper() {}

    public static TaxBreakdown breakdown(Double total, DatilProperties properties) {
        double amount = total == null ? 0 : total;
        if (amount <= 0) {
            return new TaxBreakdown(0, 0, 0);
        }
        if (properties.isPricesIncludeIva()) {
            double subtotal = round(amount / (1 + properties.getIvaRate() / 100.0));
            double iva = round(amount - subtotal);
            return new TaxBreakdown(subtotal, iva, round(amount));
        }
        double subtotal = round(amount);
        double iva = round(subtotal * (properties.getIvaRate() / 100.0));
        return new TaxBreakdown(subtotal, iva, round(subtotal + iva));
    }

    public static TaxBreakdown fromParts(Double subtotal, Double iva, Double total) {
        double base = subtotal == null ? 0 : subtotal;
        double tax = iva == null ? 0 : iva;
        double sum = total == null ? round(base + tax) : total;
        return new TaxBreakdown(round(base), round(tax), round(sum));
    }

    public static double round(double value) {
        return BigDecimal.valueOf(value).setScale(2, RoundingMode.HALF_UP).doubleValue();
    }

    public record TaxBreakdown(double subtotal, double iva, double total) {}
}
