from __future__ import annotations

from typing import Any

import boto3

from app.core.config import settings


class LivenessService:
    """
    Wrapper for AWS Rekognition Face Liveness session APIs.

    Backend responsibilities:
    - create liveness sessions
    - fetch session results
    - only continue to face verification when liveness is acceptable
    """

    def __init__(self) -> None:
        self.client = boto3.client("rekognition", region_name=settings.aws_region)

    def create_session(self) -> dict[str, Any]:
        response = self.client.create_face_liveness_session()
        return {
            "session_id": response["SessionId"],
            "region": settings.aws_region,
        }

    def get_results(self, session_id: str) -> dict[str, Any]:
        return self.client.get_face_liveness_session_results(SessionId=session_id)
