# Portafolio — Adrian Esteban Ramos Acosta

Monorepo con portafolio web y proyectos organizados por carpetas. Despliegue automático con **GitHub Actions** → **GitHub Pages**.

## Estructura

```
├── src/                    # Portafolio (React + TypeScript)
├── public/
│   ├── downloads/          # APK de la app móvil
│   └── demos/              # Páginas demo de cada proyecto
├── projects/
│   ├── automatizacion-datos/
│   ├── inventory-api/
│   ├── metrics-dashboard/
│   ├── task-manager-api/
│   └── report-generator/
└── .github/workflows/      # Deploy automático
```

## Qué se publica en GitHub Pages

| URL | Contenido |
|-----|-----------|
| `/` | Portafolio principal |
| `/metrics-dashboard/` | Dashboard React (app en vivo) |
| `/demos/nombre-proyecto/` | Página demo de cada proyecto |
| `/downloads/app-debug.apk` | Descarga del APK |

> **Nota:** GitHub Pages solo hospeda sitios estáticos. Las APIs (Spring Boot, Node, FastAPI) tienen páginas demo con documentación; para ejecutarlas se usa el código en `projects/`.

## Publicar en GitHub (paso a paso)

### 1. Crear repositorio en GitHub

Crea un repo vacío, por ejemplo: `pagina-web-personal`

### 2. Subir el código

```bash
git init
git add .
git commit -m "Portafolio monorepo con proyectos y GitHub Actions"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/pagina-web-personal.git
git push -u origin main
```

### 3. Activar GitHub Pages

1. Ve a tu repo → **Settings** → **Pages**
2. En **Source**, selecciona **GitHub Actions**
3. El workflow `deploy-pages.yml` se ejecutará automáticamente al hacer push

### 4. Tu sitio quedará en

```
https://TU_USUARIO.github.io/pagina-web-personal/
```

### 5. Personalizar usuario de GitHub en demos locales

Edita `public/demos/config.js`:

```javascript
window.PORTFOLIO_CONFIG = {
  githubUser: 'tu-usuario',
  githubRepo: 'pagina-web-personal',
};
```

En producción, GitHub Actions actualiza esto automáticamente.

## Desarrollo local

```bash
# Portafolio
npm install
npm run dev

# Dashboard
cd projects/metrics-dashboard
npm install
npm run dev
```

## Cómo funcionan los enlaces del portafolio

- **Ver aplicación** → abre en nueva pestaña la demo o app desplegada en GitHub Pages
- **Descargar APK** → descarga `app-debug.apk`
- **Código** → abre la carpeta del proyecto en GitHub
