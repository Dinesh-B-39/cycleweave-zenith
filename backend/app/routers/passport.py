from fastapi import APIRouter, HTTPException, status
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

from app.database import get_database
from app.models.passport import PassportCreate, PassportResponse
from app.services.passport_service import create_passport_data
from app.services.calculations import calculate_emissions, calculate_circularity

router = APIRouter(prefix="/api/passport", tags=["Material Passport"])

@router.post("/", response_model=dict, status_code=status.HTTP_201_CREATED)
async def generate_passport(request: PassportCreate):
    """Generate a new Material Passport for an LCA assessment"""
    db = get_database()
    
    if not ObjectId.is_valid(request.lcaId):
        raise HTTPException(status_code=400, detail="Invalid LCA ID format")
    
    # Get LCA data
    lca = await db.lca_assessments.find_one({"_id": ObjectId(request.lcaId)})
    if not lca:
        raise HTTPException(status_code=404, detail="LCA assessment not found")
    
    # Ensure calculated values are current
    lca['co2Emission'] = calculate_emissions(lca)
    lca['circularityScore'] = calculate_circularity(lca)
    
    # Create passport data
    passport_data = create_passport_data(lca, request.doctorAnalysisId)
    passport_data['lcaId'] = request.lcaId
    passport_data['generatedAt'] = datetime.utcnow()
    
    # Store passport
    result = await db.passports.insert_one(passport_data)
    
    passport_data['_id'] = str(result.inserted_id)
    
    return passport_data

@router.get("/", response_model=List[dict])
async def list_passports(skip: int = 0, limit: int = 50):
    """List all material passports"""
    db = get_database()
    
    cursor = db.passports.find().skip(skip).limit(limit).sort("generatedAt", -1)
    passports = await cursor.to_list(length=limit)
    
    for passport in passports:
        passport['_id'] = str(passport['_id'])
    
    return passports

@router.get("/{passport_id}", response_model=dict)
async def get_passport(passport_id: str):
    """Get a specific passport by MongoDB ID or passport ID"""
    db = get_database()
    
    # Try finding by MongoDB ObjectId first
    if ObjectId.is_valid(passport_id):
        passport = await db.passports.find_one({"_id": ObjectId(passport_id)})
    else:
        # Try finding by passportId
        passport = await db.passports.find_one({"passportId": passport_id})
    
    if not passport:
        raise HTTPException(status_code=404, detail="Passport not found")
    
    passport['_id'] = str(passport['_id'])
    return passport

@router.get("/lca/{lca_id}", response_model=List[dict])
async def get_passports_for_lca(lca_id: str):
    """Get all passports for a specific LCA assessment"""
    db = get_database()
    
    if not ObjectId.is_valid(lca_id):
        raise HTTPException(status_code=400, detail="Invalid LCA ID format")
    
    cursor = db.passports.find({"lcaId": lca_id}).sort("generatedAt", -1)
    passports = await cursor.to_list(length=100)
    
    for passport in passports:
        passport['_id'] = str(passport['_id'])
    
    return passports

@router.get("/{passport_id}/full", response_model=dict)
async def get_full_passport(passport_id: str):
    """Get passport with full LCA and doctor analysis data"""
    db = get_database()
    
    # Find passport
    if ObjectId.is_valid(passport_id):
        passport = await db.passports.find_one({"_id": ObjectId(passport_id)})
    else:
        passport = await db.passports.find_one({"passportId": passport_id})
    
    if not passport:
        raise HTTPException(status_code=404, detail="Passport not found")
    
    passport['_id'] = str(passport['_id'])
    
    # Get associated LCA data
    if passport.get('lcaId') and ObjectId.is_valid(passport['lcaId']):
        lca = await db.lca_assessments.find_one({"_id": ObjectId(passport['lcaId'])})
        if lca:
            lca['_id'] = str(lca['_id'])
            passport['lcaData'] = lca
    
    # Get associated doctor analysis
    if passport.get('doctorAnalysisId') and ObjectId.is_valid(passport['doctorAnalysisId']):
        analysis = await db.doctor_analyses.find_one({"_id": ObjectId(passport['doctorAnalysisId'])})
        if analysis:
            analysis['_id'] = str(analysis['_id'])
            passport['doctorAnalysis'] = analysis
    
    return passport

@router.delete("/{passport_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_passport(passport_id: str):
    """Delete a material passport"""
    db = get_database()
    
    if ObjectId.is_valid(passport_id):
        result = await db.passports.delete_one({"_id": ObjectId(passport_id)})
    else:
        result = await db.passports.delete_one({"passportId": passport_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Passport not found")
