package com.adrian.inventory.repository;

import com.adrian.inventory.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByUserId(Long userId);
    Optional<Product> findByIdAndUserId(Long id, Long userId);
    Optional<Product> findBySkuAndUserId(String sku, Long userId);
    long countByUserId(Long userId);
}
