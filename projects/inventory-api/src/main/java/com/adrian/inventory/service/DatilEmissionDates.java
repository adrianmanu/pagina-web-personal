package com.adrian.inventory.service;

import com.adrian.inventory.config.DatilProperties;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;

public final class DatilEmissionDates {

    private static final ZoneOffset ECUADOR_OFFSET = ZoneOffset.of("-05:00");
    private static final DateTimeFormatter DATIL_DATE =
            DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");

    private DatilEmissionDates() {}

    public static String format(DatilProperties properties, LocalDateTime createdAt) {
        OffsetDateTime emission = createdAt
                .atZone(ZoneOffset.systemDefault())
                .withZoneSameInstant(ECUADOR_OFFSET)
                .toOffsetDateTime()
                .minusDays(Math.max(0, properties.getEmissionOffsetDays()))
                .minusMinutes(1);
        return emission.format(DATIL_DATE);
    }

    public static String now(DatilProperties properties) {
        return format(properties, LocalDateTime.now());
    }
}
