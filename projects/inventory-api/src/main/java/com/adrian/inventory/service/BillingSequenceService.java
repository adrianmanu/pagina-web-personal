package com.adrian.inventory.service;

import com.adrian.inventory.config.DatilProperties;
import com.adrian.inventory.exception.ApiException;
import com.adrian.inventory.model.BillingSequence;
import com.adrian.inventory.repository.BillingSequenceRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BillingSequenceService {

    private static final String LEGACY_SCOPE = "default";

    private final DatilProperties properties;
    private final BillingSequenceRepository sequenceRepository;

    public BillingSequenceService(DatilProperties properties, BillingSequenceRepository sequenceRepository) {
        this.properties = properties;
        this.sequenceRepository = sequenceRepository;
    }

    public String scopeKey(SriDocumentType type) {
        return properties.getEstablecimientoCodigo()
                + "-"
                + properties.getPuntoEmision()
                + "-"
                + type.getScopeSuffix();
    }

    @Transactional
    public int nextSecuencial(SriDocumentType type) {
        String scopeKey = scopeKey(type);
        BillingSequence sequence = sequenceRepository
                .findByScopeKey(scopeKey)
                .orElseGet(() -> createSequence(scopeKey));

        int next = sequence.getLastSecuencial() + 1;
        if (next > 999_999_999) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Secuencial de facturación agotado para " + scopeKey);
        }

        sequence.setLastSecuencial(next);
        sequenceRepository.save(sequence);
        return next;
    }

    private BillingSequence createSequence(String scopeKey) {
        BillingSequence created = new BillingSequence();
        created.setScopeKey(scopeKey);

        int initial = sequenceRepository
                .findByScopeKey(LEGACY_SCOPE)
                .map(BillingSequence::getLastSecuencial)
                .orElse(Math.max(0, properties.getSecuencialInicial()));

        created.setLastSecuencial(initial);
        return sequenceRepository.save(created);
    }
}
