from datetime import datetime

from pydantic import BaseModel


class ExtractionJobResponse(BaseModel):
    id: int
    data_source_id: int | None
    status: str
    records_extracted: int
    message: str
    started_at: datetime
    finished_at: datetime | None

    class Config:
        from_attributes = True


class RunEtlRequest(BaseModel):
    data_source_id: int | None = None
