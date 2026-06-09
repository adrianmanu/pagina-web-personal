from datetime import datetime

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.data_source import DataSource
from app.models.extraction_job import ExtractionJob
from app.models.sale_record import SaleRecord
from app.services.api_client import ApiClientService


class EtlService:
    def __init__(self, api_client: ApiClientService | None = None):
        self.api_client = api_client or ApiClientService()

    def run_job(self, db: Session, user_id: int, data_source_id: int | None = None) -> ExtractionJob:
        job = ExtractionJob(user_id=user_id, data_source_id=data_source_id, status='running')
        db.add(job)
        db.commit()
        db.refresh(job)

        try:
            if data_source_id:
                source = (
                    db.query(DataSource)
                    .filter(DataSource.id == data_source_id, DataSource.user_id == user_id)
                    .first()
                )
                if not source:
                    raise ValueError('Fuente de datos no encontrada')
                api_url = source.api_url
            else:
                from app.config import settings
                api_url = settings.api_base_url

            raw_records = self.api_client.fetch_sales_data(api_url)
            for item in raw_records:
                db.add(SaleRecord(user_id=user_id, **item))

            job.status = 'completed'
            job.records_extracted = len(raw_records)
            job.message = f'Extracción exitosa: {len(raw_records)} registros'
            job.finished_at = datetime.utcnow()
        except Exception as exc:
            job.status = 'failed'
            job.message = str(exc)
            job.finished_at = datetime.utcnow()

        db.commit()
        db.refresh(job)
        return job

    def get_summary(self, db: Session, user_id: int) -> list[dict]:
        rows = (
            db.query(
                SaleRecord.customer,
                func.count(SaleRecord.id).label('total_orders'),
                func.sum(SaleRecord.quantity * SaleRecord.unit_price).label('total_sales'),
            )
            .filter(SaleRecord.user_id == user_id)
            .group_by(SaleRecord.customer)
            .all()
        )
        return [
            {
                'customer': row.customer,
                'total_orders': row.total_orders,
                'total_sales': round(float(row.total_sales or 0), 2),
            }
            for row in rows
        ]
