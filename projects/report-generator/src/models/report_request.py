from pydantic import BaseModel, Field


class ReportItem(BaseModel):
    label: str
    value: float
    category: str = 'General'


class ReportRequest(BaseModel):
    title: str = Field(..., min_length=3)
    author: str = 'Adrian Ramos Acosta'
    items: list[ReportItem]
