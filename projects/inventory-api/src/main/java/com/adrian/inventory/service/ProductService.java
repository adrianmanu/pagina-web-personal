package com.adrian.inventory.service;

import com.adrian.inventory.model.Product;
import com.adrian.inventory.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<Product> findAll() {
        return productRepository.findAll();
    }

    public Product findById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado: " + id));
    }

    public Product create(Product product) {
        productRepository.findBySku(product.getSku()).ifPresent(existing -> {
            throw new RuntimeException("SKU duplicado: " + product.getSku());
        });
        return productRepository.save(product);
    }

    public Product update(Long id, Product updated) {
        Product existing = findById(id);
        existing.setName(updated.getName());
        existing.setSku(updated.getSku());
        existing.setStock(updated.getStock());
        existing.setPrice(updated.getPrice());
        existing.setCategory(updated.getCategory());
        return productRepository.save(existing);
    }

    public void delete(Long id) {
        if (!productRepository.existsById(id)) {
            throw new RuntimeException("Producto no encontrado: " + id);
        }
        productRepository.deleteById(id);
    }
}
