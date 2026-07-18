# Automatización de Datos Empresariales v2

Plataforma full stack con **login, registro, dashboard y CRUD** para automatizar extracción de datos y generar reportes.

> **Demo en línea:** la versión publicada en GitHub Pages funciona en *modo demo* (datos de ejemplo guardados en el navegador, sin servidor). Este repositorio contiene la API REST completa en FastAPI, que puede ejecutarse localmente siguiendo los pasos de abajo.

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18, TypeScript, React Router |
| Backend | FastAPI, SQLAlchemy, JWT |
| Base de datos | SQLite (PostgreSQL compatible) |

## Funcionalidades

- Registro e inicio de sesión con JWT
- Dashboard con KPIs y resumen por cliente
- CRUD de fuentes de datos (APIs REST)
- CRUD de registros de ventas
- Ejecución de jobs ETL desde el panel
- Exportación de reportes CSV y JSON

## Ejecución local

### Backend (puerto 8000)

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python run.py
```

API docs: http://localhost:8000/docs

### Frontend (puerto 5175)

```bash
cd frontend
npm install
npm run dev
```

Abre: http://localhost:5175

## Arquitectura MVC

```
backend/app/
├── models/       # Entidades SQLAlchemy
├── schemas/      # DTOs Pydantic
├── services/     # Lógica de negocio
└── routers/      # Controladores HTTP

frontend/src/
├── models/       # Tipos TypeScript (en api/client)
├── services/     # Cliente API
├── controllers/  # Context + hooks
└── views/        # Páginas y componentes
```
