import os
from pathlib import Path

from sqlalchemy import Column, DateTime, Float, Integer, String, create_engine, func
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker


class Base(DeclarativeBase):
    pass


class SaleRecordORM(Base):
    __tablename__ = 'sale_records'

    id = Column(Integer, primary_key=True, autoincrement=True)
    external_id = Column(Integer, nullable=False)
    product_name = Column(String(255), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)
    customer = Column(String(255), nullable=False)
    extracted_at = Column(DateTime, nullable=False)


class DatabaseRepository:
    def __init__(self, database_url: str | None = None):
        url = database_url or os.getenv(
            'DATABASE_URL',
            'sqlite:///./data/automatizacion.db',
        )
        if url.startswith('sqlite'):
            db_path = url.replace('sqlite:///', '')
            Path(db_path).parent.mkdir(parents=True, exist_ok=True)
        self.engine = create_engine(url, echo=False)
        Base.metadata.create_all(self.engine)
        self.session_factory = sessionmaker(bind=self.engine)

    def save_records(self, records: list) -> int:
        with Session(self.engine) as session:
            for record in records:
                session.add(
                    SaleRecordORM(
                        external_id=record.external_id,
                        product_name=record.product_name,
                        quantity=record.quantity,
                        unit_price=record.unit_price,
                        customer=record.customer,
                        extracted_at=record.extracted_at,
                    )
                )
            session.commit()
            return len(records)

    def get_summary(self) -> list[dict]:
        with Session(self.engine) as session:
            rows = (
                session.query(
                    SaleRecordORM.customer,
                    func.count(SaleRecordORM.id).label('total_orders'),
                    func.sum(SaleRecordORM.quantity * SaleRecordORM.unit_price).label('total_sales'),
                )
                .group_by(SaleRecordORM.customer)
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

    def get_all_records(self) -> list[dict]:
        with Session(self.engine) as session:
            rows = session.query(SaleRecordORM).all()
            return [
                {
                    'external_id': row.external_id,
                    'product_name': row.product_name,
                    'quantity': row.quantity,
                    'unit_price': row.unit_price,
                    'customer': row.customer,
                    'total': round(row.quantity * row.unit_price, 2),
                    'extracted_at': row.extracted_at.isoformat(),
                }
                for row in rows
            ]
