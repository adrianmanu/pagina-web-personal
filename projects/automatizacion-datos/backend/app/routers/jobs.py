from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.extraction_job import ExtractionJob
from app.models.user import User
from app.schemas.job import ExtractionJobResponse, RunEtlRequest
from app.services.etl_service import EtlService

router = APIRouter(prefix='/api/jobs', tags=['jobs'])


@router.get('', response_model=list[ExtractionJobResponse])
def list_jobs(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return (
        db.query(ExtractionJob)
        .filter(ExtractionJob.user_id == user.id)
        .order_by(ExtractionJob.id.desc())
        .all()
    )


@router.post('/run', response_model=ExtractionJobResponse)
def run_etl(
    payload: RunEtlRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    service = EtlService()
    try:
        job = service.run_job(db, user.id, payload.data_source_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return job
