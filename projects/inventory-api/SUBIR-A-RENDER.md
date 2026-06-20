# Subir variables a Render (1 solo paso tuyo)

Los archivos ya están listos. **No puedo entrar a tu panel Render**; tú solo subes el archivo.

## Paso único en Render

1. [dashboard.render.com](https://dashboard.render.com)
2. Abre el **Web Service** cuya URL es `https://inventory-api-ous5.onrender.com`
3. Pestaña **Environment**
4. **Edit** → borra variables viejas si quedan: `PYTHON_VERSION`, `SECRET_KEY`, `CORS_ORIGINS`
5. **Add from .env** (o pega el contenido del archivo)
6. Archivo a subir:

   `projects/inventory-api/.env.render`

7. **Save Changes** → espera estado **Live**

## Probar

```powershell
Invoke-RestMethod "https://inventory-api-ous5.onrender.com/health"
cd projects/inventory-api/frontend
npm run dev
```

Login: `demo@stockflow.dev` / `demo1234`

## PayPhone (navegador, no es .env)

Ver `PAYPHONE-DEVELOPER-URLS.txt` y pegar las 2 URLs en la app WEB de PayPhone Developer.

## Factuplan

Nada que pegar: la API key ya está en `.env.render`.
