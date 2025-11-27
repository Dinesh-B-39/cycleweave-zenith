import random
from typing import Optional

# Mock scrap types and their typical properties
SCRAP_TYPES = [
    {
        'type': 'Aluminum UBC (Used Beverage Cans)',
        'purity_range': (88, 96),
        'weight_range': (800, 2000),
        'co2_factor': 0.7,
        'revenue_per_kg': 1.8,
        'process': 'Electric Arc Furnace'
    },
    {
        'type': 'Steel Shredded Scrap',
        'purity_range': (85, 95),
        'weight_range': (1500, 5000),
        'co2_factor': 0.5,
        'revenue_per_kg': 0.35,
        'process': 'Blast Furnace'
    },
    {
        'type': 'Copper Wire Scrap',
        'purity_range': (92, 99),
        'weight_range': (200, 800),
        'co2_factor': 0.9,
        'revenue_per_kg': 8.5,
        'process': 'Induction Furnace'
    },
    {
        'type': 'Zinc Die Cast Scrap',
        'purity_range': (90, 98),
        'weight_range': (300, 1200),
        'co2_factor': 0.6,
        'revenue_per_kg': 2.1,
        'process': 'Electric Arc Furnace'
    },
    {
        'type': 'Lead Battery Scrap',
        'purity_range': (70, 85),
        'weight_range': (500, 2500),
        'co2_factor': 0.4,
        'revenue_per_kg': 1.2,
        'process': 'Blast Furnace'
    }
]

def analyze_scrap(image_data: Optional[str] = None) -> dict:
    """
    Mock AI analysis of scrap material.
    In production, this would use computer vision/ML models.
    """
    # Randomly select a scrap type (simulating AI detection)
    scrap = random.choice(SCRAP_TYPES)
    
    # Generate random values within realistic ranges
    purity = round(random.uniform(*scrap['purity_range']), 1)
    weight = round(random.uniform(*scrap['weight_range']))
    
    # Calculate derived values
    co2_saved = round(weight * scrap['co2_factor'] * (purity / 100))
    revenue = round(weight * scrap['revenue_per_kg'] * (purity / 100), 2)
    
    return {
        'scrapType': scrap['type'],
        'purity': purity,
        'estimatedWeight': weight,
        'co2Saved': co2_saved,
        'revenueEstimate': revenue,
        'recommendedProcess': scrap['process']
    }
