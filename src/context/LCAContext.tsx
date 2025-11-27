import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { LCAData, ScanResult, DoctorAnalysis } from '@/types/lca';
import { lcaApi } from '@/lib/api';

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
  lcaId: string | null;
  updateLCAData: (updates: Partial<LCAData>) => void;
  resetLCAData: () => void;
  calculateEmissions: () => number;
  calculateCircularity: () => number;
  lastScanResult: ScanResult | null;
  lastScanId: string | null;
  setLastScanResult: (result: ScanResult | null, id?: string | null) => void;
  doctorAnalysis: DoctorAnalysis | null;
  doctorAnalysisId: string | null;
  setDoctorAnalysis: (analysis: DoctorAnalysis | null, id?: string | null) => void;
  applySimulation: (simulation: Partial<LCAData>) => void;
  isBackendConnected: boolean;
  isSaving: boolean;
  createNewLCA: () => Promise<string | null>;
  loadLCA: (id: string) => Promise<void>;
}

const LCAContext = createContext<LCAContextType | undefined>(undefined);

export function LCAProvider({ children }: { children: React.ReactNode }) {
  const [lcaData, setLCAData] = useState<LCAData>(defaultLCAData);
  const [lcaId, setLcaId] = useState<string | null>(null);
  const [lastScanResult, setLastScanResultState] = useState<ScanResult | null>(null);
  const [lastScanId, setLastScanId] = useState<string | null>(null);
  const [doctorAnalysis, setDoctorAnalysisState] = useState<DoctorAnalysis | null>(null);
  const [doctorAnalysisId, setDoctorAnalysisId] = useState<string | null>(null);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Check backend connection on mount
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/health`);
        setIsBackendConnected(response.ok);
      } catch {
        setIsBackendConnected(false);
      }
    };
    checkBackend();
  }, []);

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

    const coalFactor = 0.95;
    const hydroFactor = 0.02;
    const solarFactor = 0.05;
    const gasFactor = 0.45;

    const energyEmissions = totalEnergyConsumption * (
      (gridMix.coal / 100) * coalFactor +
      (gridMix.hydro / 100) * hydroFactor +
      (gridMix.solar / 100) * solarFactor +
      (gridMix.naturalGas / 100) * gasFactor
    );

    const totalDistance = inboundDistance + outboundDistance;
    const transportEmissions = totalDistance * vehicleEfficiency;
    const processEmissions = processHeat * 0.05;
    const recycledOffset = (scrapInputRate / 100) * 0.6;

    const totalEmissions = (energyEmissions + transportEmissions + processEmissions) * (1 - recycledOffset);
    
    return Math.round(totalEmissions);
  }, [lcaData]);

  const calculateCircularity = useCallback(() => {
    const { scrapInputRate, recyclingEfficiency, wasteRecovery, closedLoopRate } = lcaData;
    
    const score = (
      scrapInputRate * 0.3 +
      recyclingEfficiency * 0.3 +
      wasteRecovery * 0.2 +
      closedLoopRate * 0.2
    );
    
    return Math.round(score);
  }, [lcaData]);

  // Save to backend when data changes (debounced)
  useEffect(() => {
    if (!lcaId || !isBackendConnected) return;

    const timer = setTimeout(async () => {
      setIsSaving(true);
      try {
        await lcaApi.update(lcaId, lcaData);
      } catch (error) {
        console.error('Failed to save LCA data:', error);
      } finally {
        setIsSaving(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [lcaData, lcaId, isBackendConnected]);

  const createNewLCA = useCallback(async (): Promise<string | null> => {
    if (!isBackendConnected) return null;
    
    try {
      const result = await lcaApi.create(lcaData);
      const data = result.data as { _id: string } | null;
      if (data && data._id) {
        setLcaId(data._id);
        return data._id;
      }
    } catch (error) {
      console.error('Failed to create LCA:', error);
    }
    return null;
  }, [lcaData, isBackendConnected]);

  const loadLCA = useCallback(async (id: string) => {
    if (!isBackendConnected) return;
    
    try {
      const result = await lcaApi.get(id);
      if (result.data) {
        const { _id, createdAt, updatedAt, ...data } = result.data as any;
        setLCAData(data);
        setLcaId(_id);
      }
    } catch (error) {
      console.error('Failed to load LCA:', error);
    }
  }, [isBackendConnected]);

  const updateLCAData = useCallback((updates: Partial<LCAData>) => {
    setLCAData(prev => ({ ...prev, ...updates }));
  }, []);

  const resetLCAData = useCallback(() => {
    setLCAData(defaultLCAData);
    setLcaId(null);
    setLastScanResultState(null);
    setLastScanId(null);
    setDoctorAnalysisState(null);
    setDoctorAnalysisId(null);
  }, []);

  const setLastScanResult = useCallback((result: ScanResult | null, id: string | null = null) => {
    setLastScanResultState(result);
    setLastScanId(id);
  }, []);

  const setDoctorAnalysis = useCallback((analysis: DoctorAnalysis | null, id: string | null = null) => {
    setDoctorAnalysisState(analysis);
    setDoctorAnalysisId(id);
  }, []);

  const applySimulation = useCallback((simulation: Partial<LCAData>) => {
    setLCAData(prev => ({
      ...prev,
      ...simulation,
      scenarioType: 'Optimized' as const,
    }));
  }, []);

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
      lcaId,
      updateLCAData,
      resetLCAData,
      calculateEmissions,
      calculateCircularity,
      lastScanResult,
      lastScanId,
      setLastScanResult,
      doctorAnalysis,
      doctorAnalysisId,
      setDoctorAnalysis,
      applySimulation,
      isBackendConnected,
      isSaving,
      createNewLCA,
      loadLCA,
    };
  }, [
    lcaData, lcaId, updateLCAData, resetLCAData, calculateEmissions, calculateCircularity,
    lastScanResult, lastScanId, setLastScanResult, doctorAnalysis, doctorAnalysisId, setDoctorAnalysis,
    applySimulation, isBackendConnected, isSaving, createNewLCA, loadLCA
  ]);

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
