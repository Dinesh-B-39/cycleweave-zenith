from fastapi import APIRouter, HTTPException, status
from typing import List
from datetime import datetime
from bson import ObjectId

from app.database import get_database
from app.models.lca import LCADataCreate, LCADataResponse, LCADataUpdate
from app.services.calculations import calculate_emissions, calculate_circularity

router = APIRouter(prefix="/api/lca", tags=["LCA"])

@router.post("/", response_model=LCADataResponse, status_code=status.HTTP_201_CREATED)
async def create_lca(lca_data: LCADataCreate):
    """Create a new LCA assessment"""
    db = get_database()
    
    data_dict = lca_data.model_dump()
    
    # Calculate derived values
    data_dict['co2Emission'] = calculate_emissions(data_dict)
    data_dict['circularityScore'] = calculate_circularity(data_dict)
    data_dict['createdAt'] = datetime.utcnow()
    data_dict['updatedAt'] = datetime.utcnow()
    
    result = await db.lca_assessments.insert_one(data_dict)
    
    created = await db.lca_assessments.find_one({"_id": result.inserted_id})
    created['_id'] = str(created['_id'])
    
    return created

@router.get("/", response_model=List[LCADataResponse])
async def list_lca(skip: int = 0, limit: int = 100):
    """List all LCA assessments"""
    db = get_database()
    
    cursor = db.lca_assessments.find().skip(skip).limit(limit).sort("createdAt", -1)
    assessments = await cursor.to_list(length=limit)
    
    for assessment in assessments:
        assessment['_id'] = str(assessment['_id'])
    
    return assessments

@router.get("/{lca_id}", response_model=LCADataResponse)
async def get_lca(lca_id: str):
    """Get a specific LCA assessment"""
    db = get_database()
    
    if not ObjectId.is_valid(lca_id):
        raise HTTPException(status_code=400, detail="Invalid LCA ID format")
    
    assessment = await db.lca_assessments.find_one({"_id": ObjectId(lca_id)})
    
    if not assessment:
        raise HTTPException(status_code=404, detail="LCA assessment not found")
    
    assessment['_id'] = str(assessment['_id'])
    return assessment

@router.put("/{lca_id}", response_model=LCADataResponse)
async def update_lca(lca_id: str, lca_update: LCADataUpdate):
    """Update an LCA assessment"""
    db = get_database()
    
    if not ObjectId.is_valid(lca_id):
        raise HTTPException(status_code=400, detail="Invalid LCA ID format")
    
    # Get current data
    existing = await db.lca_assessments.find_one({"_id": ObjectId(lca_id)})
    if not existing:
        raise HTTPException(status_code=404, detail="LCA assessment not found")
    
    # Merge updates
    update_data = {k: v for k, v in lca_update.model_dump().items() if v is not None}
    
    if update_data:
        merged_data = {**existing, **update_data}
        
        # Recalculate derived values
        merged_data['co2Emission'] = calculate_emissions(merged_data)
        merged_data['circularityScore'] = calculate_circularity(merged_data)
        merged_data['updatedAt'] = datetime.utcnow()
        
        await db.lca_assessments.update_one(
            {"_id": ObjectId(lca_id)},
            {"$set": merged_data}
        )
    
    updated = await db.lca_assessments.find_one({"_id": ObjectId(lca_id)})
    updated['_id'] = str(updated['_id'])
    
    return updated

@router.delete("/{lca_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_lca(lca_id: str):
    """Delete an LCA assessment"""
    db = get_database()
    
    if not ObjectId.is_valid(lca_id):
        raise HTTPException(status_code=400, detail="Invalid LCA ID format")
    
    result = await db.lca_assessments.delete_one({"_id": ObjectId(lca_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="LCA assessment not found")

@router.post("/{lca_id}/simulate", response_model=dict)
async def simulate_changes(lca_id: str, changes: dict):
    """Simulate changes without saving - returns projected values"""
    db = get_database()
    
    if not ObjectId.is_valid(lca_id):
        raise HTTPException(status_code=400, detail="Invalid LCA ID format")
    
    existing = await db.lca_assessments.find_one({"_id": ObjectId(lca_id)})
    if not existing:
        raise HTTPException(status_code=404, detail="LCA assessment not found")
    
    # Merge changes for simulation
    simulated = {**existing, **changes}
    
    # Calculate new values
    new_co2 = calculate_emissions(simulated)
    new_circularity = calculate_circularity(simulated)
    
    return {
        'original': {
            'co2Emission': existing['co2Emission'],
            'circularityScore': existing['circularityScore']
        },
        'simulated': {
            'co2Emission': new_co2,
            'circularityScore': new_circularity
        },
        'difference': {
            'co2Emission': existing['co2Emission'] - new_co2,
            'circularityScore': new_circularity - existing['circularityScore']
        }
    }
