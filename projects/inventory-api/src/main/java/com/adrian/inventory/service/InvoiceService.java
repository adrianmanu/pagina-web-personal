package com.adrian.inventory.service;

import com.adrian.inventory.config.DatilProperties;
import com.adrian.inventory.dto.InvoiceItemRequest;
import com.adrian.inventory.dto.InvoiceRequest;
import com.adrian.inventory.dto.InvoiceResponse;
import com.adrian.inventory.dto.SalesSummary;
import com.adrian.inventory.exception.ApiException;
import com.adrian.inventory.model.Customer;
import com.adrian.inventory.model.Invoice;
import com.adrian.inventory.model.InvoiceItem;
import com.adrian.inventory.model.Product;
import com.adrian.inventory.model.User;
import com.adrian.inventory.repository.InvoiceRepository;
import com.adrian.inventory.repository.ProductRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final ProductRepository productRepository;
    private final SriBillingService sriBillingService;
    private final CustomerService customerService;
    private final InvoiceNotificationService invoiceNotificationService;

    public InvoiceService(
            InvoiceRepository invoiceRepository,
            ProductRepository productRepository,
            SriBillingService sriBillingService,
            CustomerService customerService,
            InvoiceNotificationService invoiceNotificationService) {
        this.invoiceRepository = invoiceRepository;
        this.productRepository = productRepository;
        this.sriBillingService = sriBillingService;
        this.customerService = customerService;
        this.invoiceNotificationService = invoiceNotificationService;
    }

    @Transactional
    public InvoiceResponse create(InvoiceRequest request, User user) {
        Invoice invoice = new Invoice();
        invoice.setUser(user);
        invoice.setCreatedAt(LocalDateTime.now());

        if (request.finalConsumer()) {
            invoice.setFinalConsumer(true);
            invoice.setCustomerName("Consumidor Final");
        } else {
            applyCustomerData(invoice, request, user);
        }

        double total = 0;
        for (InvoiceItemRequest itemRequest : request.items()) {
            Product product = productRepository
                    .findByIdAndUserId(itemRequest.productId(), user.getId())
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Producto no encontrado"));

            int available = product.getStock() == null ? 0 : product.getStock();
            if (available < itemRequest.quantity()) {
                throw new ApiException(
                        HttpStatus.BAD_REQUEST,
                        "Stock insuficiente para " + product.getName() + " (disponible: " + available + ")");
            }

            product.setStock(available - itemRequest.quantity());
            productRepository.save(product);

            double unitPrice = product.getPrice() == null ? 0 : product.getPrice();

            InvoiceItem item = new InvoiceItem();
            item.setInvoice(invoice);
            item.setProductId(product.getId());
            item.setProductName(product.getName());
            item.setSku(product.getSku());
            item.setQuantity(itemRequest.quantity());
            item.setUnitPrice(unitPrice);
            invoice.getItems().add(item);

            total += itemRequest.quantity() * unitPrice;
        }

        invoice.setTotal(Math.round(total * 100.0) / 100.0);
        Invoice saved = invoiceRepository.save(invoice);

        if (sriBillingService.isEnabled()) {
            sriBillingService.emitInvoice(saved);
            saved = invoiceRepository.save(saved);
        } else {
            saved.setSriStatus("DISABLED");
            saved = invoiceRepository.save(saved);
        }

        InvoiceResponse response = InvoiceResponse.from(saved);
        invoiceNotificationService.notifyInvoice(response);
        return response;
    }

    public List<InvoiceResponse> findAll(User user) {
        return invoiceRepository.findByUserIdOrderByIdDesc(user.getId()).stream()
                .map(InvoiceResponse::from)
                .toList();
    }

    public InvoiceResponse findById(Long id, User user) {
        Invoice invoice = invoiceRepository
                .findById(id)
                .filter(item -> item.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Factura no encontrada"));
        return InvoiceResponse.from(invoice);
    }

    @Transactional
    public InvoiceResponse refreshSriStatus(Long id, User user) {
        Invoice invoice = invoiceRepository
                .findById(id)
                .filter(item -> item.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Factura no encontrada"));

        if (!sriBillingService.isEnabled()) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "Facturación SRI no está configurada");
        }

        sriBillingService.refreshFromDatil(invoice);
        return InvoiceResponse.from(invoiceRepository.save(invoice));
    }

    @Transactional
    public InvoiceResponse reissueSri(Long id, User user) {
        Invoice invoice = invoiceRepository
                .findById(id)
                .filter(item -> item.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Factura no encontrada"));

        if (!sriBillingService.isEnabled()) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "Facturación SRI no está configurada");
        }

        try {
            sriBillingService.reissueInvoice(invoice);
        } catch (Exception ex) {
            invoice.setSriStatus("ERROR");
            invoice.setSriErrorMessage(ex.getMessage() != null ? ex.getMessage() : ex.getClass().getSimpleName());
            invoiceRepository.save(invoice);
            throw ex instanceof ApiException apiEx
                    ? apiEx
                    : new ApiException(HttpStatus.BAD_GATEWAY, ex.getMessage());
        }

        return InvoiceResponse.from(invoiceRepository.save(invoice));
    }

    public SalesSummary getSummary(User user) {
        List<Invoice> invoices = invoiceRepository.findByUserIdOrderByIdDesc(user.getId());

        double revenue = invoices.stream()
                .mapToDouble(invoice -> invoice.getTotal() == null ? 0 : invoice.getTotal())
                .sum();
        long itemsSold = invoices.stream()
                .flatMap(invoice -> invoice.getItems().stream())
                .mapToLong(item -> item.getQuantity() == null ? 0 : item.getQuantity())
                .sum();

        return new SalesSummary(invoices.size(), itemsSold, Math.round(revenue * 100.0) / 100.0);
    }

    private void applyCustomerData(Invoice invoice, InvoiceRequest request, User user) {
        if (request.customerId() != null) {
            Customer customer = customerService.getOwnedCustomer(request.customerId(), user);
            invoice.setCustomer(customer);
            invoice.setFinalConsumer(false);
            invoice.setCustomerName(customer.getName());
            invoice.setCustomerTaxId(customer.getTaxId());
            invoice.setCustomerEmail(customer.getEmail());
            invoice.setCustomerAddress(customer.getAddress());
            return;
        }

        if (request.customerName() == null || request.customerName().isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "El nombre del cliente es obligatorio");
        }
        if (request.customerTaxId() == null || request.customerTaxId().isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "La cédula o RUC del cliente es obligatoria");
        }

        TaxIdValidator.validate(request.customerTaxId());
        invoice.setFinalConsumer(false);
        invoice.setCustomerName(request.customerName().trim());
        invoice.setCustomerTaxId(TaxIdValidator.normalize(request.customerTaxId()));
        invoice.setCustomerEmail(blankToNull(request.customerEmail()));
        invoice.setCustomerAddress(blankToNull(request.customerAddress()));
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
