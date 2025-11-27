from app.models.lca import LCADataCreate, GridMix

def calculate_emissions(data: dict) -> float:
    """Calculate CO2 emissions based on LCA parameters"""
    total_energy = data.get('totalEnergyConsumption', 0)
    grid_mix = data.get('gridMix', {})
    inbound = data.get('inboundDistance', 0)
    outbound = data.get('outboundDistance', 0)
    efficiency = data.get('vehicleEfficiency', 0.12)
    scrap_rate = data.get('scrapInputRate', 0)
    process_heat = data.get('processHeat', 0)
    
    # Emission factors (kg CO2/kWh)
    coal_factor = 0.95
    hydro_factor = 0.02
    solar_factor = 0.05
    gas_factor = 0.45
    
    # Energy emissions
    energy_emissions = total_energy * (
        (grid_mix.get('coal', 0) / 100) * coal_factor +
        (grid_mix.get('hydro', 0) / 100) * hydro_factor +
        (grid_mix.get('solar', 0) / 100) * solar_factor +
        (grid_mix.get('naturalGas', 0) / 100) * gas_factor
    )
    
    # Transport emissions
    total_distance = inbound + outbound
    transport_emissions = total_distance * efficiency
    
    # Process emissions
    process_emissions = process_heat * 0.05
    
    # Recycled content offset (60% reduction potential)
    recycled_offset = (scrap_rate / 100) * 0.6
    
    total_emissions = (energy_emissions + transport_emissions + process_emissions) * (1 - recycled_offset)
    
    return round(total_emissions)

def calculate_circularity(data: dict) -> float:
    """Calculate circularity score based on recycling parameters"""
    scrap_rate = data.get('scrapInputRate', 0)
    recycling_efficiency = data.get('recyclingEfficiency', 0)
    waste_recovery = data.get('wasteRecovery', 0)
    closed_loop = data.get('closedLoopRate', 0)
    
    # Weighted circularity score
    score = (
        scrap_rate * 0.3 +
        recycling_efficiency * 0.3 +
        waste_recovery * 0.2 +
        closed_loop * 0.2
    )
    
    return round(score)

def get_circularity_grade(score: float) -> tuple:
    """Get grade and label based on circularity score"""
    if score >= 80:
        return ('A', 'Excellent')
    elif score >= 60:
        return ('B', 'Good')
    elif score >= 40:
        return ('C', 'Moderate')
    return ('D', 'Needs Improvement')
