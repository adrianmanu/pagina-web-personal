# API de Inventario Empresarial v2

Plataforma full stack con **login, registro, dashboard y CRUD** de productos.

> **Demo en línea:** la versión en GitHub Pages funciona en *modo demo* (datos en el navegador, sin servidor). Para pruebas SRI reales con Factuplan y PayPhone, ver [SETUP-PRODUCCION.md](./SETUP-PRODUCCION.md).

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
- **Facturación electrónica SRI** (opcional): integración con [Datil](https://datil.dev) para comprobantes autorizados
- **Roadmap facturación completa** (notas de crédito, retenciones, ATS, etc.): [ROADMAP-FACTURACION.md](./ROADMAP-FACTURACION.md)
- **Fase 1 (base SRI):** número de comprobante `001-002-XXXXXX`, RIDE/PDF, reemisión, secuenciales por tipo
- **Fase 2 (clientes):** catálogo CRUD, búsqueda al facturar, historial por cliente
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

## Facturación electrónica SRI (Datil Lite)

**Guía completa:** [SETUP-DATIL-LITE.md](./SETUP-DATIL-LITE.md)

### 1. Requisitos

- Cuenta **Datil Lite** mensual (~$8/mes) o el plan que elijas — [datil.com/planes](https://datil.com/planes) → **Por Mes** → Lite
- API Key desde [app.datil.co](https://app.datil.co) → Configuración → API
- Certificado `.p12` **subido en el panel de Datil** (no en este servidor)
- Contraseña del `.p12` en `DATIL_CERTIFICATE_PASSWORD`
- RUC, razón social y establecimiento `001` / punto `001` alineados con SRI en línea

### 2. Configurar variables de entorno

Copia `.env.example` a `.env` y completa tus datos:

```bash
cd projects/inventory-api
cp .env.example .env   # en Windows: copy .env.example .env
```

Variables principales:

| Variable | Descripción |
|----------|-------------|
| `DATIL_ENABLED` | `true` para activar SRI |
| `DATIL_API_KEY` | Clave API de Datil |
| `DATIL_CERTIFICATE_PASSWORD` | Contraseña del certificado .p12 |
| `DATIL_AMBIENTE` | `1` pruebas · `2` producción |
| `DATIL_RUC` | Tu RUC |
| `DATIL_RAZON_SOCIAL` | Razón social |

### 3. Levantar en modo live (backend + SRI)

**PowerShell (backend):**

```powershell
cd projects/inventory-api
Get-Content .env | ForEach-Object {
  if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
    [Environment]::SetEnvironmentVariable($matches[1].Trim(), $matches[2].Trim(), 'Process')
  }
}
mvn spring-boot:run
```

**Frontend con API real:**

```bash
cd projects/inventory-api/frontend
cp .env.example .env
npm install
npm run dev
```

El archivo `frontend/.env` debe tener `VITE_USE_LIVE_API=true`.

### 4. Probar

1. Regístrate o inicia sesión en http://localhost:5176
2. Crea productos en **Productos**
3. Emite una factura en **Facturación**
4. Verifica el estado SRI: `AUTORIZADO`, `ENVIADO`, etc.
5. Empieza siempre en **ambiente de pruebas** (`DATIL_AMBIENTE=1`)

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
