# API de Inventario Empresarial v2

Plataforma full stack con **login, registro, dashboard y CRUD** de productos.

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18, TypeScript, React Router |
| Backend | Spring Boot 3.4, Spring Security, JWT |
| Base de datos | H2 (dev) / PostgreSQL (prod) |

## Funcionalidades


- Registro e inicio de sesión con JWT
- Dashboard con KPIs de inventario y ventas
- CRUD de productos (nombre, SKU, stock, precio, categoría)
- **Facturación**: emisión de facturas con descuento automático de stock
- Facturas a **consumidor final** o con **datos completos** (nombre, cédula/RUC, correo, dirección)
- Validación de stock insuficiente al vender
- Reposición rápida de stock sin editar el producto
- Resumen por categoría e historial de facturas con detalle
- Documentación Swagger

## Ejecución local

### Backend (puerto 8080)

```bash
cd projects/inventory-api
mvn spring-boot:run
```

API docs: http://localhost:8080/swagger-ui.html

### Frontend (puerto 5176)

```bash
cd projects/inventory-api/frontend
npm install
npm run dev
```

Abre: http://localhost:5176

## Arquitectura

```
backend/src/main/java/com/adrian/inventory/
├── controller/   # REST endpoints
├── service/      # Lógica de negocio
├── repository/   # Spring Data JPA
├── model/        # Entidades
├── dto/          # Request/Response
├── security/     # JWT + filtros
└── config/       # Security, CORS

frontend/src/
├── api/          # Cliente HTTP
├── context/      # Auth
├── pages/        # Login, Dashboard, Productos
└── components/   # UI reutilizable
```
