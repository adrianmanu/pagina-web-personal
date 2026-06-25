package com.adrian.inventory.model;

import java.util.Arrays;
import java.util.Optional;

public enum MembershipBillingPeriod {
    MONTHS_1(1, 30, "1 mes", 0),
    MONTHS_3(3, 90, "3 meses", 5),
    MONTHS_6(6, 180, "6 meses", 10),
    MONTHS_12(12, 365, "1 año", 15);

    private final int months;
    private final int days;
    private final String label;
    private final int savingsPercent;

    MembershipBillingPeriod(int months, int days, String label, int savingsPercent) {
        this.months = months;
        this.days = days;
        this.label = label;
        this.savingsPercent = savingsPercent;
    }

    public int getMonths() {
        return months;
    }

    public int getDays() {
        return days;
    }

    public String getLabel() {
        return label;
    }

    public int getSavingsPercent() {
        return savingsPercent;
    }

    public static Optional<MembershipBillingPeriod> fromMonths(int months) {
        return Arrays.stream(values()).filter(p -> p.months == months).findFirst();
    }
}
