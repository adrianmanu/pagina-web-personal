# Membresías StockFlow (Fase 13)

Cobro SaaS con **PayPhone** (Ecuador) y periodo de prueba automático. Stripe queda como opción internacional.

---

## Modelo

| Plan | Precio ref. | Incluye |
|------|-------------|---------|
| **Trial** | 14 días gratis | Todo el sistema; se crea al registrarse |
| **Starter** | USD 19/mes | Inventario + facturación SRI (Factuplan incluido) |
| **Pro** | USD 39/mes | Starter + ATS, retenciones, soporte prioritario |

Cada pago PayPhone activa el plan por **30 días**. PayPhone no maneja suscripciones recurrentes automáticas; el usuario renueva manualmente cada mes.

Si la membresía vence, **no se pueden emitir** comprobantes SRI (HTTP 402). Consulta e inventario siguen activos.

---

## Variables `.env`

```env
# Desarrollo: no bloquear emisión sin pago
MEMBERSHIP_ENFORCEMENT=false
MEMBERSHIP_TRIAL_DAYS=14

# PayPhone — Ecuador (recomendado)
PAYPHONE_ENABLED=true
PAYPHONE_TOKEN=tu_token
PAYPHONE_STORE_ID=tu_store_id
PAYPHONE_RESPONSE_URL=http://localhost:5176/membresia

# Stripe — opcional (no disponible para cuentas ecuatorianas)
STRIPE_ENABLED=false
```

---

## Configurar PayPhone

### 1. Cuenta Business + usuario Desarrollador

1. Regístrate en [PayPhone Business](https://payphone.app/) con RUC o cédula.
2. **Importante:** la cuenta Business **no entra sola** a Developer. Debes crear un usuario con rol **Desarrollador**:
   - En PayPhone Business → menú **Usuarios** → **Crear usuario**
   - Nombre, apellidos, correo, contraseña
   - Rol: **Desarrollador**
   - Asocia al menos una **tienda** activa
   - Guardar
3. Cierra sesión en Developer si intentaste con el usuario admin.
4. Entra a [PayPhone Developer — login](https://appdeveloper.payphonetodoesposible.com/login) con:
   - **RUC** (o cédula) del negocio
   - **Correo** del usuario **Desarrollador** (no necesariamente el del admin)
   - **Contraseña** del usuario Desarrollador

> Si ves **“Acceso denegado”** en Developer, casi siempre falta el usuario con rol Desarrollador o estás usando el correo del administrador en lugar del desarrollador.

### 2. Aplicación WEB en Developer

| Campo | Valor desarrollo |
|-------|------------------|
| Dominio web | `http://localhost:5176` *(con `http://`, no solo `localhost:5176`)* |
| URL de respuesta | `http://localhost:5176/membresia` |

En producción usa tu dominio real (ej. `https://app.tudominio.com/membresia`).

### 3. Credenciales

En la pestaña **Credenciales** de tu aplicación (no confundir con Detalles):

- **Token** → `PAYPHONE_TOKEN`
- **StoreID** → `PAYPHONE_STORE_ID`

Detalles muestra Identificador, Id Cliente y Clave secreta; el cobro API usa Token y StoreID de **Credenciales**.

### 4. Ambiente de pruebas

En PayPhone Developer activa el **entorno de pruebas** y usa tarjetas de test que indique la plataforma.

### 5. Reiniciar backend

```powershell
cd projects/inventory-api
Get-Content .env | ForEach-Object {
  if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
    [Environment]::SetEnvironmentVariable($matches[1].Trim(), $matches[2].Trim(), 'Process')
  }
}
mvn spring-boot:run
```

---

## Flujo de pago

1. Usuario en `/membresia` → **Pagar con PayPhone**
2. Backend crea transacción y llama `POST /api/button/Prepare`
3. Redirección a página de pago PayPhone
4. Tras pagar, PayPhone redirige a `/membresia?id=...&clientTransactionId=...`
5. Frontend llama `POST /api/membership/confirm`
6. Backend confirma con PayPhone `POST /api/button/V2/Confirm`
7. Membresía activa 30 días → `canEmit=true`

> PayPhone revierte el cobro si no confirmas en **5 minutos**.

---

## API

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/membership/status` | Estado del usuario |
| GET | `/api/membership/plans` | Planes disponibles |
| GET | `/api/membership/billing-provider` | `payphone` / `stripe` / `manual` |
| POST | `/api/membership/checkout` | `{ "plan": "STARTER" \| "PRO" }` → URL PayPhone |
| POST | `/api/membership/confirm` | `{ "id": 123, "clientTxId": "SF..." }` |

---

## UI

- Menú **Membresía** (`/membresia`) — estado, planes, botón PayPhone.
- Banner superior si `canEmit=false`.

---

## Stripe (opcional)

Solo si tienes empresa en un país soportado por Stripe. Ver `scripts/setup-stripe-test.ps1` y variables `STRIPE_*`.

---

*Última actualización: junio 2026*
