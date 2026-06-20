# Guía de usuario — StockFlow

StockFlow es tu sistema de inventario y facturación electrónica para Ecuador (integración Datil / SRI).

## 1. Primer acceso

1. Regístrate en **Crear cuenta** con email y contraseña.
2. Completa el **asistente de configuración** (onboarding):
   - Datos del negocio (RUC, razón social)
   - Punto de emisión (establecimiento + punto)
   - Confirmación de Datil/SRI en el servidor
3. Crea al menos un **producto** en el menú Productos.

## 2. Flujo de venta recomendado

### Proforma → Factura

1. **Proformas**: arma la cotización (no va al SRI).
2. Pulsa **Facturar** para convertirla en factura electrónica.
3. Espera estado **AUTORIZADO** y descarga el PDF (RIDE).

### Factura directa

1. **Facturación**: selecciona productos y emite.
2. Usa **Actualizar SRI** si el estado queda en RECIBIDO.

## 3. Devoluciones

En **Facturación**, expande una factura autorizada y crea **Nota de crédito** (total o parcial).

## 4. Compras y contabilidad

| Menú | Uso |
|------|-----|
| Docs. recibidos | Facturas de proveedores (XML o manual) |
| Retenciones | Comprobantes de retención emitidos |
| ATS | Anexo transaccional mensual → exportar ZIP |

## 5. Roles

| Rol | Permisos |
|-----|----------|
| **ADMIN** | Todo + configuración |
| **CAJERO** | Ventas, proformas, facturas (sin ATS export ni configuración) |
| **CONTADOR** | Solo lectura + exportar ATS |

## 6. PWA (móvil)

En Chrome/Edge: menú → **Instalar aplicación**. Abre StockFlow como app en el local.

## 7. Impresión térmica

En facturas autorizadas usa **Imprimir ticket** (vista 80 mm) desde Facturación.

## 8. Notificaciones por email

Configura **Email notificaciones** en Configuración. Al autorizar una factura con email de cliente, el sistema registra el envío (PDF vía Datil).

## 9. Multi-sucursal

En **Configuración → Puntos de emisión** agrega establecimientos adicionales (001, 002, …).

## 10. Soporte Datil

- Ambiente pruebas: `DATIL_AMBIENTE=1`
- Secuencial: actualiza `DATIL_SECUENCIAL_INICIAL` en `.env` del servidor
- Documentación técnica: `SETUP-DATIL-LITE.md` y `ROADMAP-FACTURACION.md`

---

**Usuario de prueba Fase 10:** `fase10@stockflow.dev` / `test1234`
