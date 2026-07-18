from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import init_db
from app.routers import auth, data_sources, jobs, records, reports

app = FastAPI(title=settings.app_name, version='2.0.0')

origins = [origin.strip() for origin in settings.cors_origins.split(',') if origin.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins + ['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(auth.router)
app.include_router(data_sources.router)
app.include_router(records.router)
app.include_router(jobs.router)
app.include_router(reports.router)


@app.on_event('startup')
def on_startup():
    init_db()


@app.get('/health')
def health():
    return {'status': 'ok', 'service': 'automatizacion-datos-api'}
