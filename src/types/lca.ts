export interface LCAData {
  // Core Metal Data
  metalType: 'Aluminium' | 'Steel' | 'Copper' | 'Zinc' | 'Lead';
  
  // Extraction Tab
  oreGrade: number; // %
  miningMethod: 'Open Pit' | 'Underground' | 'Heap Leach';
  waterUsage: number; // m³/ton
  
  // Energy Tab
  totalEnergyConsumption: number; // kWh
  gridMix: {
    coal: number;
    hydro: number;
    solar: number;
    naturalGas: number;
  };
  processHeat: number; // MJ
  
  // Smelting Tab
  furnaceType: 'Electric Arc' | 'Blast' | 'Induction';
  temperature: number; // °C
  fluxUsage: number; // kg/ton
  slagRecovery: number; // %
  
  // Logistics Tab
  transportMode: 'Road' | 'Rail' | 'Sea' | 'Multi';
  inboundDistance: number; // km
  outboundDistance: number; // km
  vehicleEfficiency: number; // kg CO2/km
  
  // Circularity Tab
  scrapInputRate: number; // % (Recycled Content)
  recyclingEfficiency: number; // % (Scrap Recovery Rate)
  wasteRecovery: number; // %
  closedLoopRate: number; // %
  
  // Derived Values
  co2Emission: number; // kg
  circularityScore: number; // 0-100
  
  // Scenario
  scenarioType: 'Current' | 'Optimized' | 'Baseline';
}

export interface ScanResult {
  scrapType: string;
  purity: number;
  estimatedWeight: number;
  co2Saved: number;
  revenueEstimate: number;
  recommendedProcess: string;
}

export interface DoctorAnalysis {
  overallScore: number;
  carbonIntensity: {
    value: number;
    benchmark: number;
    isGap: boolean;
  };
  energyEfficiency: {
    value: number;
    benchmark: number;
    isGap: boolean;
  };
  circularityRating: string;
  improvements: DoctorImprovement[];
  riskFactors: string[];
}

export interface DoctorImprovement {
  id: string;
  title: string;
  description: string;
  potentialGain: number; // % improvement
  category: 'energy' | 'transport' | 'process' | 'circularity';
  simulateAction: Partial<LCAData>;
}

export interface MaterialPassport {
  id: string;
  generatedAt: string;
  lcaData: LCAData;
  doctorAnalysis: DoctorAnalysis;
  provenance: ProvenanceEvent[];
  certifications: string[];
  qrCode: string;
}

export interface ProvenanceEvent {
  timestamp: string;
  event: string;
  location: string;
  verified: boolean;
}
