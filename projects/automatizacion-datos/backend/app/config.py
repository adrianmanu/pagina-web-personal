from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = 'Automatización de Datos API'
    database_url: str = 'sqlite:///./data/app.db'
    secret_key: str = 'change-me-in-production-use-env-var'
    algorithm: str = 'HS256'
    access_token_expire_minutes: int = 60 * 24
    api_base_url: str = 'https://jsonplaceholder.typicode.com'
    cors_origins: str = (
        'http://localhost:5173,http://localhost:5175,http://localhost:4173,'
        'https://adrianmanu.github.io'
    )

    class Config:
        env_file = '.env'


settings = Settings()
