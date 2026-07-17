from __future__ import annotations

import json
from pathlib import Path

import numpy as np


class JsonTemplateStore:
    """
    Temporary file-based template store for the local demo.

    Replace this with encrypted database storage before the real voter registry
    implementation.
    """

    def __init__(self, path: Path | None = None) -> None:
        self.path = path or Path(__file__).resolve().parents[2] / "data" / "face_templates.json"
        self.path.parent.mkdir(parents=True, exist_ok=True)

    def save(self, voter_id: str, embedding: np.ndarray) -> None:
        data = self._read()
        data[voter_id] = embedding.astype(float).tolist()
        self._write(data)

    def get(self, voter_id: str) -> np.ndarray | None:
        data = self._read()
        stored = data.get(voter_id)

        if stored is None:
            return None

        return np.asarray(stored, dtype=np.float32)

    def _read(self) -> dict:
        if not self.path.exists():
            return {}

        with self.path.open("r", encoding="utf-8") as file:
            return json.load(file)

    def _write(self, data: dict) -> None:
        with self.path.open("w", encoding="utf-8") as file:
            json.dump(data, file, indent=2)
