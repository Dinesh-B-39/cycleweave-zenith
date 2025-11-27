from fastapi import APIRouter, HTTPException, status, UploadFile, File
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

from app.database import get_database
from app.models.scanner import ScanRequest, ScanResult, ScanResultCreate
from app.services.scanner_service import analyze_scrap

router = APIRouter(prefix="/api/scanner", tags=["Scanner"])

@router.post("/analyze", response_model=dict)
async def analyze_image(scan_request: Optional[ScanRequest] = None):
    """
    Analyze scrap material from image.
    Accepts base64 image or URL (mock implementation).
    """
    db = get_database()
    
    # Get analysis result (mock AI)
    image_data = scan_request.imageBase64 if scan_request else None
    analysis = analyze_scrap(image_data)
    
    # Store result
    analysis['createdAt'] = datetime.utcnow()
    analysis['lcaId'] = None
    
    result = await db.scan_results.insert_one(analysis)
    
    analysis['_id'] = str(result.inserted_id)
    
    return analysis

@router.post("/upload", response_model=dict)
async def upload_and_analyze(file: UploadFile = File(...)):
    """
    Upload image file and analyze scrap material.
    """
    db = get_database()
    
    # Read file (in production, would process with ML model)
    contents = await file.read()
    
    # Get analysis result (mock AI)
    analysis = analyze_scrap(None)
    
    # Store result
    analysis['createdAt'] = datetime.utcnow()
    analysis['lcaId'] = None
    analysis['filename'] = file.filename
    
    result = await db.scan_results.insert_one(analysis)
    
    analysis['_id'] = str(result.inserted_id)
    
    return analysis

@router.get("/", response_model=List[dict])
async def list_scans(skip: int = 0, limit: int = 50):
    """List all scan results"""
    db = get_database()
    
    cursor = db.scan_results.find().skip(skip).limit(limit).sort("createdAt", -1)
    scans = await cursor.to_list(length=limit)
    
    for scan in scans:
        scan['_id'] = str(scan['_id'])
    
    return scans

@router.get("/{scan_id}", response_model=dict)
async def get_scan(scan_id: str):
    """Get a specific scan result"""
    db = get_database()
    
    if not ObjectId.is_valid(scan_id):
        raise HTTPException(status_code=400, detail="Invalid scan ID format")
    
    scan = await db.scan_results.find_one({"_id": ObjectId(scan_id)})
    
    if not scan:
        raise HTTPException(status_code=404, detail="Scan result not found")
    
    scan['_id'] = str(scan['_id'])
    return scan

@router.post("/{scan_id}/apply/{lca_id}", response_model=dict)
async def apply_scan_to_lca(scan_id: str, lca_id: str):
    """Apply scan results to an LCA assessment"""
    db = get_database()
    
    if not ObjectId.is_valid(scan_id) or not ObjectId.is_valid(lca_id):
        raise HTTPException(status_code=400, detail="Invalid ID format")
    
    scan = await db.scan_results.find_one({"_id": ObjectId(scan_id)})
    if not scan:
        raise HTTPException(status_code=404, detail="Scan result not found")
    
    lca = await db.lca_assessments.find_one({"_id": ObjectId(lca_id)})
    if not lca:
        raise HTTPException(status_code=404, detail="LCA assessment not found")
    
    # Apply scan results to LCA
    updates = {
        'scrapInputRate': round(scan['purity']),
        'recyclingEfficiency': min(95, round(scan['purity'] * 0.95)),
        'furnaceType': 'Electric Arc' if 'Electric' in scan['recommendedProcess'] else lca.get('furnaceType', 'Electric Arc'),
        'updatedAt': datetime.utcnow()
    }
    
    await db.lca_assessments.update_one(
        {"_id": ObjectId(lca_id)},
        {"$set": updates}
    )
    
    # Link scan to LCA
    await db.scan_results.update_one(
        {"_id": ObjectId(scan_id)},
        {"$set": {"lcaId": lca_id}}
    )
    
    return {"message": "Scan applied to LCA successfully", "updates": updates}
