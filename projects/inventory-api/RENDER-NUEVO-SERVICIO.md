# Crear StockFlow API en Render (Docker) — guía completa

Tu cuenta Render tiene:

| Servicio | Qué es | Acción |
|----------|--------|--------|
| `pagina-web-personal` | Portafolio (Python/otro) | **No tocar** para StockFlow |
| `stockflow-db` | PostgreSQL | **Reutilizar** — ya existe |
| *(falta)* | API Spring Boot | **Crear** en esta guía |

`pagina-web-personal` **no** puede ejecutar StockFlow: el backend es Java/Spring Boot y necesita **Docker**, no Python/uvicorn.

---

## Parte 1 — Crear el Web Service (Docker)

1. Entra a [dashboard.render.com](https://dashboard.render.com).
2. Arriba a la derecha: **New +** → **Web Service**.
3. Conecta el repositorio **GitHub** `adrianmanu/pagina-web-personal` (si no está, autoriza Render en GitHub primero).
4. Configura el formulario **exactamente** así:

| Campo | Valor |
|-------|-------|
| **Name** | `stockflow-api` (o el nombre que prefieras) |
| **Region** | **Oregon (US West)** — misma región que `stockflow-db` |
| **Branch** | `main` |
| **Root Directory** | `projects/inventory-api` |
| **Runtime** | **Docker** |
| **Dockerfile Path** | `Dockerfile` (por defecto, dentro del root directory) |
| **Instance Type** | Free |

5. **No** pongas Build Command ni Start Command — Docker los define en el `Dockerfile`.
6. **Advanced** (opcional pero recomendado):
   - **Health Check Path**: `/health`
7. Clic en **Create Web Service**.

Render empezará el primer build (Maven + JAR, ~5–10 min la primera vez).

---

## Parte 2 — Vincular PostgreSQL (`stockflow-db`)

Tienes dos formas equivalentes. Usa **solo una** (recomendada: opción A).

### Opción A — Enlazar desde el panel (recomendado)

1. En el servicio `stockflow-api` → menú lateral **Connections** (o desde `stockflow-db` → **Connect**).
2. **Add connection** → selecciona `stockflow-db`.
3. Render inyecta automáticamente `DATABASE_URL` (host interno).
4. El código `RenderDatabaseConfig.java` convierte esa URL a JDBC para Spring Boot.

### Opción B — Variables JDBC manuales

Si no usas enlace automático, en **Environment** agrega (valores en tu `.env.render` local):

```
SPRING_DATASOURCE_URL=jdbc:postgresql://dpg-d8qu13r7uimc73edtks0-a:5432/stockflow_db_lu2j
SPRING_DATASOURCE_USERNAME=stockflow_db_lu2j_user
SPRING_DATASOURCE_PASSWORD=<tu contraseña de stockflow-db>
```

**No** mezcles `DATABASE_URL` + `SPRING_DATASOURCE_*` a la vez si puedes evitarlo.

---

## Parte 3 — Variables de entorno

1. Servicio `stockflow-api` → pestaña **Environment**.
2. **Add from .env** y sube el archivo local:

   `projects/inventory-api/.env.render`

   (Ese archivo **no** va a git; está en `.gitignore`.)

3. Si pegas a mano, incluye al menos:

| Variable | Valor / notas |
|----------|----------------|
| `APP_JWT_SECRET` | Cadena larga aleatoria (ya en `.env.render`) |
| `STOCKFLOW_SEED_DEMO` | `true` — crea `demo@stockflow.dev` / `demo1234` |
| `SRI_PROVIDER` | `factuplan` |
| `FACTUPLAN_ENABLED` | `true` |
| `FACTUPLAN_API_KEY` | `ak_test_...` |
| `FACTUPLAN_API_URL` | `https://api-rest.factuplan.com.ec` |
| `DATIL_ENABLED` | `false` |
| `MEMBERSHIP_ENFORCEMENT` | `false` |
| `MEMBERSHIP_TRIAL_DAYS` | `14` |
| `PAYPHONE_ENABLED` | `true` |
| `PAYPHONE_TOKEN` | Token de PayPhone Developer |
| `PAYPHONE_STORE_ID` | Store ID de la app |
| `PAYPHONE_RESPONSE_URL` | Ver Parte 5 |

4. **Borra** si aparecen (son del servicio Python viejo):

   - `PYTHON_VERSION`
   - `SECRET_KEY`
   - `CORS_ORIGINS`

5. **Save Changes** → Render redeploya solo.

---

## Parte 4 — Verificar el deploy

1. Pestaña **Logs**. Debes ver algo como:

   ```
   Started InventoryApiApplication
   ```

   **No** debe aparecer `uvicorn` ni `pip install`.

2. Copia la URL del servicio, por ejemplo:

   `https://stockflow-api.onrender.com`

   (Render asigna un sufijo si el nombre está ocupado.)

3. Prueba health (plan Free: espera 30–90 s en cold start):

   ```powershell
   Invoke-RestMethod "https://TU-URL.onrender.com/health"
   ```

   Respuesta esperada: `status: ok` o similar.

4. Prueba login demo:

   ```powershell
   $body = '{"email":"demo@stockflow.dev","password":"demo1234"}'
   Invoke-RestMethod -Method POST -Uri "https://TU-URL.onrender.com/api/auth/login" -ContentType "application/json" -Body $body
   ```

5. Verifica integraciones:

   ```powershell
   # Con token del login anterior en $token
   Invoke-RestMethod -Uri "https://TU-URL.onrender.com/api/billing/provider" -Headers @{ Authorization = "Bearer $token" }
   # Esperado: provider payphone, paymentsEnabled true

   Invoke-RestMethod -Uri "https://TU-URL.onrender.com/api/sri/config" -Headers @{ Authorization = "Bearer $token" }
   # Esperado: provider factuplan, enabled true
   ```

---

## Parte 5 — PayPhone Developer

App: **StockFlow Membresias** en [PayPhone Developer](https://payphone.app/developer).

Para probar **desde tu PC** (frontend local):

| Campo | URL |
|-------|-----|
| Dominio | `https://adrian-ramos.pages.dev` |
| URL de respuesta | `https://adrian-ramos.pages.dev/apps/stockflow-live/membresia` |

En Render, `PAYPHONE_RESPONSE_URL` debe coincidir con la URL de respuesta de PayPhone.

Cuando subas el frontend a producción (Cloudflare Pages, etc.), cambia ambas URLs y actualiza `PAYPHONE_RESPONSE_URL` en Render.

---

## Parte 6 — Frontend local apuntando a Render

Edita `projects/inventory-api/frontend/.env`:

```env
VITE_USE_LIVE_API=true
VITE_API_BASE_URL=https://TU-URL.onrender.com
```

Luego:

```powershell
cd projects/inventory-api/frontend
npm install
npm run dev
```

Abre `https://adrian-ramos.pages.dev/apps/stockflow-live/` → login `demo@stockflow.dev` / `demo1234`.

---

## Parte 7 — Checklist final

- [ ] Servicio nuevo `stockflow-api` con **Runtime: Docker**
- [ ] Root Directory: `projects/inventory-api`
- [ ] Conectado a `stockflow-db` (o JDBC manual)
- [ ] Variables de `.env.render` cargadas
- [ ] Sin variables Python viejas
- [ ] Logs muestran Spring Boot, no uvicorn
- [ ] `/health` responde
- [ ] Login demo funciona
- [ ] `billing-provider` → PayPhone activo
- [ ] `sri/config` → Factuplan activo
- [ ] `frontend/.env` con la URL nueva
- [ ] PayPhone Developer con URLs de Cloudflare (ver `PAYPHONE-DEVELOPER-URLS.txt`)

---

## Problemas frecuentes

| Síntoma | Causa | Solución |
|---------|-------|----------|
| Build falla en `pip` / `requirements.txt` | Servicio en Python, no Docker | Crear servicio nuevo con Docker |
| PayPhone/Factuplan en `manual` / `datil` | Mismo: no corre Spring Boot | Idem |
| 401 en `demo@stockflow.dev` | Seed no corrió | `STOCKFLOW_SEED_DEMO=true` y redeploy |
| Timeout en `/health` | Plan Free dormido | Reintenta tras ~1 min |
| Error de DB | Host externo en vez de interno | Usa enlace `stockflow-db` o host `dpg-...-a` (sin dominio público) |

---

## Seguridad

- Rota la contraseña de `stockflow-db` si se expuso en chats o capturas.
- No subas `.env` ni `.env.render` a GitHub.
- `ak_test_*` de Factuplan y tokens PayPhone son de **prueba**; no uses en producción real sin claves live.
