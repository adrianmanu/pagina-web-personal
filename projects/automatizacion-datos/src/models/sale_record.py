from dataclasses import dataclass
from datetime import datetime


@dataclass
class SaleRecord:
    external_id: int
    product_name: str
    quantity: int
    unit_price: float
    customer: str
    extracted_at: datetime

    @property
    def total(self) -> float:
        return self.quantity * self.unit_price
