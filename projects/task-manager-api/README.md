# Task Manager API

API REST en Node.js y TypeScript con arquitectura MVC para gestión de tareas.

## Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/health` | Estado del servicio |
| GET | `/api/tasks` | Listar tareas |
| GET | `/api/tasks/:id` | Obtener tarea |
| POST | `/api/tasks` | Crear tarea |
| PUT | `/api/tasks/:id` | Actualizar tarea |
| DELETE | `/api/tasks/:id` | Eliminar tarea |

## Ejecución

```bash
cd projects/task-manager-api
npm install
npm run dev
```

## Arquitectura MVC

- `models/` — Tipos e interfaces
- `services/` — Lógica de negocio
- `controllers/` — Manejo de HTTP
- `routes/` — Definición de rutas
