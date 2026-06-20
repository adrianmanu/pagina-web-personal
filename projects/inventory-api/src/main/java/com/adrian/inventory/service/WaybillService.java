package com.adrian.inventory.service;

import com.adrian.inventory.dto.WaybillItemRequest;
import com.adrian.inventory.dto.WaybillRequest;
import com.adrian.inventory.dto.WaybillResponse;
import com.adrian.inventory.exception.ApiException;
import com.adrian.inventory.model.Invoice;
import com.adrian.inventory.model.Product;
import com.adrian.inventory.model.User;
import com.adrian.inventory.model.Waybill;
import com.adrian.inventory.model.WaybillItem;
import com.adrian.inventory.repository.InvoiceRepository;
import com.adrian.inventory.repository.ProductRepository;
import com.adrian.inventory.repository.WaybillRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class WaybillService {

    private final WaybillRepository waybillRepository;
    private final InvoiceRepository invoiceRepository;
    private final ProductRepository productRepository;
    private final SriWaybillService sriWaybillService;

    public WaybillService(
            WaybillRepository waybillRepository,
            InvoiceRepository invoiceRepository,
            ProductRepository productRepository,
            SriWaybillService sriWaybillService) {
        this.waybillRepository = waybillRepository;
        this.invoiceRepository = invoiceRepository;
        this.productRepository = productRepository;
        this.sriWaybillService = sriWaybillService;
    }

    public List<WaybillResponse> findAll(User user) {
        return waybillRepository.findByUserIdOrderByIdDesc(user.getId()).stream()
                .map(WaybillResponse::from)
                .toList();
    }

    public WaybillResponse findById(Long id, User user) {
        return WaybillResponse.from(getOwnedWaybill(id, user));
    }

    @Transactional
    public WaybillResponse create(WaybillRequest request, User user) {
        Invoice invoice = null;
        if (request.invoiceId() != null) {
            invoice = invoiceRepository
                    .findById(request.invoiceId())
                    .filter(item -> item.getUser().getId().equals(user.getId()))
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Factura no encontrada"));
            if (!"AUTORIZADO".equalsIgnoreCase(invoice.getSriStatus())) {
                throw new ApiException(
                        HttpStatus.BAD_REQUEST,
                        "Solo se puede vincular guías a facturas AUTORIZADAS por el SRI");
            }
        }

        TaxIdValidator.validate(request.carrierTaxId());
        TaxIdValidator.validate(request.recipientTaxId());

        Waybill waybill = new Waybill();
        waybill.setUser(user);
        waybill.setInvoice(invoice);
        waybill.setCreatedAt(LocalDateTime.now());
        waybill.setDireccionPartida(request.direccionPartida().trim());
        waybill.setMotivoTraslado(request.motivoTraslado().trim());
        waybill.setRuta(request.ruta());
        waybill.setCarrierName(request.carrierName().trim());
        waybill.setCarrierTaxId(TaxIdValidator.normalize(request.carrierTaxId()));
        waybill.setCarrierPlate(request.carrierPlate().trim().toUpperCase());
        waybill.setCarrierEmail(request.carrierEmail());
        waybill.setCarrierAddress(request.carrierAddress());
        waybill.setCarrierPhone(request.carrierPhone());
        waybill.setRecipientName(request.recipientName().trim());
        waybill.setRecipientTaxId(TaxIdValidator.normalize(request.recipientTaxId()));
        waybill.setRecipientEmail(request.recipientEmail());
        waybill.setRecipientAddress(request.recipientAddress().trim());
        waybill.setRecipientPhone(request.recipientPhone());

        for (WaybillItemRequest lineRequest : request.items()) {
            WaybillItem item = new WaybillItem();
            item.setWaybill(waybill);
            item.setQuantity(lineRequest.quantity());

            if (lineRequest.productId() != null) {
                Product product = productRepository
                        .findByIdAndUserId(lineRequest.productId(), user.getId())
                        .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Producto no válido"));
                item.setProductId(product.getId());
                item.setProductName(product.getName());
                item.setSku(product.getSku());
            } else {
                if (lineRequest.description() == null || lineRequest.description().isBlank()) {
                    throw new ApiException(HttpStatus.BAD_REQUEST, "Indica descripción o producto en cada ítem");
                }
                item.setProductName(lineRequest.description().trim());
                item.setSku(lineRequest.sku());
            }

            waybill.getItems().add(item);
        }

        Waybill saved = waybillRepository.save(waybill);

        if (sriWaybillService.isEnabled()) {
            sriWaybillService.emitWaybill(saved);
            saved = waybillRepository.save(saved);
        } else {
            saved.setSriStatus("DISABLED");
            saved = waybillRepository.save(saved);
        }

        return WaybillResponse.from(saved);
    }

    @Transactional
    public WaybillResponse refreshSriStatus(Long id, User user) {
        Waybill waybill = getOwnedWaybill(id, user);
        if (!sriWaybillService.isEnabled()) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "Facturación SRI no está configurada");
        }
        sriWaybillService.refreshFromDatil(waybill);
        return WaybillResponse.from(waybillRepository.save(waybill));
    }

    @Transactional
    public WaybillResponse reissueSri(Long id, User user) {
        Waybill waybill = getOwnedWaybill(id, user);
        sriWaybillService.reissueWaybill(waybill);
        return WaybillResponse.from(waybillRepository.save(waybill));
    }

    private Waybill getOwnedWaybill(Long id, User user) {
        return waybillRepository
                .findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Guía de remisión no encontrada"));
    }
}
