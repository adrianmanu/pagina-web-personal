# Cómo publicar tu APK en el portafolio

## Opción 1 — Carpeta del portafolio (más simple)

1. Coloca tu archivo APK aquí: `public/downloads/gusvivan-app.apk`
2. Al hacer `npm run build`, quedará disponible en:
   `https://tu-dominio.com/downloads/gusvivan-app.apk`
3. El botón "Descargar APK" ya apunta a esa ruta.

## Opción 2 — GitHub Releases

1. Sube el APK a un release en GitHub.
2. Copia la URL del asset y actualiza `apkUrl` en `src/services/portfolioService.ts`.

## Opción 3 — Video demo (recomendado junto al APK)

Graba un video corto (1-2 min) mostrando la app en un dispositivo Android.
Súbelo a YouTube y agrega la URL en `demoVideoUrl`.

## Opción 4 — Firebase App Distribution

Para demos privadas con clientes/reclutadores sin publicar en Play Store.
