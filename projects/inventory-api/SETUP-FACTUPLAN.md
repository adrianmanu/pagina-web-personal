# Configurar Factuplan + StockFlow (SaaS SRI)

Motor SRI recomendado para **StockFlow en internet** con multi-RUC, carga de firma por API y webhooks.

Documentación Factuplan: [factuplan.com.ec/api](https://factuplan.com.ec/api)

---

## Paso 1 — Cuenta y API Key

1. Entra a [app.factuplan.com.ec](https://app.factuplan.com.ec) (cuenta ya creada).
2. Ve a **Developer → Create API key**.
3. Copia la clave de **pruebas** (`ak_test_...`) — solo se muestra una vez.
4. Para producción más adelante: `ak_live_...` + certificado `.p12` vigente.

---

## Paso 2 — Variables en `.env`

```env
# Proveedor SRI (datil | factuplan)
SRI_PROVIDER=factuplan
FACTUPLAN_ENABLED=true
FACTUPLAN_API_KEY=ak_test_tu_clave_aqui

# Datos del emisor (se reutilizan como perfil del negocio)
DATIL_RUC=1713581054001
DATIL_RAZON_SOCIAL=ACOSTA ARIAS ANA DEL ROCIO
DATIL_DIRECCION=B-0 Nro 15 y Calle C-OE7, Quito
DATIL_ESTABLECIMIENTO=001
DATIL_PUNTO_EMISION=002
DATIL_IVA_RATE=15
DATIL_PRICES_INCLUDE_IVA=true

# Desactiva Datil si migras por completo
DATIL_ENABLED=false
```

Reinicia el backend después de guardar.

---

## Paso 3 — Subir firma electrónica (producción)

Con `ak_test_*` **no necesitas** certificado real (Factuplan simula la firma).

En producción (`ak_live_*`):

```bash
curl -X POST http://localhost:8080/api/settings/sri/certificate \
  -H "Authorization: Bearer TU_JWT" \
  -F "file=@ruta/a/firma.p12" \
  -F "password=CONTRASEÑA_DEL_P12"
```

O desde la UI (Fase 12C): Configuración → Conexión SRI.

Verificar estado:

```bash
curl http://localhost:8080/api/settings/sri/certificate/status \
  -H "Authorization: Bearer TU_JWT"
```

---

## Paso 4 — Probar factura

1. Login en StockFlow.
2. Completa onboarding (RUC, punto de emisión).
3. Crea un producto y emite factura.
4. El backend usa Factuplan automáticamente cuando `SRI_PROVIDER=factuplan`.

Config SRI:

```bash
curl http://localhost:8080/api/invoices/sri/config \
  -H "Authorization: Bearer TU_JWT"
```

Debe mostrar `"provider": "factuplan"` y `"configured": true`.

---

## Endpoints nuevos (Fase 12)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/settings/sri/config` | Proveedor y estado |
| GET | `/api/settings/sri/certificate/status` | Vigencia del P12 en Factuplan |
| POST | `/api/settings/sri/verify` | Verificar API + certificado |
| POST | `/api/webhooks/factuplan` | Webhooks Factuplan (HMAC, sin JWT) |

### Webhooks (Fase 12D)

1. En Factuplan Dashboard → Developer → Webhooks, apunta a `https://tu-dominio/api/webhooks/factuplan`.
2. Copia el **webhook secret** a `.env`:

```env
FACTUPLAN_WEBHOOK_SECRET=whsec_tu_secreto
```

3. Eventos soportados: `invoice.*`, `credit_note.*`, `debit_note.*`, `waybill.*`, `withholding.*`.
4. StockFlow busca el comprobante por `datil*Id` (ID Factuplan) y refresca el estado SRI automáticamente.

---

## Qué cubre hoy vs. próximas sub-fases

| Comprobante | Factuplan en StockFlow |
|-------------|------------------------|
| Factura | ✅ 12B |
| Nota de crédito | ✅ 12D |
| Nota de débito | ✅ 12D |
| Guía de remisión | ✅ 12D |
| Retención | ✅ 12D |
| Liquidación de compra | ⏸ Sin endpoint REST (solo Datil o XML futuro) |
| Webhooks HMAC | ✅ 12D — `POST /api/webhooks/factuplan` |
| Wizard UI onboarding SRI | ✅ 12C |
| Verificar conexión (`POST /api/settings/sri/verify`) | ✅ 12C |

---

## Modelo SaaS (membresía todo incluido)

- **Tú** tienes una API Key maestra de Factuplan.
- **Cada cliente** sube su `.p12`; StockFlow envía `x-taxpayer-ruc` por negocio.
- **Cobras** membresía StockFlow (mensual/anual) incluyendo el costo del motor SRI.

---

*Última actualización: junio 2026*
