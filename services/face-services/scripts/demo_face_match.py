from __future__ import annotations

import argparse
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from app.core.config import settings
from app.services.face_service import FaceService


def read_image(path: Path) -> bytes:
    if not path.exists():
        raise FileNotFoundError(f"Image not found: {path}")

    return path.read_bytes()


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Compare two face images with InsightFace embeddings."
    )
    parser.add_argument("enrolled_image", type=Path)
    parser.add_argument("probe_image", type=Path)
    parser.add_argument("extract_face", type=bool)
    parser.add_argument(
        "--threshold",
        type=float,
        default=settings.face_match_threshold,
        help="Cosine similarity threshold used to decide match/non-match.",
    )
    args = parser.parse_args()
    service = FaceService()


    if args.extract_face:
        service.detect_face(read_image(args.enrolled_image))
        return 0
    else:
        enrolled_embedding = service.extract_embedding(read_image(args.enrolled_image))
        probe_embedding = service.extract_embedding(read_image(args.probe_image))
        result = service.compare_embeddings(
            enrolled_embedding=enrolled_embedding,
            probe_embedding=probe_embedding,
            threshold=args.threshold,
        )

        print(f"similarity={result.similarity:.4f}")
        print(f"threshold={args.threshold:.4f}")
        print(f"matched={str(result.matched).lower()}")

        return 0


if __name__ == "__main__":
    raise SystemExit(main())
