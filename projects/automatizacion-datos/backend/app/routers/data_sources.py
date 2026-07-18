from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.data_source import DataSource
from app.models.user import User
from app.schemas.data_source import DataSourceCreate, DataSourceResponse, DataSourceUpdate

router = APIRouter(prefix='/api/data-sources', tags=['data-sources'])


@router.get('', response_model=list[DataSourceResponse])
def list_sources(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return db.query(DataSource).filter(DataSource.user_id == user.id).order_by(DataSource.id.desc()).all()


@router.post('', response_model=DataSourceResponse, status_code=status.HTTP_201_CREATED)
def create_source(
    data: DataSourceCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    source = DataSource(user_id=user.id, **data.model_dump())
    db.add(source)
    db.commit()
    db.refresh(source)
    return source


@router.put('/{source_id}', response_model=DataSourceResponse)
def update_source(
    source_id: int,
    data: DataSourceUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    source = db.query(DataSource).filter(DataSource.id == source_id, DataSource.user_id == user.id).first()
    if not source:
        raise HTTPException(status_code=404, detail='Fuente no encontrada')
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(source, key, value)
    db.commit()
    db.refresh(source)
    return source


@router.delete('/{source_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_source(
    source_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    source = db.query(DataSource).filter(DataSource.id == source_id, DataSource.user_id == user.id).first()
    if not source:
        raise HTTPException(status_code=404, detail='Fuente no encontrada')
    db.delete(source)
    db.commit()
