package com.adrian.inventory.controller;

import com.adrian.inventory.dto.InventorySummary;
import com.adrian.inventory.dto.ProductRequest;
import com.adrian.inventory.dto.ProductResponse;
import com.adrian.inventory.dto.StockAdjustRequest;
import com.adrian.inventory.security.UserPrincipal;
import com.adrian.inventory.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public List<ProductResponse> getAll(@AuthenticationPrincipal UserPrincipal principal) {
        return productService.findAll(principal.getUser());
    }

    @GetMapping("/summary")
    public InventorySummary getSummary(@AuthenticationPrincipal UserPrincipal principal) {
        return productService.getSummary(principal.getUser());
    }

    @GetMapping("/{id}")
    public ProductResponse getById(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        return productService.findById(id, principal.getUser());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProductResponse create(
            @Valid @RequestBody ProductRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return productService.create(request, principal.getUser());
    }

    @PutMapping("/{id}")
    public ProductResponse update(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return productService.update(id, request, principal.getUser());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        productService.delete(id, principal.getUser());
    }

    @PostMapping("/{id}/stock")
    public ProductResponse addStock(
            @PathVariable Long id,
            @Valid @RequestBody StockAdjustRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return productService.addStock(id, request.quantity(), principal.getUser());
    }
}
