import io
import json

import pandas as pd
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.sale_record import SaleRecord
from app.models.user import User
from app.services.etl_service import EtlService

router = APIRouter(prefix='/api/reports', tags=['reports'])


@router.get('/summary')
def summary(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    service = EtlService()
    records = db.query(SaleRecord).filter(SaleRecord.user_id == user.id).all()
    return {
        'total_records': len(records),
        'total_revenue': round(sum(r.total for r in records), 2),
        'by_customer': service.get_summary(db, user.id),
    }


@router.get('/export/csv')
def export_csv(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    records = db.query(SaleRecord).filter(SaleRecord.user_id == user.id).all()
    data = [
        {
            'external_id': r.external_id,
            'product_name': r.product_name,
            'quantity': r.quantity,
            'unit_price': r.unit_price,
            'customer': r.customer,
            'total': r.total,
            'extracted_at': r.extracted_at.isoformat(),
        }
        for r in records
    ]
    df = pd.DataFrame(data)
    buffer = io.StringIO()
    df.to_csv(buffer, index=False, encoding='utf-8-sig')
    buffer.seek(0)
    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type='text/csv',
        headers={'Content-Disposition': 'attachment; filename=ventas.csv'},
    )


@router.get('/export/json')
def export_json(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    service = EtlService()
    records = db.query(SaleRecord).filter(SaleRecord.user_id == user.id).all()
    payload = {
        'total_records': len(records),
        'summary': service.get_summary(db, user.id),
        'records': [
            {
                'external_id': r.external_id,
                'product_name': r.product_name,
                'quantity': r.quantity,
                'unit_price': r.unit_price,
                'customer': r.customer,
                'total': r.total,
            }
            for r in records
        ],
    }
    content = json.dumps(payload, indent=2, ensure_ascii=False)
    return StreamingResponse(
        iter([content]),
        media_type='application/json',
        headers={'Content-Disposition': 'attachment; filename=reporte.json'},
    )
