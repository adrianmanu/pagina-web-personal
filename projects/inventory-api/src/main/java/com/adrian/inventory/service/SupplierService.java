package com.adrian.inventory.service;

import com.adrian.inventory.dto.SupplierRequest;
import com.adrian.inventory.dto.SupplierResponse;
import com.adrian.inventory.exception.ApiException;
import com.adrian.inventory.model.Supplier;
import com.adrian.inventory.model.User;
import com.adrian.inventory.repository.PurchaseSettlementRepository;
import com.adrian.inventory.repository.SupplierRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class SupplierService {

    private final SupplierRepository supplierRepository;
    private final PurchaseSettlementRepository purchaseSettlementRepository;

    public SupplierService(
            SupplierRepository supplierRepository, PurchaseSettlementRepository purchaseSettlementRepository) {
        this.supplierRepository = supplierRepository;
        this.purchaseSettlementRepository = purchaseSettlementRepository;
    }

    public List<SupplierResponse> findAll(User user) {
        return supplierRepository.findByUserIdOrderByNameAsc(user.getId()).stream()
                .map(supplier -> toResponse(supplier, user.getId()))
                .toList();
    }

    public List<SupplierResponse> search(User user, String query) {
        if (query == null || query.isBlank()) {
            return findAll(user);
        }

        String trimmed = query.trim();
        String normalizedTaxId = TaxIdValidator.normalize(trimmed);

        List<Supplier> byName =
                supplierRepository.findByUserIdAndNameContainingIgnoreCaseOrderByNameAsc(user.getId(), trimmed);

        List<Supplier> matches = normalizedTaxId.isBlank()
                ? byName
                : Stream.concat(
                                byName.stream(),
                                supplierRepository
                                        .findByUserIdAndTaxIdContainingOrderByNameAsc(user.getId(), normalizedTaxId)
                                        .stream())
                        .collect(Collectors.toMap(Supplier::getId, supplier -> supplier, (a, b) -> a))
                        .values()
                        .stream()
                        .sorted(Comparator.comparing(Supplier::getName, String.CASE_INSENSITIVE_ORDER))
                        .toList();

        return matches.stream().map(supplier -> toResponse(supplier, user.getId())).toList();
    }

    public SupplierResponse findById(Long id, User user) {
        return toResponse(getOwnedSupplier(id, user), user.getId());
    }

    public SupplierResponse create(SupplierRequest request, User user) {
        String taxId = normalizeTaxId(request.taxId());
        ensureTaxIdAvailable(taxId, user.getId(), null);

        Supplier supplier = new Supplier();
        supplier.setUser(user);
        applyRequest(supplier, request, taxId);
        return toResponse(supplierRepository.save(supplier), user.getId());
    }

    public SupplierResponse update(Long id, SupplierRequest request, User user) {
        Supplier supplier = getOwnedSupplier(id, user);
        String taxId = normalizeTaxId(request.taxId());
        ensureTaxIdAvailable(taxId, user.getId(), id);
        applyRequest(supplier, request, taxId);
        return toResponse(supplierRepository.save(supplier), user.getId());
    }

    public void delete(Long id, User user) {
        Supplier supplier = getOwnedSupplier(id, user);
        long settlementCount = purchaseSettlementRepository.countBySupplierId(supplier.getId());
        if (settlementCount > 0) {
            throw new ApiException(
                    HttpStatus.CONFLICT,
                    "No se puede eliminar: el proveedor tiene " + settlementCount + " liquidación(es) asociada(s)");
        }
        supplierRepository.delete(supplier);
    }

    public Supplier getOwnedSupplier(Long id, User user) {
        return supplierRepository
                .findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Proveedor no encontrado"));
    }

    private SupplierResponse toResponse(Supplier supplier, Long userId) {
        List<com.adrian.inventory.model.PurchaseSettlement> settlements =
                purchaseSettlementRepository.findByUserIdOrderByIdDesc(userId).stream()
                        .filter(item -> item.getSupplier().getId().equals(supplier.getId()))
                        .toList();
        double total = settlements.stream()
                .mapToDouble(item -> item.getTotal() == null ? 0 : item.getTotal())
                .sum();
        return SupplierResponse.from(supplier, settlements.size(), total);
    }

    private void ensureTaxIdAvailable(String taxId, Long userId, Long currentId) {
        supplierRepository.findByTaxIdAndUserId(taxId, userId).ifPresent(existing -> {
            if (currentId == null || !existing.getId().equals(currentId)) {
                throw new ApiException(HttpStatus.CONFLICT, "Ya existe un proveedor con esa identificación");
            }
        });
    }

    private void applyRequest(Supplier supplier, SupplierRequest request, String taxId) {
        supplier.setName(request.name().trim());
        supplier.setTaxId(taxId);
        supplier.setEmail(blankToNull(request.email()));
        supplier.setAddress(blankToNull(request.address()));
        supplier.setPhone(blankToNull(request.phone()));
    }

    private static String normalizeTaxId(String taxId) {
        TaxIdValidator.validate(taxId);
        return TaxIdValidator.normalize(taxId);
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
