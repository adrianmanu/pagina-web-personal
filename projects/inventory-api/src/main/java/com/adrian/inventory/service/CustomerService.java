package com.adrian.inventory.service;

import com.adrian.inventory.dto.CustomerRequest;
import com.adrian.inventory.dto.CustomerResponse;
import com.adrian.inventory.dto.InvoiceResponse;
import com.adrian.inventory.exception.ApiException;
import com.adrian.inventory.model.Customer;
import com.adrian.inventory.model.Invoice;
import com.adrian.inventory.model.User;
import com.adrian.inventory.repository.CustomerRepository;
import com.adrian.inventory.repository.InvoiceRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final InvoiceRepository invoiceRepository;

    public CustomerService(CustomerRepository customerRepository, InvoiceRepository invoiceRepository) {
        this.customerRepository = customerRepository;
        this.invoiceRepository = invoiceRepository;
    }

    public List<CustomerResponse> findAll(User user) {
        return customerRepository.findByUserIdOrderByNameAsc(user.getId()).stream()
                .map(customer -> toResponse(customer, user.getId()))
                .toList();
    }

    public List<CustomerResponse> search(User user, String query) {
        if (query == null || query.isBlank()) {
            return findAll(user);
        }

        String trimmed = query.trim();
        String normalizedTaxId = TaxIdValidator.normalize(trimmed);

        List<Customer> byName = customerRepository.findByUserIdAndNameContainingIgnoreCaseOrderByNameAsc(
                user.getId(), trimmed);

        List<Customer> matches = normalizedTaxId.isBlank()
                ? byName
                : Stream.concat(
                                byName.stream(),
                                customerRepository
                                        .findByUserIdAndTaxIdContainingOrderByNameAsc(user.getId(), normalizedTaxId)
                                        .stream())
                        .collect(Collectors.toMap(Customer::getId, customer -> customer, (a, b) -> a))
                        .values()
                        .stream()
                        .sorted(Comparator.comparing(Customer::getName, String.CASE_INSENSITIVE_ORDER))
                        .toList();

        return matches.stream().map(customer -> toResponse(customer, user.getId())).toList();
    }

    public CustomerResponse findById(Long id, User user) {
        return toResponse(getOwnedCustomer(id, user), user.getId());
    }

    public CustomerResponse create(CustomerRequest request, User user) {
        String taxId = normalizeTaxId(request.taxId());
        ensureTaxIdAvailable(taxId, user.getId(), null);

        Customer customer = new Customer();
        customer.setUser(user);
        applyRequest(customer, request, taxId);
        return toResponse(customerRepository.save(customer), user.getId());
    }

    public CustomerResponse update(Long id, CustomerRequest request, User user) {
        Customer customer = getOwnedCustomer(id, user);
        String taxId = normalizeTaxId(request.taxId());
        ensureTaxIdAvailable(taxId, user.getId(), id);
        applyRequest(customer, request, taxId);
        return toResponse(customerRepository.save(customer), user.getId());
    }

    public void delete(Long id, User user) {
        Customer customer = getOwnedCustomer(id, user);
        long invoiceCount = invoiceRepository.countByCustomerId(customer.getId());
        if (invoiceCount > 0) {
            throw new ApiException(
                    HttpStatus.CONFLICT,
                    "No se puede eliminar: el cliente tiene " + invoiceCount + " factura(s) asociada(s)");
        }
        customerRepository.delete(customer);
    }

    public List<InvoiceResponse> findInvoices(Long id, User user) {
        Customer customer = getOwnedCustomer(id, user);
        return invoiceRepository.findByCustomerIdOrderByIdDesc(customer.getId()).stream()
                .map(InvoiceResponse::from)
                .toList();
    }

    public Customer getOwnedCustomer(Long id, User user) {
        return customerRepository
                .findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Cliente no encontrado"));
    }

    private CustomerResponse toResponse(Customer customer, Long userId) {
        List<Invoice> invoices = invoiceRepository.findByCustomerIdOrderByIdDesc(customer.getId());
        double total = invoices.stream()
                .mapToDouble(invoice -> invoice.getTotal() == null ? 0 : invoice.getTotal())
                .sum();
        return CustomerResponse.from(customer, invoices.size(), total);
    }

    private void ensureTaxIdAvailable(String taxId, Long userId, Long currentId) {
        customerRepository.findByTaxIdAndUserId(taxId, userId).ifPresent(existing -> {
            if (currentId == null || !existing.getId().equals(currentId)) {
                throw new ApiException(HttpStatus.CONFLICT, "Ya existe un cliente con esa identificación");
            }
        });
    }

    private void applyRequest(Customer customer, CustomerRequest request, String taxId) {
        customer.setName(request.name().trim());
        customer.setTaxId(taxId);
        customer.setEmail(blankToNull(request.email()));
        customer.setAddress(blankToNull(request.address()));
        customer.setPhone(blankToNull(request.phone()));
    }

    private static String normalizeTaxId(String taxId) {
        TaxIdValidator.validate(taxId);
        return TaxIdValidator.normalize(taxId);
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
