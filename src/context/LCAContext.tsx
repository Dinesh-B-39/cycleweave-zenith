import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { LCAData, ScanResult, DoctorAnalysis } from '@/types/lca';

const defaultLCAData: LCAData = {
  metalType: 'Aluminium',
  oreGrade: 45,
  miningMethod: 'Open Pit',
  waterUsage: 12.5,
  totalEnergyConsumption: 14500,
  gridMix: {
    coal: 35,
    hydro: 25,
    solar: 20,
    naturalGas: 20,
  },
  processHeat: 8500,
  furnaceType: 'Electric Arc',
  temperature: 1200,
  fluxUsage: 45,
  slagRecovery: 78,
  transportMode: 'Road',
  inboundDistance: 250,
  outboundDistance: 180,
  vehicleEfficiency: 0.12,
  scrapInputRate: 42,
  recyclingEfficiency: 87,
  wasteRecovery: 65,
  closedLoopRate: 55,
  co2Emission: 2850,
  circularityScore: 68,
  scenarioType: 'Current',
};

interface LCAContextType {
  lcaData: LCAData;
  updateLCAData: (updates: Partial<LCAData>) => void;
  resetLCAData: () => void;
  calculateEmissions: () => number;
  calculateCircularity: () => number;
  lastScanResult: ScanResult | null;
  setLastScanResult: (result: ScanResult | null) => void;
  doctorAnalysis: DoctorAnalysis | null;
  setDoctorAnalysis: (analysis: DoctorAnalysis | null) => void;
  applySimulation: (simulation: Partial<LCAData>) => void;
}

const LCAContext = createContext<LCAContextType | undefined>(undefined);

export function LCAProvider({ children }: { children: React.ReactNode }) {
  const [lcaData, setLCAData] = useState<LCAData>(defaultLCAData);
  const [lastScanResult, setLastScanResult] = useState<ScanResult | null>(null);
  const [doctorAnalysis, setDoctorAnalysis] = useState<DoctorAnalysis | null>(null);

  const calculateEmissions = useCallback(() => {
    const { 
      totalEnergyConsumption, 
      gridMix, 
      inboundDistance, 
      outboundDistance, 
      vehicleEfficiency,
      scrapInputRate,
      processHeat
    } = lcaData;

    // Energy emissions based on grid mix
    const coalFactor = 0.95; // kg CO2/kWh
    const hydroFactor = 0.02;
    const solarFactor = 0.05;
    const gasFactor = 0.45;

    const energyEmissions = totalEnergyConsumption * (
      (gridMix.coal / 100) * coalFactor +
      (gridMix.hydro / 100) * hydroFactor +
      (gridMix.solar / 100) * solarFactor +
      (gridMix.naturalGas / 100) * gasFactor
    );

    // Transport emissions
    const totalDistance = inboundDistance + outboundDistance;
    const transportEmissions = totalDistance * vehicleEfficiency;

    // Process heat emissions (simplified)
    const processEmissions = processHeat * 0.05;

    // Recycled content offset
    const recycledOffset = (scrapInputRate / 100) * 0.6; // 60% reduction potential

    const totalEmissions = (energyEmissions + transportEmissions + processEmissions) * (1 - recycledOffset);
    
    return Math.round(totalEmissions);
  }, [lcaData]);

  const calculateCircularity = useCallback(() => {
    const { scrapInputRate, recyclingEfficiency, wasteRecovery, closedLoopRate } = lcaData;
    
    // Weighted circularity score
    const score = (
      scrapInputRate * 0.3 +
      recyclingEfficiency * 0.3 +
      wasteRecovery * 0.2 +
      closedLoopRate * 0.2
    );
    
    return Math.round(score);
  }, [lcaData]);

  const updateLCAData = useCallback((updates: Partial<LCAData>) => {
    setLCAData(prev => {
      const newData = { ...prev, ...updates };
      return newData;
    });
  }, []);

  const resetLCAData = useCallback(() => {
    setLCAData(defaultLCAData);
    setLastScanResult(null);
    setDoctorAnalysis(null);
  }, []);

  const applySimulation = useCallback((simulation: Partial<LCAData>) => {
    setLCAData(prev => ({
      ...prev,
      ...simulation,
      scenarioType: 'Optimized' as const,
    }));
  }, []);

  // Auto-update derived values
  const contextValue = useMemo(() => {
    const emissions = calculateEmissions();
    const circularity = calculateCircularity();
    
    if (emissions !== lcaData.co2Emission || circularity !== lcaData.circularityScore) {
      setLCAData(prev => ({
        ...prev,
        co2Emission: emissions,
        circularityScore: circularity,
      }));
    }

    return {
      lcaData: { ...lcaData, co2Emission: emissions, circularityScore: circularity },
      updateLCAData,
      resetLCAData,
      calculateEmissions,
      calculateCircularity,
      lastScanResult,
      setLastScanResult,
      doctorAnalysis,
      setDoctorAnalysis,
      applySimulation,
    };
  }, [lcaData, updateLCAData, resetLCAData, calculateEmissions, calculateCircularity, lastScanResult, doctorAnalysis, applySimulation]);

  return (
    <LCAContext.Provider value={contextValue}>
      {children}
    </LCAContext.Provider>
  );
}

export function useLCA() {
  const context = useContext(LCAContext);
  if (context === undefined) {
    throw new Error('useLCA must be used within a LCAProvider');
  }
  return context;
}
