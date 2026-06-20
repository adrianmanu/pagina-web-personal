package com.adrian.inventory.service;

import com.adrian.inventory.dto.PurchaseSettlementItemRequest;
import com.adrian.inventory.dto.PurchaseSettlementRequest;
import com.adrian.inventory.dto.PurchaseSettlementResponse;
import com.adrian.inventory.exception.ApiException;
import com.adrian.inventory.model.Product;
import com.adrian.inventory.model.PurchaseSettlement;
import com.adrian.inventory.model.PurchaseSettlementItem;
import com.adrian.inventory.model.Supplier;
import com.adrian.inventory.model.User;
import com.adrian.inventory.repository.ProductRepository;
import com.adrian.inventory.repository.PurchaseSettlementRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PurchaseSettlementService {

    private final PurchaseSettlementRepository purchaseSettlementRepository;
    private final ProductRepository productRepository;
    private final SupplierService supplierService;
    private final SriPurchaseSettlementService sriPurchaseSettlementService;

    public PurchaseSettlementService(
            PurchaseSettlementRepository purchaseSettlementRepository,
            ProductRepository productRepository,
            SupplierService supplierService,
            SriPurchaseSettlementService sriPurchaseSettlementService) {
        this.purchaseSettlementRepository = purchaseSettlementRepository;
        this.productRepository = productRepository;
        this.supplierService = supplierService;
        this.sriPurchaseSettlementService = sriPurchaseSettlementService;
    }

    public List<PurchaseSettlementResponse> findAll(User user) {
        return purchaseSettlementRepository.findByUserIdOrderByIdDesc(user.getId()).stream()
                .map(PurchaseSettlementResponse::from)
                .toList();
    }

    public PurchaseSettlementResponse findById(Long id, User user) {
        return PurchaseSettlementResponse.from(getOwnedSettlement(id, user));
    }

    @Transactional
    public PurchaseSettlementResponse create(PurchaseSettlementRequest request, User user) {
        Supplier supplier = supplierService.getOwnedSupplier(request.supplierId(), user);

        PurchaseSettlement settlement = new PurchaseSettlement();
        settlement.setUser(user);
        settlement.setSupplier(supplier);
        settlement.setCreatedAt(LocalDateTime.now());

        double total = 0;
        for (PurchaseSettlementItemRequest lineRequest : request.items()) {
            PurchaseSettlementItem item = buildItem(settlement, lineRequest, user);
            settlement.getItems().add(item);
            total += item.getSubtotal();
        }

        settlement.setTotal(Math.round(total * 100.0) / 100.0);
        PurchaseSettlement saved = purchaseSettlementRepository.save(settlement);

        if (sriPurchaseSettlementService.isEnabled()) {
            sriPurchaseSettlementService.emitPurchaseSettlement(saved);
            saved = purchaseSettlementRepository.save(saved);
        } else {
            saved.setSriStatus("DISABLED");
            saved = purchaseSettlementRepository.save(saved);
        }

        return PurchaseSettlementResponse.from(saved);
    }

    @Transactional
    public PurchaseSettlementResponse refreshSriStatus(Long id, User user) {
        PurchaseSettlement settlement = getOwnedSettlement(id, user);
        if (!sriPurchaseSettlementService.isEnabled()) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "Facturación SRI no está configurada");
        }
        sriPurchaseSettlementService.refreshFromDatil(settlement);
        return PurchaseSettlementResponse.from(purchaseSettlementRepository.save(settlement));
    }

    @Transactional
    public PurchaseSettlementResponse reissueSri(Long id, User user) {
        PurchaseSettlement settlement = getOwnedSettlement(id, user);
        sriPurchaseSettlementService.reissuePurchaseSettlement(settlement);
        return PurchaseSettlementResponse.from(purchaseSettlementRepository.save(settlement));
    }

    private PurchaseSettlementItem buildItem(
            PurchaseSettlement settlement, PurchaseSettlementItemRequest lineRequest, User user) {
        String description = lineRequest.description();
        String sku = lineRequest.sku();
        Long productId = lineRequest.productId();

        if (productId != null) {
            Product product = productRepository
                    .findById(productId)
                    .filter(item -> item.getUser().getId().equals(user.getId()))
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Producto no encontrado"));
            description = blankTo(description, product.getName());
            sku = blankTo(sku, product.getSku());
            productId = product.getId();
        }

        if (description == null || description.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Cada ítem debe tener descripción o producto");
        }

        double subtotal = Math.round(lineRequest.quantity() * lineRequest.unitPrice() * 100.0) / 100.0;

        PurchaseSettlementItem item = new PurchaseSettlementItem();
        item.setPurchaseSettlement(settlement);
        item.setProductId(productId);
        item.setDescription(description.trim());
        item.setSku(sku == null || sku.isBlank() ? null : sku.trim());
        item.setQuantity(lineRequest.quantity());
        item.setUnitPrice(lineRequest.unitPrice());
        item.setSubtotal(subtotal);
        return item;
    }

    private PurchaseSettlement getOwnedSettlement(Long id, User user) {
        return purchaseSettlementRepository
                .findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Liquidación de compra no encontrada"));
    }

    private static String blankTo(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value.trim();
    }
}
