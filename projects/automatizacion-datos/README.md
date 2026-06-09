# Automatización de Datos Empresariales

Pipeline ETL en Python con arquitectura MVC para extracción de datos desde APIs REST, almacenamiento en base de datos y generación de reportes analíticos.

## Arquitectura

```
src/
├── models/         # SaleRecord (datos)
├── repositories/   # Acceso a PostgreSQL/SQLite
├── services/       # API client, ETL, reportes
└── controllers/    # CLI controller
```

## Requisitos

- Python 3.10+
- PostgreSQL (opcional, usa SQLite por defecto)

## Instalación

```bash
cd projects/automatizacion-datos
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

## Ejecución

```bash
python main.py
```

Genera reportes en `reports/` en formato CSV y JSON.

## Qué demuestra

- Consumo de APIs REST externas
- Persistencia con SQLAlchemy (PostgreSQL o SQLite)
- Vistas analíticas agrupadas por cliente
- Exportación automatizada de reportes
- Separación MVC / Clean Code
