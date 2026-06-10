# Metrix — Suite de Gestión Empresarial

SPA en React + TypeScript con arquitectura **MVC** estricta: dashboard de métricas, gestión de pedidos y clientes.

## Funcionalidades

- **Dashboard**: KPIs (ingresos, pedidos, ticket promedio, clientes activos) con variación vs el mes anterior, gráfico de ingresos por mes, donut de pedidos por estado, top clientes y pedidos recientes. Todo calculado en tiempo real a partir de los datos registrados.
- **Pedidos (CRUD)**: creación y edición con múltiples ítems, cambio de estado en línea (pendiente → pagado → enviado → entregado / cancelado), búsqueda, filtro por estado, paginación y exportación a CSV.
- **Clientes (CRUD)**: alta, edición y eliminación con validaciones (correo único, no se puede eliminar un cliente con pedidos), estadísticas por cliente (pedidos y total comprado) y búsqueda.
- **Persistencia local**: los datos se guardan en el navegador (localStorage) a través de una capa repositorio; al primer arranque se generan datos demo realistas de los últimos 12 meses, con opción de restablecerlos.

## Arquitectura

```
src/
├── models/        # Tipos y reglas de dominio (Customer, Order, Metric)
├── services/      # Capa de datos y lógica de negocio
│   ├── storage.ts          # Repositorio sobre localStorage
│   ├── seedService.ts      # Generación de datos demo deterministas
│   ├── customerService.ts  # CRUD + estadísticas de clientes
│   ├── orderService.ts     # CRUD + validaciones de pedidos
│   └── metricsService.ts   # KPIs y agregaciones derivadas
├── controllers/   # Hooks que conectan servicios con las vistas
└── views/
    ├── components/  # Layout, modales, toasts, gráficos SVG, badges
    └── pages/       # Dashboard, Pedidos, Clientes
```

## Ejecución

```bash
cd projects/metrics-dashboard
npm install
npm run dev
```

## Stack

- React 18 + TypeScript + Vite
- React Router (HashRouter, compatible con GitHub Pages)
- Gráficos SVG propios (barras y donut), sin librerías de charting
- Lucide React (iconos)
