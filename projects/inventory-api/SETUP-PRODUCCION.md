# StockFlow — Despliegue en servidor (modo pruebas)

Guía para tener **dos entornos**:

| Entorno | Dónde | Qué hace |
|---------|-------|----------|
| **Demo portafolio** | GitHub Pages / Cloudflare | Frontend solo, datos en `localStorage`, sin backend |
| **Servidor pruebas** | Render + frontend live | API real, Factuplan `ak_test_*`, PayPhone, SRI ambiente 1 |

---

## 1. Demo del portafolio (automático)

Al hacer `push` a `main`, el workflow `.github/workflows/deploy-pages.yml` compila el frontend **sin** `VITE_USE_LIVE_API`.

- URL: `https://TU_USUARIO.github.io/TU_REPO/apps/inventory-api/`
- Credenciales: `demo@stockflow.dev` / `demo1234`
- Botón «Explorar con cuenta demo» en el login
- Datos precargados: productos, clientes, facturas SRI simuladas

No requiere servidor ni variables secretas.

---

## 2. Backend en Render (modo pruebas SRI)

### Crear servicio Web

1. [render.com](https://render.com) → **New Web Service**
2. Conecta el repositorio
3. **Root Directory:** `projects/inventory-api`
4. **Runtime:** Docker (usa el `Dockerfile` incluido)
5. **Plan:** Free o Starter

### Variables de entorno (pestaña Environment)

Copia desde `.env.example` y usa **modo pruebas**:

```env
APP_JWT_SECRET=genera-un-secreto-largo-unico

SRI_PROVIDER=factuplan
FACTUPLAN_ENABLED=true
FACTUPLAN_API_KEY=ak_test_...
FACTUPLAN_API_URL=https://api-rest.factuplan.com.ec

MEMBERSHIP_ENFORCEMENT=false
MEMBERSHIP_TRIAL_DAYS=14

PAYPHONE_ENABLED=true
PAYPHONE_TOKEN=...
PAYPHONE_STORE_ID=...
PAYPHONE_RESPONSE_URL=https://adrian-ramos.pages.dev/apps/stockflow-live/membresia

STOCKFLOW_SEED_DEMO=true
```

**Postgres (recomendado en Render):**

```env
SPRING_DATASOURCE_URL=jdbc:postgresql://...
SPRING_DATASOURCE_USERNAME=...
SPRING_DATASOURCE_PASSWORD=...
```

Sin Postgres usa H2 en memoria (se pierden datos al reiniciar).

### PayPhone en producción

En PayPhone Developer, crea app **WEB**:

| Campo | Valor |
|-------|-------|
| Dominio | URL del frontend live (ej. `https://adrian-ramos.pages.dev`) |
| URL respuesta | `PAYPHONE_RESPONSE_URL` (ruta `/membresia`) |

Token y Store ID: pestaña **Credenciales** (no Detalles).

### Probar API

```bash
curl https://tu-api.onrender.com/health
```

Login: `POST /api/auth/login` con `demo@stockflow.dev` / `demo1234` (si `STOCKFLOW_SEED_DEMO=true`).

---

## 3. Frontend conectado al servidor

En tu máquina o en un segundo deploy de Cloudflare Pages:

```powershell
cd projects/inventory-api/frontend
copy .env.example .env
# Edita .env:
#   VITE_USE_LIVE_API=true
#   VITE_API_BASE_URL=https://tu-api.onrender.com

npm ci
npm run build
```

Sube la carpeta `dist/` a una ruta como `/apps/stockflow-live/` en Cloudflare o GitHub Pages.

**Script incluido:**

```powershell
.\scripts\build-stockflow-live.ps1 -ApiBaseUrl "https://tu-api.onrender.com" -BasePath "/apps/stockflow-live/"
```

---

## 4. Checklist modo pruebas (servidor)

- [ ] `FACTUPLAN_API_KEY` empieza con `ak_test_`
- [ ] `MEMBERSHIP_ENFORCEMENT=false` hasta validar pagos
- [ ] `PAYPHONE_RESPONSE_URL` apunta al frontend live real
- [ ] CORS: el backend ya permite `*.pages.dev` y `*.github.io`
- [ ] Registro → trial 14 días → emitir factura en **Facturación**
- [ ] **Configuración** → Verificar conexión SRI (mensaje claro en test)
- [ ] **Membresía** → checkout PayPhone (tarjeta de prueba PayPhone)
- [ ] Script E2E: `.\scripts\e2e-payphone-membresia.ps1`

---

## 5. Pasar a producción real

Cuando todo funcione en pruebas:

1. `FACTUPLAN_API_KEY` → clave de producción (`ak_live_...`)
2. Subir certificado P12 real en Configuración
3. `MEMBERSHIP_ENFORCEMENT=true`
4. `APP_JWT_SECRET` fuerte y único
5. `STOCKFLOW_SEED_DEMO=false`
6. Postgres obligatorio

Ver también: [SETUP-FACTUPLAN.md](./SETUP-FACTUPLAN.md), [SETUP-MEMBRESIAS.md](./SETUP-MEMBRESIAS.md).
