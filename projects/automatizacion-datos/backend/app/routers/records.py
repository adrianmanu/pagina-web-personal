from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.sale_record import SaleRecord
from app.models.user import User
from app.schemas.sale_record import SaleRecordCreate, SaleRecordResponse, SaleRecordUpdate

router = APIRouter(prefix='/api/records', tags=['records'])


def to_response(record: SaleRecord) -> SaleRecordResponse:
    return SaleRecordResponse(
        id=record.id,
        external_id=record.external_id,
        product_name=record.product_name,
        quantity=record.quantity,
        unit_price=record.unit_price,
        customer=record.customer,
        total=record.total,
        extracted_at=record.extracted_at,
    )


@router.get('', response_model=list[SaleRecordResponse])
def list_records(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    records = db.query(SaleRecord).filter(SaleRecord.user_id == user.id).order_by(SaleRecord.id.desc()).all()
    return [to_response(r) for r in records]


@router.post('', response_model=SaleRecordResponse, status_code=status.HTTP_201_CREATED)
def create_record(
    data: SaleRecordCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    record = SaleRecord(user_id=user.id, **data.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return to_response(record)


@router.put('/{record_id}', response_model=SaleRecordResponse)
def update_record(
    record_id: int,
    data: SaleRecordUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    record = db.query(SaleRecord).filter(SaleRecord.id == record_id, SaleRecord.user_id == user.id).first()
    if not record:
        raise HTTPException(status_code=404, detail='Registro no encontrado')
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(record, key, value)
    db.commit()
    db.refresh(record)
    return to_response(record)


@router.delete('/{record_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_record(
    record_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    record = db.query(SaleRecord).filter(SaleRecord.id == record_id, SaleRecord.user_id == user.id).first()
    if not record:
        raise HTTPException(status_code=404, detail='Registro no encontrado')
    db.delete(record)
    db.commit()
