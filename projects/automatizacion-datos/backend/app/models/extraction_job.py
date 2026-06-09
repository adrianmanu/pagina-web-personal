from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class ExtractionJob(Base):
    __tablename__ = 'extraction_jobs'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id'), index=True)
    data_source_id: Mapped[int | None] = mapped_column(ForeignKey('data_sources.id'), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default='pending')
    records_extracted: Mapped[int] = mapped_column(Integer, default=0)
    message: Mapped[str] = mapped_column(String(500), default='')
    started_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    finished_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    owner = relationship('User', back_populates='extraction_jobs')
