from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ScanRequest(BaseModel):
    imageBase64: Optional[str] = None
    imageUrl: Optional[str] = None

class ScanResult(BaseModel):
    id: str = Field(alias="_id")
    scrapType: str
    purity: float
    estimatedWeight: float
    co2Saved: float
    revenueEstimate: float
    recommendedProcess: str
    createdAt: datetime
    lcaId: Optional[str] = None
    
    class Config:
        populate_by_name = True

class ScanResultCreate(BaseModel):
    scrapType: str
    purity: float = Field(ge=0, le=100)
    estimatedWeight: float = Field(ge=0)
    co2Saved: float = Field(ge=0)
    revenueEstimate: float = Field(ge=0)
    recommendedProcess: str
