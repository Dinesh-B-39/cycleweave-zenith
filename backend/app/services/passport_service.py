import qrcode
import base64
from io import BytesIO
from datetime import datetime
import random
import string
from typing import Optional
from app.services.calculations import get_circularity_grade

def generate_passport_id() -> str:
    """Generate unique passport ID"""
    timestamp = hex(int(datetime.now().timestamp()))[2:].upper()
    random_suffix = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
    return f"CW-{timestamp}-{random_suffix}"

def generate_qr_code(passport_id: str, base_url: str = "https://cycleweave.app") -> str:
    """Generate QR code as base64 string"""
    url = f"{base_url}/passport/{passport_id}"
    
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    
    buffer = BytesIO()
    img.save(buffer, format='PNG')
    buffer.seek(0)
    
    return base64.b64encode(buffer.getvalue()).decode()

def generate_provenance_events(metal_type: str) -> list:
    """Generate mock provenance timeline"""
    base_date = datetime.now()
    
    events = [
        {
            'timestamp': (base_date.replace(day=max(1, base_date.day - 20))).strftime('%Y-%m-%d %H:%M'),
            'event': 'Raw Material Sourced',
            'location': f'Mining Site A, {"Chile" if metal_type == "Copper" else "Australia"}',
            'verified': True
        },
        {
            'timestamp': (base_date.replace(day=max(1, base_date.day - 17))).strftime('%Y-%m-%d %H:%M'),
            'event': 'Transport to Smelter',
            'location': 'Port of Valparaiso',
            'verified': True
        },
        {
            'timestamp': (base_date.replace(day=max(1, base_date.day - 10))).strftime('%Y-%m-%d %H:%M'),
            'event': 'Smelting Process',
            'location': 'Smelter Facility B',
            'verified': True
        },
        {
            'timestamp': (base_date.replace(day=max(1, base_date.day - 4))).strftime('%Y-%m-%d %H:%M'),
            'event': 'Quality Certification',
            'location': 'Testing Lab C',
            'verified': True
        },
        {
            'timestamp': base_date.strftime('%Y-%m-%d %H:%M'),
            'event': 'Passport Generated',
            'location': 'CycleWeave Platform',
            'verified': True
        }
    ]
    
    return events

def create_passport_data(lca_data: dict, doctor_analysis_id: Optional[str] = None) -> dict:
    """Create complete passport data from LCA data"""
    passport_id = generate_passport_id()
    qr_code = generate_qr_code(passport_id)
    
    circularity_score = lca_data.get('circularityScore', 0)
    grade, grade_label = get_circularity_grade(circularity_score)
    
    provenance = generate_provenance_events(lca_data.get('metalType', 'Aluminium'))
    
    certifications = ['ISO 14001', 'ISO 14064', 'GHG Protocol', 'Circular Economy Standard']
    
    return {
        'passportId': passport_id,
        'metalType': lca_data.get('metalType'),
        'co2Emission': lca_data.get('co2Emission'),
        'circularityScore': circularity_score,
        'scrapInputRate': lca_data.get('scrapInputRate'),
        'totalDistance': lca_data.get('inboundDistance', 0) + lca_data.get('outboundDistance', 0),
        'transportMode': lca_data.get('transportMode'),
        'scenarioType': lca_data.get('scenarioType', 'Current'),
        'grade': grade,
        'gradeLabel': grade_label,
        'provenance': provenance,
        'certifications': certifications,
        'qrCode': qr_code,
        'doctorAnalysisId': doctor_analysis_id
    }
