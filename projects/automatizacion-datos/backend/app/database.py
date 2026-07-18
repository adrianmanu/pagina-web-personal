from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.config import settings


class Base(DeclarativeBase):
    pass


db_path = settings.database_url.replace('sqlite:///', '')
if db_path and not db_path.startswith(':memory:'):
    Path(db_path).parent.mkdir(parents=True, exist_ok=True)

engine = create_engine(
    settings.database_url,
    connect_args={'check_same_thread': False} if settings.database_url.startswith('sqlite') else {},
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    from app.models import data_source, extraction_job, sale_record, user  # noqa: F401

    Base.metadata.create_all(bind=engine)
