from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime
from bson import ObjectId

class PyObjectId(str):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate
    
    @classmethod
    def validate(cls, v, info):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return str(v)

class GridMix(BaseModel):
    coal: float = Field(ge=0, le=100)
    hydro: float = Field(ge=0, le=100)
    solar: float = Field(ge=0, le=100)
    naturalGas: float = Field(ge=0, le=100)

class LCADataCreate(BaseModel):
    metalType: Literal['Aluminium', 'Steel', 'Copper', 'Zinc', 'Lead']
    oreGrade: float = Field(ge=10, le=100)
    miningMethod: Literal['Open Pit', 'Underground', 'Heap Leach']
    waterUsage: float = Field(ge=1, le=50)
    totalEnergyConsumption: float = Field(ge=1000, le=50000)
    gridMix: GridMix
    processHeat: float = Field(ge=1000, le=20000)
    furnaceType: Literal['Electric Arc', 'Blast', 'Induction']
    temperature: float = Field(ge=500, le=2000)
    fluxUsage: float = Field(ge=10, le=100)
    slagRecovery: float = Field(ge=0, le=100)
    transportMode: Literal['Road', 'Rail', 'Sea', 'Multi']
    inboundDistance: float = Field(ge=10, le=1000)
    outboundDistance: float = Field(ge=10, le=1000)
    vehicleEfficiency: float = Field(ge=0.01, le=1)
    scrapInputRate: float = Field(ge=0, le=100)
    recyclingEfficiency: float = Field(ge=50, le=100)
    wasteRecovery: float = Field(ge=0, le=100)
    closedLoopRate: float = Field(ge=0, le=100)
    scenarioType: Literal['Current', 'Optimized', 'Baseline'] = 'Current'

class LCADataResponse(LCADataCreate):
    id: str = Field(alias="_id")
    co2Emission: float
    circularityScore: float
    createdAt: datetime
    updatedAt: datetime
    
    class Config:
        populate_by_name = True

class LCADataUpdate(BaseModel):
    metalType: Optional[Literal['Aluminium', 'Steel', 'Copper', 'Zinc', 'Lead']] = None
    oreGrade: Optional[float] = None
    miningMethod: Optional[Literal['Open Pit', 'Underground', 'Heap Leach']] = None
    waterUsage: Optional[float] = None
    totalEnergyConsumption: Optional[float] = None
    gridMix: Optional[GridMix] = None
    processHeat: Optional[float] = None
    furnaceType: Optional[Literal['Electric Arc', 'Blast', 'Induction']] = None
    temperature: Optional[float] = None
    fluxUsage: Optional[float] = None
    slagRecovery: Optional[float] = None
    transportMode: Optional[Literal['Road', 'Rail', 'Sea', 'Multi']] = None
    inboundDistance: Optional[float] = None
    outboundDistance: Optional[float] = None
    vehicleEfficiency: Optional[float] = None
    scrapInputRate: Optional[float] = None
    recyclingEfficiency: Optional[float] = None
    wasteRecovery: Optional[float] = None
    closedLoopRate: Optional[float] = None
    scenarioType: Optional[Literal['Current', 'Optimized', 'Baseline']] = None
