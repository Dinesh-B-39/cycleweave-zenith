from fastapi import APIRouter, HTTPException, status
from typing import List
from datetime import datetime
from bson import ObjectId

from app.database import get_database
from app.models.doctor import DoctorAnalysisRequest, DoctorAnalysisResponse
from app.services.doctor_service import analyze_lca

router = APIRouter(prefix="/api/doctor", tags=["AI Doctor"])

@router.post("/analyze", response_model=dict)
async def run_analysis(request: DoctorAnalysisRequest):
    """Run AI Doctor analysis on an LCA assessment"""
    db = get_database()
    
    if not ObjectId.is_valid(request.lcaId):
        raise HTTPException(status_code=400, detail="Invalid LCA ID format")
    
    # Get LCA data
    lca = await db.lca_assessments.find_one({"_id": ObjectId(request.lcaId)})
    if not lca:
        raise HTTPException(status_code=404, detail="LCA assessment not found")
    
    # Run analysis
    analysis = analyze_lca(lca)
    
    # Store analysis result
    analysis['lcaId'] = request.lcaId
    analysis['createdAt'] = datetime.utcnow()
    
    result = await db.doctor_analyses.insert_one(analysis)
    
    analysis['_id'] = str(result.inserted_id)
    
    return analysis

@router.get("/", response_model=List[dict])
async def list_analyses(skip: int = 0, limit: int = 50):
    """List all doctor analyses"""
    db = get_database()
    
    cursor = db.doctor_analyses.find().skip(skip).limit(limit).sort("createdAt", -1)
    analyses = await cursor.to_list(length=limit)
    
    for analysis in analyses:
        analysis['_id'] = str(analysis['_id'])
    
    return analyses

@router.get("/{analysis_id}", response_model=dict)
async def get_analysis(analysis_id: str):
    """Get a specific doctor analysis"""
    db = get_database()
    
    if not ObjectId.is_valid(analysis_id):
        raise HTTPException(status_code=400, detail="Invalid analysis ID format")
    
    analysis = await db.doctor_analyses.find_one({"_id": ObjectId(analysis_id)})
    
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    analysis['_id'] = str(analysis['_id'])
    return analysis

@router.get("/lca/{lca_id}", response_model=List[dict])
async def get_analyses_for_lca(lca_id: str):
    """Get all analyses for a specific LCA assessment"""
    db = get_database()
    
    if not ObjectId.is_valid(lca_id):
        raise HTTPException(status_code=400, detail="Invalid LCA ID format")
    
    cursor = db.doctor_analyses.find({"lcaId": lca_id}).sort("createdAt", -1)
    analyses = await cursor.to_list(length=100)
    
    for analysis in analyses:
        analysis['_id'] = str(analysis['_id'])
    
    return analyses

@router.post("/{analysis_id}/apply/{improvement_id}", response_model=dict)
async def apply_improvement(analysis_id: str, improvement_id: str):
    """Apply a specific improvement recommendation to the LCA"""
    db = get_database()
    
    if not ObjectId.is_valid(analysis_id):
        raise HTTPException(status_code=400, detail="Invalid analysis ID format")
    
    analysis = await db.doctor_analyses.find_one({"_id": ObjectId(analysis_id)})
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    # Find the improvement
    improvement = None
    for imp in analysis.get('improvements', []):
        if imp['id'] == improvement_id:
            improvement = imp
            break
    
    if not improvement:
        raise HTTPException(status_code=404, detail="Improvement not found")
    
    # Get LCA and apply changes
    lca_id = analysis['lcaId']
    if not ObjectId.is_valid(lca_id):
        raise HTTPException(status_code=400, detail="Invalid LCA ID in analysis")
    
    lca = await db.lca_assessments.find_one({"_id": ObjectId(lca_id)})
    if not lca:
        raise HTTPException(status_code=404, detail="LCA assessment not found")
    
    # Apply simulation action
    updates = {**improvement['simulateAction'], 'updatedAt': datetime.utcnow(), 'scenarioType': 'Optimized'}
    
    await db.lca_assessments.update_one(
        {"_id": ObjectId(lca_id)},
        {"$set": updates}
    )
    
    return {
        "message": f"Applied improvement: {improvement['title']}",
        "potentialGain": improvement['potentialGain'],
        "changes": improvement['simulateAction']
    }
