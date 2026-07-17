from __future__ import annotations

from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

import cv2
import numpy as np


@dataclass
class FaceMatchResult:
    similarity: float
    matched: bool


class FaceService:
    """
    Thin wrapper for InsightFace-based enrollment and 1:1 verification.

    This uses pretrained ArcFace-style embeddings through InsightFace.
    The service converts a face image into an embedding vector, then compares
    embeddings with cosine similarity.
    """

    def __init__(self) -> None:
        self.app = get_face_analysis_app()

    def extract_embedding(self, image_bytes: bytes) -> np.ndarray:
        image = bytes_to_bgr_image(image_bytes)
        faces = self.app.get(image)

        if not faces:
            raise ValueError("No face detected in the submitted image.")

        # Pick the largest face. The mobile UI should guide the voter to submit
        # exactly one clear frontal face, but this keeps the demo predictable.
        face = max(faces, key=lambda item: face_area(item.bbox))
        embedding = np.asarray(face.embedding, dtype=np.float32)
        norm = np.linalg.norm(embedding)

        if norm == 0:
            raise ValueError("Face embedding could not be normalized.")

        return embedding / norm

    def compare_embeddings(
        self,
        enrolled_embedding: np.ndarray,
        probe_embedding: np.ndarray,
        threshold: float,
    ) -> FaceMatchResult:
        numerator = float(np.dot(enrolled_embedding, probe_embedding))
        denominator = float(
            np.linalg.norm(enrolled_embedding) * np.linalg.norm(probe_embedding)
        )
        similarity = numerator / denominator if denominator else 0.0
        return FaceMatchResult(similarity=similarity, matched=similarity >= threshold)

    
    def detect_face(self, image_bytes: bytes):
        image = bytes_to_bgr_image(image_bytes)
        faces = self.app.get(image)

        for i, face in enumerate(faces):
            x1, y1, x2, y2 = face.bbox.astype(int)

            face_crop = image[y1:y2, x1:x2]

            cv2.imwrite(f"face_{i}.jpg", face_crop)



def bytes_to_bgr_image(image_bytes: bytes) -> np.ndarray:
    image_array = np.frombuffer(image_bytes, dtype=np.uint8)
    image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)

    if image is None:
        raise ValueError("Submitted file is not a valid image.")

    return image


def face_area(bbox: np.ndarray) -> float:
    left, top, right, bottom = bbox
    return float((right - left) * (bottom - top))



@lru_cache(maxsize=1)
def get_face_analysis_app():
    from insightface.app import FaceAnalysis

    model_root = Path(__file__).resolve().parents[2] / ".insightface"
    model_root.mkdir(parents=True, exist_ok=True)

    app = FaceAnalysis(
        name="buffalo_l",
        root=str(model_root),
        providers=["CPUExecutionProvider"],
    )
    app.prepare(ctx_id=-1, det_size=(640, 640))
    return app
