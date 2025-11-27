from pydantic import BaseModel, Field
from typing import List, Optional, Literal, Dict, Any
from datetime import datetime

class MetricAnalysis(BaseModel):
    value: float
    benchmark: float
    isGap: bool

class DoctorImprovement(BaseModel):
    id: str
    title: str
    description: str
    potentialGain: float
    category: Literal['energy', 'transport', 'process', 'circularity']
    simulateAction: Dict[str, Any]

class DoctorAnalysisRequest(BaseModel):
    lcaId: str

class DoctorAnalysisResponse(BaseModel):
    id: str = Field(alias="_id")
    lcaId: str
    overallScore: float
    carbonIntensity: MetricAnalysis
    energyEfficiency: MetricAnalysis
    circularityRating: str
    improvements: List[DoctorImprovement]
    riskFactors: List[str]
    createdAt: datetime
    
    class Config:
        populate_by_name = True

class DoctorAnalysisCreate(BaseModel):
    lcaId: str
    overallScore: float
    carbonIntensity: MetricAnalysis
    energyEfficiency: MetricAnalysis
    circularityRating: str
    improvements: List[DoctorImprovement]
    riskFactors: List[str]
