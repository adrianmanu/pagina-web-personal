package com.adrian.inventory.service;

import com.adrian.inventory.dto.InvoiceRequest;
import com.adrian.inventory.dto.ProformaRequest;
import com.adrian.inventory.dto.ProformaResponse;
import com.adrian.inventory.exception.ApiException;
import com.adrian.inventory.model.Customer;
import com.adrian.inventory.model.Proforma;
import com.adrian.inventory.model.ProformaItem;
import com.adrian.inventory.model.Product;
import com.adrian.inventory.model.User;
import com.adrian.inventory.repository.ProformaRepository;
import com.adrian.inventory.repository.ProductRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ProformaService {

    private final ProformaRepository proformaRepository;
    private final ProductRepository productRepository;
    private final CustomerService customerService;
    private final InvoiceService invoiceService;
    private final InvoiceNotificationService invoiceNotificationService;

    public ProformaService(
            ProformaRepository proformaRepository,
            ProductRepository productRepository,
            CustomerService customerService,
            InvoiceService invoiceService,
            InvoiceNotificationService invoiceNotificationService) {
        this.proformaRepository = proformaRepository;
        this.productRepository = productRepository;
        this.customerService = customerService;
        this.invoiceService = invoiceService;
        this.invoiceNotificationService = invoiceNotificationService;
    }

    public List<ProformaResponse> findAll(User user) {
        return proformaRepository.findByUserIdOrderByIdDesc(user.getId()).stream()
                .map(ProformaResponse::from)
                .toList();
    }

    public ProformaResponse findById(Long id, User user) {
        return ProformaResponse.from(getOwnedProforma(id, user));
    }

    @Transactional
    public ProformaResponse create(ProformaRequest request, User user) {
        Proforma proforma = new Proforma();
        proforma.setUser(user);
        proforma.setCreatedAt(LocalDateTime.now());
        proforma.setStatus("DRAFT");
        proforma.setNotes(blankToNull(request.notes()));
        applyCustomer(proforma, request, user);

        double total = 0;
        for (var itemRequest : request.items()) {
            Product product = productRepository
                    .findByIdAndUserId(itemRequest.productId(), user.getId())
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Producto no encontrado"));

            double unitPrice = product.getPrice() == null ? 0 : product.getPrice();
            ProformaItem item = new ProformaItem();
            item.setProforma(proforma);
            item.setProductId(product.getId());
            item.setProductName(product.getName());
            item.setSku(product.getSku());
            item.setQuantity(itemRequest.quantity());
            item.setUnitPrice(unitPrice);
            proforma.getItems().add(item);
            total += itemRequest.quantity() * unitPrice;
        }

        proforma.setTotal(Math.round(total * 100.0) / 100.0);
        return ProformaResponse.from(proformaRepository.save(proforma));
    }

    @Transactional
    public ProformaResponse convertToInvoice(Long id, User user) {
        Proforma proforma = getOwnedProforma(id, user);
        if (!"DRAFT".equals(proforma.getStatus())) {
            throw new ApiException(HttpStatus.CONFLICT, "La proforma ya fue convertida");
        }

        var invoice = invoiceService.create(
                new InvoiceRequest(
                        proforma.isFinalConsumer(),
                        proforma.getCustomer() == null ? null : proforma.getCustomer().getId(),
                        proforma.getCustomerName(),
                        proforma.getCustomerTaxId(),
                        proforma.getCustomerEmail(),
                        proforma.getCustomerAddress(),
                        proforma.getItems().stream()
                                .map(item -> new com.adrian.inventory.dto.InvoiceItemRequest(
                                        item.getProductId(), item.getQuantity()))
                                .toList()),
                user);

        proforma.setStatus("CONVERTED");
        proforma.setConvertedInvoiceId(invoice.id());
        proformaRepository.save(proforma);
        invoiceNotificationService.notifyInvoice(invoice);
        return ProformaResponse.from(proforma);
    }

    @Transactional
    public void delete(Long id, User user) {
        Proforma proforma = getOwnedProforma(id, user);
        if ("CONVERTED".equals(proforma.getStatus())) {
            throw new ApiException(HttpStatus.CONFLICT, "No se puede eliminar una proforma convertida");
        }
        proformaRepository.delete(proforma);
    }

    private Proforma getOwnedProforma(Long id, User user) {
        return proformaRepository
                .findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Proforma no encontrada"));
    }

    private void applyCustomer(Proforma proforma, ProformaRequest request, User user) {
        if (request.finalConsumer()) {
            proforma.setFinalConsumer(true);
            proforma.setCustomerName("Consumidor Final");
            return;
        }
        if (request.customerId() != null) {
            Customer customer = customerService.getOwnedCustomer(request.customerId(), user);
            proforma.setCustomer(customer);
            proforma.setFinalConsumer(false);
            proforma.setCustomerName(customer.getName());
            proforma.setCustomerTaxId(customer.getTaxId());
            proforma.setCustomerEmail(customer.getEmail());
            proforma.setCustomerAddress(customer.getAddress());
            return;
        }
        if (request.customerName() == null || request.customerName().isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "El nombre del cliente es obligatorio");
        }
        if (request.customerTaxId() == null || request.customerTaxId().isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "La identificación del cliente es obligatoria");
        }
        TaxIdValidator.validate(request.customerTaxId());
        proforma.setFinalConsumer(false);
        proforma.setCustomerName(request.customerName().trim());
        proforma.setCustomerTaxId(TaxIdValidator.normalize(request.customerTaxId()));
        proforma.setCustomerEmail(blankToNull(request.customerEmail()));
        proforma.setCustomerAddress(blankToNull(request.customerAddress()));
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
