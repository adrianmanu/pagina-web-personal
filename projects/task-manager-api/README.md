# TaskFlow — Task Manager Full-Stack

Aplicación completa de gestión de tareas: API REST en **Node.js + Express + TypeScript** y frontend en **React** con tablero kanban.

> **Demo en línea:** la versión publicada en GitHub Pages funciona en *modo demo* (datos de ejemplo guardados en el navegador, sin servidor). Este repositorio contiene la API REST completa, que puede ejecutarse localmente siguiendo los pasos de abajo.

## Características

- **Autenticación JWT**: registro, login y sesión persistente (contraseñas con bcrypt).
- **Tareas por usuario** con estado (`pendiente`, `en_progreso`, `completada`), prioridad (`alta`, `media`, `baja`) y fecha límite.
- **Tablero kanban** con 3 columnas, movimiento de tareas entre estados, búsqueda y filtro por prioridad.
- **Dashboard** con KPIs: totales por estado, tareas vencidas, % completado y próximos vencimientos.
- **Patrón repositorio**: PostgreSQL en producción (`DATABASE_URL`) y almacenamiento en memoria en desarrollo.
- Manejo centralizado de errores y validación en la capa de servicios.

## Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/health` | Estado del servicio |
| POST | `/api/auth/register` | Crear cuenta |
| POST | `/api/auth/login` | Iniciar sesión |
| GET | `/api/auth/me` | Usuario autenticado |
| GET | `/api/tasks` | Listar tareas (`?status=&priority=&search=`) |
| GET | `/api/tasks/stats` | Estadísticas de tareas |
| POST | `/api/tasks` | Crear tarea |
| PUT | `/api/tasks/:id` | Actualizar tarea |
| PATCH | `/api/tasks/:id/status` | Cambiar estado |
| DELETE | `/api/tasks/:id` | Eliminar tarea |

Todos los endpoints de `/api/tasks` requieren `Authorization: Bearer <token>`.

## Ejecución local

```bash
# Backend (puerto 4000)
cd projects/task-manager-api
npm install
npm run dev

# Frontend (puerto 5177, con proxy a la API)
cd frontend
npm install
npm run dev
```

## Variables de entorno (producción)

| Variable | Descripción |
|----------|-------------|
| `PORT` | Puerto del servidor (lo define Render) |
| `JWT_SECRET` | Secreto para firmar tokens |
| `DATABASE_URL` | Conexión PostgreSQL; sin ella usa memoria |

## Arquitectura

```
src/
├── config/         # Variables de entorno
├── models/         # Tipos e interfaces (Task, User)
├── repositories/   # Acceso a datos (memoria / PostgreSQL)
├── services/       # Lógica de negocio y validación
├── controllers/    # Manejo de HTTP
├── middleware/     # Auth JWT y manejo de errores
├── routes/         # Definición de rutas
├── app.ts          # Composición de la aplicación
└── server.ts       # Arranque
frontend/           # SPA React (login, dashboard, tablero kanban)
```
