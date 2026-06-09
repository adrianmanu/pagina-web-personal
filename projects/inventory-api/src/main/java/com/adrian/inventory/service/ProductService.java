package com.adrian.inventory.service;

import com.adrian.inventory.dto.InventorySummary;
import com.adrian.inventory.dto.ProductRequest;
import com.adrian.inventory.dto.ProductResponse;
import com.adrian.inventory.exception.ApiException;
import com.adrian.inventory.model.Product;
import com.adrian.inventory.model.User;
import com.adrian.inventory.repository.ProductRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<ProductResponse> findAll(User user) {
        return productRepository.findByUserId(user.getId()).stream()
                .map(ProductResponse::from)
                .toList();
    }

    public ProductResponse findById(Long id, User user) {
        return ProductResponse.from(getOwnedProduct(id, user));
    }

    public ProductResponse create(ProductRequest request, User user) {
        productRepository.findBySkuAndUserId(request.sku(), user.getId()).ifPresent(existing -> {
            throw new ApiException(HttpStatus.CONFLICT, "SKU duplicado: " + request.sku());
        });

        Product product = new Product();
        product.setUser(user);
        applyRequest(product, request);
        return ProductResponse.from(productRepository.save(product));
    }

    public ProductResponse update(Long id, ProductRequest request, User user) {
        Product existing = getOwnedProduct(id, user);

        productRepository.findBySkuAndUserId(request.sku(), user.getId()).ifPresent(other -> {
            if (!other.getId().equals(id)) {
                throw new ApiException(HttpStatus.CONFLICT, "SKU duplicado: " + request.sku());
            }
        });

        applyRequest(existing, request);
        return ProductResponse.from(productRepository.save(existing));
    }

    public void delete(Long id, User user) {
        Product product = getOwnedProduct(id, user);
        productRepository.delete(product);
    }

    public ProductResponse addStock(Long id, int quantity, User user) {
        Product product = getOwnedProduct(id, user);
        int current = product.getStock() == null ? 0 : product.getStock();
        product.setStock(current + quantity);
        return ProductResponse.from(productRepository.save(product));
    }

    public InventorySummary getSummary(User user) {
        List<Product> products = productRepository.findByUserId(user.getId());

        long totalStock = products.stream().mapToLong(p -> p.getStock() == null ? 0 : p.getStock()).sum();
        double inventoryValue = products.stream()
                .mapToDouble(p -> (p.getStock() == null ? 0 : p.getStock()) * (p.getPrice() == null ? 0 : p.getPrice()))
                .sum();

        Map<String, List<Product>> byCategory = products.stream()
                .collect(Collectors.groupingBy(p -> p.getCategory() == null ? "Sin categoría" : p.getCategory()));

        List<InventorySummary.CategorySummary> categories = byCategory.entrySet().stream()
                .map(entry -> {
                    long stock = entry.getValue().stream().mapToLong(p -> p.getStock() == null ? 0 : p.getStock()).sum();
                    double value = entry.getValue().stream()
                            .mapToDouble(p -> (p.getStock() == null ? 0 : p.getStock()) * (p.getPrice() == null ? 0 : p.getPrice()))
                            .sum();
                    return new InventorySummary.CategorySummary(entry.getKey(), entry.getValue().size(), stock, Math.round(value * 100.0) / 100.0);
                })
                .toList();

        return new InventorySummary(
                products.size(),
                totalStock,
                Math.round(inventoryValue * 100.0) / 100.0,
                categories
        );
    }

    private Product getOwnedProduct(Long id, User user) {
        return productRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Producto no encontrado"));
    }

    private void applyRequest(Product product, ProductRequest request) {
        product.setName(request.name());
        product.setSku(request.sku());
        product.setStock(request.stock());
        product.setPrice(request.price());
        product.setCategory(request.category());
    }
}
