from datetime import datetime

from pydantic import BaseModel, Field


class DataSourceBase(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    api_url: str
    description: str = ''
    is_active: bool = True


class DataSourceCreate(DataSourceBase):
    pass


class DataSourceUpdate(BaseModel):
    name: str | None = None
    api_url: str | None = None
    description: str | None = None
    is_active: bool | None = None


class DataSourceResponse(DataSourceBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
