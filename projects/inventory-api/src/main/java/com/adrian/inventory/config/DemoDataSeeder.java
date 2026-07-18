package com.adrian.inventory.config;

import com.adrian.inventory.model.*;
import com.adrian.inventory.repository.*;
import com.adrian.inventory.service.BusinessSettingsService;
import com.adrian.inventory.service.MembershipService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
public class DemoDataSeeder {

    private static final Logger log = LoggerFactory.getLogger(DemoDataSeeder.class);

    public static final String DEMO_EMAIL = "demo@stockflow.dev";
    public static final String DEMO_PASSWORD = "demo1234";

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final SupplierRepository supplierRepository;
    private final InvoiceRepository invoiceRepository;
    private final PasswordEncoder passwordEncoder;
    private final BusinessSettingsService businessSettingsService;
    private final MembershipService membershipService;
    private final boolean seedDemo;

    public DemoDataSeeder(
            UserRepository userRepository,
            ProductRepository productRepository,
            CustomerRepository customerRepository,
            SupplierRepository supplierRepository,
            InvoiceRepository invoiceRepository,
            PasswordEncoder passwordEncoder,
            BusinessSettingsService businessSettingsService,
            MembershipService membershipService,
            @Value("${stockflow.seed-demo:false}") boolean seedDemo) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.customerRepository = customerRepository;
        this.supplierRepository = supplierRepository;
        this.invoiceRepository = invoiceRepository;
        this.passwordEncoder = passwordEncoder;
        this.businessSettingsService = businessSettingsService;
        this.membershipService = membershipService;
        this.seedDemo = seedDemo;
    }

    public boolean isEnabled() {
        return seedDemo;
    }

    @Transactional
    public SeedResult seed() {
        if (!seedDemo) {
            return SeedResult.disabled();
        }

        User user = ensureDemoUser();
        businessSettingsService.getOrCreateProfile(user);
        businessSettingsService.completeOnboarding(user);
        membershipService.getOrCreate(user);

        int products = seedProducts(user);
        int customers = seedCustomers(user);
        int suppliers = seedSuppliers(user);
        int invoices = seedInvoices(user);

        log.info(
                "Demo seed listo para {} — productos +{}, clientes +{}, proveedores +{}, facturas +{}",
                DEMO_EMAIL,
                products,
                customers,
                suppliers,
                invoices);

        return new SeedResult(true, products, customers, suppliers, invoices);
    }

    private User ensureDemoUser() {
        return userRepository.findByEmail(DEMO_EMAIL).orElseGet(() -> {
            User user = new User(DEMO_EMAIL, passwordEncoder.encode(DEMO_PASSWORD), "Usuario Demo");
            user.setRole(UserRole.ADMIN);
            return userRepository.save(user);
        });
    }

    private int seedProducts(User user) {
        int added = 0;
        for (ProductSeed seed : ProductSeed.all()) {
            if (productRepository.findBySkuAndUserId(seed.sku(), user.getId()).isPresent()) {
                continue;
            }
            Product product = new Product();
            product.setUser(user);
            product.setName(seed.name());
            product.setSku(seed.sku());
            product.setStock(seed.stock());
            product.setPrice(seed.price());
            product.setCategory(seed.category());
            productRepository.save(product);
            added++;
        }
        return added;
    }

    private int seedCustomers(User user) {
        int added = 0;
        for (CustomerSeed seed : CustomerSeed.all()) {
            if (customerRepository.findByTaxIdAndUserId(seed.taxId(), user.getId()).isPresent()) {
                continue;
            }
            Customer customer = new Customer();
            customer.setUser(user);
            customer.setName(seed.name());
            customer.setTaxId(seed.taxId());
            customer.setEmail(seed.email());
            customer.setAddress(seed.address());
            customer.setPhone(seed.phone());
            customerRepository.save(customer);
            added++;
        }
        return added;
    }

    private int seedSuppliers(User user) {
        int added = 0;
        for (SupplierSeed seed : SupplierSeed.all()) {
            if (supplierRepository.findByTaxIdAndUserId(seed.taxId(), user.getId()).isPresent()) {
                continue;
            }
            Supplier supplier = new Supplier();
            supplier.setUser(user);
            supplier.setName(seed.name());
            supplier.setTaxId(seed.taxId());
            supplier.setEmail(seed.email());
            supplier.setAddress(seed.address());
            supplier.setPhone(seed.phone());
            supplierRepository.save(supplier);
            added++;
        }
        return added;
    }

    private int seedInvoices(User user) {
        if (invoiceRepository.countByUserId(user.getId()) > 0) {
            return 0;
        }

        Map<String, Product> productsBySku = productRepository.findByUserId(user.getId()).stream()
                .collect(Collectors.toMap(Product::getSku, Function.identity(), (a, b) -> a));

        Map<String, Customer> customersByTaxId = customerRepository.findByUserIdOrderByNameAsc(user.getId()).stream()
                .collect(Collectors.toMap(Customer::getTaxId, Function.identity(), (a, b) -> a));

        int added = 0;
        for (InvoiceSeed seed : InvoiceSeed.all()) {
            Invoice invoice = new Invoice();
            invoice.setUser(user);
            invoice.setFinalConsumer(seed.finalConsumer());
            invoice.setCustomerName(seed.customerName());
            invoice.setCustomerTaxId(seed.customerTaxId());
            invoice.setCustomerEmail(seed.customerEmail());
            invoice.setCustomerAddress(seed.customerAddress());
            invoice.setCreatedAt(seed.createdAt());
            invoice.setSriStatus("AUTORIZADO");
            invoice.setSriSecuencial(seed.secuencial());
            invoice.setSriDocumentNumber(seed.documentNumber());
            invoice.setSriAccessKey(seed.accessKey());
            invoice.setSriAuthorizationNumber(seed.authorizationNumber());

            if (!seed.finalConsumer() && seed.customerTaxId() != null) {
                Optional.ofNullable(customersByTaxId.get(seed.customerTaxId())).ifPresent(invoice::setCustomer);
            }

            double total = 0;
            List<InvoiceItem> items = new ArrayList<>();
            for (InvoiceLineSeed line : seed.lines()) {
                Product product = productsBySku.get(line.sku());
                if (product == null) {
                    continue;
                }
                double subtotal = line.quantity() * line.unitPrice();
                total += subtotal;

                InvoiceItem item = new InvoiceItem();
                item.setInvoice(invoice);
                item.setProductId(product.getId());
                item.setProductName(product.getName());
                item.setSku(product.getSku());
                item.setQuantity(line.quantity());
                item.setUnitPrice(line.unitPrice());
                items.add(item);
            }
            invoice.setItems(items);
            invoice.setTotal(Math.round(total * 100.0) / 100.0);
            invoiceRepository.save(invoice);
            added++;
        }
        return added;
    }

    public record SeedResult(
            boolean enabled,
            int productsAdded,
            int customersAdded,
            int suppliersAdded,
            int invoicesAdded) {

        public static SeedResult disabled() {
            return new SeedResult(false, 0, 0, 0, 0);
        }
    }

    private record ProductSeed(String name, String sku, int stock, double price, String category) {
        static List<ProductSeed> all() {
            return List.of(
                    new ProductSeed("Laptop Pro 14\"", "TEC-001", 18, 1450.0, "Tecnología"),
                    new ProductSeed("Monitor 27\" 4K", "TEC-002", 32, 380.0, "Tecnología"),
                    new ProductSeed("Teclado mecánico RGB", "TEC-003", 54, 95.0, "Tecnología"),
                    new ProductSeed("Mouse inalámbrico", "TEC-004", 73, 42.0, "Tecnología"),
                    new ProductSeed("Silla ergonómica", "OFI-001", 12, 320.0, "Oficina"),
                    new ProductSeed("Escritorio ajustable", "OFI-002", 8, 540.0, "Oficina"),
                    new ProductSeed("Lámpara LED de escritorio", "OFI-003", 41, 38.0, "Oficina"),
                    new ProductSeed("Auriculares con micrófono", "ACC-001", 27, 78.0, "Accesorios"),
                    new ProductSeed("Hub USB-C 7 en 1", "ACC-002", 36, 55.0, "Accesorios"));
        }
    }

    private record CustomerSeed(
            String name, String taxId, String email, String address, String phone) {
        static List<CustomerSeed> all() {
            return List.of(
                    new CustomerSeed(
                            "Comercial Andina S.A.",
                            "1790012345001",
                            "compras@comercialandina.com",
                            "Av. Amazonas N34-120, Quito",
                            "022345678"),
                    new CustomerSeed(
                            "Estudio Creativo Lúmina",
                            "0992233445001",
                            "admin@lumina.ec",
                            "Calle Larga 8-44, Cuenca",
                            "072112233"));
        }
    }

    private record SupplierSeed(
            String name, String taxId, String email, String address, String phone) {
        static List<SupplierSeed> all() {
            return List.of(new SupplierSeed(
                    "Distribuidora Norte",
                    "1795566778001",
                    "ventas@norte-demo.com",
                    "Av. 6 de Diciembre, Quito",
                    "022998877"));
        }
    }

    private record InvoiceLineSeed(String sku, int quantity, double unitPrice) {}

    private record InvoiceSeed(
            boolean finalConsumer,
            String customerName,
            String customerTaxId,
            String customerEmail,
            String customerAddress,
            LocalDateTime createdAt,
            int secuencial,
            String documentNumber,
            String accessKey,
            String authorizationNumber,
            List<InvoiceLineSeed> lines) {

        static List<InvoiceSeed> all() {
            return List.of(
                    new InvoiceSeed(
                            false,
                            "Comercial Andina S.A.",
                            "1790012345001",
                            "compras@comercialandina.com",
                            "Av. Amazonas N34-120, Quito",
                            daysAgo(6),
                            901,
                            "001-002-000000901",
                            "0112202401179001234500110010020000009011234567812",
                            "1234567890",
                            List.of(
                                    new InvoiceLineSeed("TEC-001", 2, 1450.0),
                                    new InvoiceLineSeed("TEC-003", 4, 95.0))),
                    new InvoiceSeed(
                            true,
                            "Consumidor Final",
                            null,
                            null,
                            null,
                            daysAgo(3),
                            902,
                            "001-002-000000902",
                            "0112202401179001234500110010020000009021234567813",
                            "1234567891",
                            List.of(
                                    new InvoiceLineSeed("TEC-002", 1, 380.0),
                                    new InvoiceLineSeed("TEC-004", 2, 42.0))),
                    new InvoiceSeed(
                            false,
                            "Estudio Creativo Lúmina",
                            "0992233445001",
                            "admin@lumina.ec",
                            "Calle Larga 8-44, Cuenca",
                            daysAgo(1),
                            903,
                            "001-002-000000903",
                            "0112202401179001234500110010020000009031234567814",
                            "1234567892",
                            List.of(
                                    new InvoiceLineSeed("OFI-001", 2, 320.0),
                                    new InvoiceLineSeed("OFI-002", 1, 540.0))));
        }

        private static LocalDateTime daysAgo(int days) {
            return LocalDateTime.now().minusDays(days);
        }
    }
}
