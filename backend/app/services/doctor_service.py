from typing import Dict, Any, List
from app.services.calculations import calculate_emissions, calculate_circularity

def analyze_lca(lca_data: dict) -> dict:
    """
    Perform AI Doctor analysis on LCA data.
    Returns optimization recommendations and risk factors.
    """
    co2_emission = calculate_emissions(lca_data)
    circularity_score = calculate_circularity(lca_data)
    
    # Industry benchmarks
    carbon_benchmark = 1.8  # t CO2 per ton
    efficiency_benchmark = 85  # %
    
    carbon_intensity = co2_emission / 1000  # Convert to tons
    
    # Calculate overall score
    carbon_score = max(0, 100 - (carbon_intensity / carbon_benchmark * 30))
    circularity_weight = circularity_score * 0.4
    efficiency_estimate = min(95, 85 + (lca_data.get('slagRecovery', 0) * 0.1))
    efficiency_score = (efficiency_estimate / 100) * 30
    
    overall_score = round(carbon_score + circularity_weight + efficiency_score)
    
    # Generate improvements based on current data
    improvements = generate_improvements(lca_data)
    
    # Identify risk factors
    risk_factors = identify_risks(lca_data)
    
    # Determine circularity rating
    if circularity_score >= 70:
        circularity_rating = 'Good'
    elif circularity_score >= 50:
        circularity_rating = 'Moderate'
    else:
        circularity_rating = 'Needs Improvement'
    
    return {
        'overallScore': min(100, max(0, overall_score)),
        'carbonIntensity': {
            'value': round(carbon_intensity, 2),
            'benchmark': carbon_benchmark,
            'isGap': carbon_intensity > carbon_benchmark
        },
        'energyEfficiency': {
            'value': round(efficiency_estimate),
            'benchmark': efficiency_benchmark,
            'isGap': efficiency_estimate < efficiency_benchmark
        },
        'circularityRating': circularity_rating,
        'improvements': improvements,
        'riskFactors': risk_factors
    }

def generate_improvements(data: dict) -> List[dict]:
    """Generate contextual improvement recommendations"""
    improvements = []
    grid_mix = data.get('gridMix', {})
    
    # 1. Energy source optimization
    coal_pct = grid_mix.get('coal', 0)
    solar_pct = grid_mix.get('solar', 0)
    if coal_pct > 20:
        shift_amount = min(15, coal_pct - 20)
        improvements.append({
            'id': '1',
            'title': 'Increase Solar in Grid Mix',
            'description': f'Shifting {shift_amount}% of coal to solar would reduce carbon intensity by ~12%.',
            'potentialGain': 12,
            'category': 'energy',
            'simulateAction': {
                'gridMix': {
                    **grid_mix,
                    'coal': coal_pct - shift_amount,
                    'solar': solar_pct + shift_amount
                }
            }
        })
    
    # 2. Transport optimization
    if data.get('transportMode') == 'Road':
        improvements.append({
            'id': '2',
            'title': 'Switch to Rail Transport',
            'description': 'Rail transport for inbound logistics would cut transport emissions by 60%.',
            'potentialGain': 8,
            'category': 'transport',
            'simulateAction': {
                'transportMode': 'Rail',
                'vehicleEfficiency': 0.04
            }
        })
    
    # 3. Temperature optimization
    temp = data.get('temperature', 1200)
    if temp > 1100:
        improvements.append({
            'id': '3',
            'title': 'Optimize Furnace Temperature',
            'description': 'Reducing operating temperature by 100°C maintains quality while saving energy.',
            'potentialGain': 5,
            'category': 'process',
            'simulateAction': {
                'temperature': temp - 100
            }
        })
    
    # 4. Scrap input optimization
    scrap_rate = data.get('scrapInputRate', 0)
    if scrap_rate < 60:
        target_rate = min(65, scrap_rate + 20)
        improvements.append({
            'id': '4',
            'title': 'Increase Scrap Input Rate',
            'description': f'Boosting recycled content to {target_rate}% significantly improves circularity score.',
            'potentialGain': 15,
            'category': 'circularity',
            'simulateAction': {
                'scrapInputRate': target_rate
            }
        })
    
    # 5. Closed loop optimization
    closed_loop = data.get('closedLoopRate', 0)
    if closed_loop < 70:
        improvements.append({
            'id': '5',
            'title': 'Implement Closed-Loop Recovery',
            'description': 'Establishing closed-loop partnerships could achieve 80% material return rate.',
            'potentialGain': 10,
            'category': 'circularity',
            'simulateAction': {
                'closedLoopRate': 80
            }
        })
    
    return improvements[:5]  # Return top 5 improvements

def identify_risks(data: dict) -> List[str]:
    """Identify risk factors in current LCA configuration"""
    risks = []
    grid_mix = data.get('gridMix', {})
    
    if grid_mix.get('coal', 0) > 30:
        risks.append('High coal dependency in energy mix')
    
    if data.get('transportMode') == 'Road':
        total_dist = data.get('inboundDistance', 0) + data.get('outboundDistance', 0)
        if total_dist > 300:
            risks.append(f'Road transport over {total_dist}km contributes significantly to emissions')
    
    if data.get('scrapInputRate', 0) < 40:
        risks.append('Below industry benchmark for recycled content')
    
    if data.get('waterUsage', 0) > 25:
        risks.append('High water consumption may face regulatory scrutiny')
    
    if data.get('temperature', 0) > 1500:
        risks.append('High furnace temperature increases energy costs')
    
    return risks[:5]
