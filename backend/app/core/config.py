from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Ondo Voting Backend"
    api_prefix: str = "/api/v1"
    aws_region: str = "us-east-1"
    aws_face_liveness_bucket: str = ""
    face_match_threshold: float = 0.45

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
