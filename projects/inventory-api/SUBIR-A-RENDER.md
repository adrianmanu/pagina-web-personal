# Subir variables a Render

> **Si aún no tienes el servicio Docker de StockFlow**, sigue primero:
> **[RENDER-NUEVO-SERVICIO.md](./RENDER-NUEVO-SERVICIO.md)** (crear web service + Postgres + env completo).

## Cuando ya exista `stockflow-api` (Docker)

1. [dashboard.render.com](https://dashboard.render.com) → servicio **`stockflow-api`** (no `pagina-web-personal`).
2. Pestaña **Environment** → **Edit**.
3. Borra variables viejas si quedan: `PYTHON_VERSION`, `SECRET_KEY`, `CORS_ORIGINS`.
4. **Add from .env** → archivo local `projects/inventory-api/.env.render`.
5. **Save Changes** → espera estado **Live**.

## Probar

```powershell
Invoke-RestMethod "https://TU-URL.onrender.com/health"
cd projects/inventory-api/frontend
npm run dev
```

Login: `demo@stockflow.dev` / `demo1234`

## PayPhone

Ver `PAYPHONE-DEVELOPER-URLS.txt` y pegar las URLs en PayPhone Developer.
