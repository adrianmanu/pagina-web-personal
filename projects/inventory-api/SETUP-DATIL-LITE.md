# Configurar Datil Lite + StockFlow (facturación SRI)

**Contribuyente:** ACOSTA ARIAS ANA DEL ROCIO · RUC `1713581054001`  
**Plan recomendado:** Datil **Lite mensual** (~$8/mes, 60 facturas/mes, API incluida)

> Datil Lite usa la **misma API** que Mini/Plus/Pro. No hay código distinto por plan; solo cambia el límite de facturas y el precio de la suscripción.

---

## Parte 1 — Antes de Datil (SRI en línea)

1. Entra a [srienlinea.sri.gob.ec](https://srienlinea.sri.gob.ec) con tu RUC y clave.
2. Ve a **Facturación electrónica** → **Registro de emisión**.
3. Verifica o crea:
   - **Establecimiento:** `001`
   - **Punto de emisión:** `001`
4. Si es la primera vez, solicita la **autorización** de comprobantes electrónicos (factura).
5. Anota el **secuencial inicial** que te asigne el SRI (StockFlow genera el siguiente automáticamente).

---

## Parte 2 — Crear cuenta Datil Lite

### Paso 1: Registro

1. Abre [datil.com/planes](https://datil.com/planes).
2. Arriba elige **「Por Mes」** (no Por Año).
3. Selecciona **Lite — $8/mes** (hasta 60 documentos/mes, incluye API).
4. Clic en **Empieza ahora** / registro.
5. Completa:
   - **RUC:** `1713581054001`
   - **Razón social:** `ACOSTA ARIAS ANA DEL ROCIO`
   - **Nombre comercial:** el de tu negocio (puede ser el mismo)
   - Correo y teléfono de contacto

Alternativa de registro: [onboarding.datil.com](https://onboarding.datil.com) o [hq.datil.com/ec/facturacion-electronica](https://hq.datil.com/ec/facturacion-electronica).

### Paso 2: Subir firma electrónica (.p12)

El archivo **no va en StockFlow**; va en el panel de Datil.

1. Inicia sesión en [app.datil.co](https://app.datil.co).
2. Menú **Configuración** (o **Firma electrónica** / **Certificado**).
3. **Subir certificado** → selecciona tu archivo:
   ```
   D:\5959420_identity_1713581054.p12
   ```
4. Ingresa la contraseña del certificado cuando te la pida.
5. Espera a que Datil valide el certificado (debe estar vigente y coincidir con el RUC).

### Paso 3: Configurar emisor en Datil

En Datil, revisa que coincidan con el SRI:

| Campo | Valor |
|-------|-------|
| RUC | `1713581054001` |
| Razón social | `ACOSTA ARIAS ANA DEL ROCIO` |
| Obligado a llevar contabilidad | **NO** |
| Establecimiento | `001` |
| Punto de emisión | `001` |
| Dirección | B-0 Nro 15 y Calle C-OE7, El Porvenir, Cotocolla, Quito |

### Paso 4: Obtener API Key

1. En [app.datil.co](https://app.datil.co) → **Configuración** → sección **API** / **API Key**.
2. Copia la clave (o créala si no existe).
3. Abre `projects/inventory-api/.env` y reemplaza:
   ```
   DATIL_API_KEY=PENDIENTE-COPIAR-DE-APP-DATIL-CO
   ```
   por tu clave real.

### Paso 5: Ambiente de pruebas primero

En `.env` deja:

```
DATIL_AMBIENTE=1
```

- `1` = **Pruebas SRI** (comprobantes de prueba, sin validez fiscal).
- `2` = **Producción** (facturas reales) — solo cuando una prueba salga bien.

---

## Parte 3 — Levantar StockFlow en tu PC

### Requisitos

- **Java 17+** y **Maven** (o usar el wrapper si existe).
- **Node.js** para el frontend.

### Backend (PowerShell)

```powershell
cd "d:\Postular\Pagina web_personal\projects\inventory-api"

Get-Content .env | ForEach-Object {
  if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
    [Environment]::SetEnvironmentVariable($matches[1].Trim(), $matches[2].Trim(), 'Process')
  }
}

mvn spring-boot:run
```

API: http://localhost:8080 · Swagger: http://localhost:8080/swagger-ui.html

### Frontend (otra terminal)

```powershell
cd "d:\Postular\Pagina web_personal\projects\inventory-api\frontend"
npm install
npm run dev
```

Abre: http://localhost:5176

---

## Parte 4 — Probar la primera factura

1. Regístrate o inicia sesión en StockFlow.
2. Crea al menos un **producto** con precio.
3. Ve a **Facturación** → emite factura a **consumidor final** (más simple para la primera prueba).
4. Revisa el estado SRI en pantalla: `ENVIADO`, `AUTORIZADO`, etc.
5. Si hay error, lee el mensaje y revisa API Key, contraseña del .p12 y datos del emisor en Datil.

Cuando una factura de **prueba** quede **AUTORIZADA**, cambia en `.env`:

```
DATIL_AMBIENTE=2
```

y reinicia el backend.

---

## Resumen de archivos y credenciales

| Qué | Dónde va |
|-----|----------|
| Archivo `.p12` | Solo en **panel Datil** (subida manual) |
| Contraseña del .p12 | `.env` → `DATIL_CERTIFICATE_PASSWORD` |
| API Key | `.env` → `DATIL_API_KEY` (desde app.datil.co) |
| RUC y datos del emisor | Ya en `.env` (según consulta RUC) |

---

## Costos Datil Lite

| Concepto | Monto |
|----------|-------|
| Plan Lite mensual | ~$8/mes + impuestos |
| Comisión por factura | $0 (el plan incluye hasta 60 docs/mes) |
| Cuando funcione y quieras ahorrar | Puedes bajar a **Mini anual** $25/año (12 docs/mes) si el volumen es bajo |

---

## Soporte

- Documentación API: [datil.dev](https://datil.dev)
- Chat Datil: desde app.datil.co (prueba sin costo / dudas de activación)
