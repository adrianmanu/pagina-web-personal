from fastapi import FastAPI

from src.controllers.report_controller import router as report_router

app = FastAPI(
    title='Report Generator API',
    description='Microservicio para generar reportes PDF y Excel',
    version='1.0.0',
)

app.include_router(report_router)


@app.get('/health')
def health_check() -> dict:
    return {'status': 'ok', 'service': 'report-generator'}
