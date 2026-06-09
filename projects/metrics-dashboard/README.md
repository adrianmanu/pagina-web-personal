# Dashboard de Métricas Empresariales

Panel interactivo en React + TypeScript con arquitectura MVC.

## Arquitectura

```
src/
├── models/       # Tipos de KPIs y gráficos
├── services/     # Datos y lógica de negocio
├── controllers/  # useMetricsController (hook)
└── views/        # Componentes UI
```

## Ejecución

```bash
cd projects/metrics-dashboard
npm install
npm run dev
```

## Características

- KPIs con variación porcentual
- Gráfico de barras Ventas vs Gastos
- Filtros por período (3, 6, 12 meses)
- Diseño responsive tema oscuro
