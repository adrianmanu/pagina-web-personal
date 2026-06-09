package com.adrian.inventory.service;

import com.adrian.inventory.dto.InvoiceItemRequest;
import com.adrian.inventory.dto.InvoiceRequest;
import com.adrian.inventory.dto.InvoiceResponse;
import com.adrian.inventory.dto.SalesSummary;
import com.adrian.inventory.exception.ApiException;
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

    public InvoiceService(InvoiceRepository invoiceRepository, ProductRepository productRepository) {
        this.invoiceRepository = invoiceRepository;
        this.productRepository = productRepository;
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
            if (request.customerName() == null || request.customerName().isBlank()) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "El nombre del cliente es obligatorio");
            }
            if (request.customerTaxId() == null || request.customerTaxId().isBlank()) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "La cédula o RUC del cliente es obligatoria");
            }
            invoice.setFinalConsumer(false);
            invoice.setCustomerName(request.customerName().trim());
            invoice.setCustomerTaxId(request.customerTaxId().trim());
            invoice.setCustomerEmail(blankToNull(request.customerEmail()));
            invoice.setCustomerAddress(blankToNull(request.customerAddress()));
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
        return InvoiceResponse.from(invoiceRepository.save(invoice));
    }

    public List<InvoiceResponse> findAll(User user) {
        return invoiceRepository.findByUserIdOrderByIdDesc(user.getId()).stream()
                .map(InvoiceResponse::from)
                .toList();
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

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
