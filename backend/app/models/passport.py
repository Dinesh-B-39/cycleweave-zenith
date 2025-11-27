from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class ProvenanceEvent(BaseModel):
    timestamp: str
    event: str
    location: str
    verified: bool

class PassportCreate(BaseModel):
    lcaId: str
    doctorAnalysisId: Optional[str] = None

class PassportResponse(BaseModel):
    id: str = Field(alias="_id")
    passportId: str
    lcaId: str
    doctorAnalysisId: Optional[str] = None
    metalType: str
    co2Emission: float
    circularityScore: float
    scrapInputRate: float
    totalDistance: float
    transportMode: str
    scenarioType: str
    grade: str
    gradeLabel: str
    provenance: List[ProvenanceEvent]
    certifications: List[str]
    qrCode: str
    generatedAt: datetime
    
    class Config:
        populate_by_name = True
