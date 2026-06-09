# Generador de Reportes PDF/Excel

Microservicio en Python con FastAPI para generar reportes empresariales.

## Endpoints

- `GET /health` — Estado del servicio
- `POST /reports/pdf` — Genera reporte PDF
- `POST /reports/excel` — Genera reporte Excel

## Ejecución

```bash
cd projects/report-generator
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 5000
```

Documentación interactiva: `http://localhost:5000/docs`

## Ejemplo de body

```json
{
  "title": "Reporte de Ventas Q1",
  "author": "Adrian Ramos Acosta",
  "items": [
    { "label": "Ventas Enero", "value": 15000, "category": "Ventas" },
    { "label": "Ventas Febrero", "value": 18200, "category": "Ventas" }
  ]
}
```
