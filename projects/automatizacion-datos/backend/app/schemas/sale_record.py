from datetime import datetime

from pydantic import BaseModel, Field


class SaleRecordBase(BaseModel):
    external_id: int
    product_name: str = Field(min_length=1, max_length=255)
    quantity: int = Field(gt=0)
    unit_price: float = Field(gt=0)
    customer: str = Field(min_length=1, max_length=255)


class SaleRecordCreate(SaleRecordBase):
    pass


class SaleRecordUpdate(BaseModel):
    external_id: int | None = None
    product_name: str | None = None
    quantity: int | None = Field(default=None, gt=0)
    unit_price: float | None = Field(default=None, gt=0)
    customer: str | None = None


class SaleRecordResponse(SaleRecordBase):
    id: int
    total: float
    extracted_at: datetime

    class Config:
        from_attributes = True
