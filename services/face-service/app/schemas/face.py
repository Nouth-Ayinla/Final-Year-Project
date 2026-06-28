from pydantic import BaseModel


class EnrollmentResponse(BaseModel):
    voter_id: str
    status: str
    message: str

class GetResponse(BaseModel):
    voter_id: str
    data: str


class VerificationResponse(BaseModel):
    voter_id: str
    matched: bool
    similarity: float
    eligible: bool
    message: str


class LivenessSessionResponse(BaseModel):
    session_id: str
    region: str
