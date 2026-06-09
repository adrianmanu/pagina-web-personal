# API de Inventario Empresarial

API REST con Spring Boot, arquitectura en capas (Controller → Service → Repository) y documentación Swagger.

## Requisitos

- Java 17+
- Maven 3.8+

## Ejecución

```bash
cd projects/inventory-api
mvn spring-boot:run
```

- API: `http://localhost:8080/api/products`
- Swagger: `http://localhost:8080/swagger-ui.html`
- H2 Console: `http://localhost:8080/h2-console`

## MySQL (producción)

En `application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/inventory_db
spring.datasource.username=root
spring.datasource.password=tu_password
spring.jpa.hibernate.ddl-auto=update
```

## Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/products` | Listar productos |
| GET | `/api/products/{id}` | Obtener producto |
| POST | `/api/products` | Crear producto |
| PUT | `/api/products/{id}` | Actualizar producto |
| DELETE | `/api/products/{id}` | Eliminar producto |
