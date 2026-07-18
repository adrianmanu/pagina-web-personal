from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class SaleRecord(Base):
    __tablename__ = 'sale_records'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id'), index=True)
    external_id: Mapped[int] = mapped_column(Integer)
    product_name: Mapped[str] = mapped_column(String(255))
    quantity: Mapped[int] = mapped_column(Integer)
    unit_price: Mapped[float] = mapped_column(Float)
    customer: Mapped[str] = mapped_column(String(255))
    extracted_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    owner = relationship('User', back_populates='sale_records')

    @property
    def total(self) -> float:
        return round(self.quantity * self.unit_price, 2)
