package com.adrian.inventory.service;

public final class SriDocumentNumber {

    private SriDocumentNumber() {}

    public static String format(String establecimiento, String puntoEmision, int secuencial) {
        return String.format("%s-%s-%09d", establecimiento, puntoEmision, secuencial);
    }
}
