import { useState, useCallback } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useLCA } from '@/context/LCAContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { DoctorAnalysis, DoctorImprovement } from '@/types/lca';
import { 
  Stethoscope, 
  Loader2, 
  AlertTriangle, 
  TrendingUp, 
  Play,
  CheckCircle,
  Zap,
  Truck,
  Settings,
  Recycle,
  Wifi,
  WifiOff
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useRunDoctorAnalysis, useApplyImprovement } from '@/hooks/use-doctor-api';

const categoryIcons = {
  energy: Zap,
  transport: Truck,
  process: Settings,
  circularity: Recycle,
};

export default function Doctor() {
  const { lcaData, applySimulation, setDoctorAnalysis, isBackendConnected, lcaId, createNewLCA } = useLCA();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<DoctorAnalysis | null>(null);
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [simulatedImprovement, setSimulatedImprovement] = useState<string | null>(null);

  const runAnalysisMutation = useRunDoctorAnalysis();
  const applyImprovementMutation = useApplyImprovement();

  const runAnalysis = useCallback(async () => {
    setIsAnalyzing(true);
    
    try {
      if (isBackendConnected) {
        // Ensure we have an LCA ID
        let currentLcaId = lcaId;
        if (!currentLcaId) {
          currentLcaId = await createNewLCA();
        }
        
        if (currentLcaId) {
          const result = await runAnalysisMutation.mutateAsync(currentLcaId);
          
          setAnalysis({
            overallScore: result.overallScore,
            carbonIntensity: result.carbonIntensity,
            energyEfficiency: result.energyEfficiency,
            circularityRating: result.circularityRating,
            improvements: result.improvements,
            riskFactors: result.riskFactors,
          });
          setAnalysisId(result._id);
          setDoctorAnalysis(result, result._id);
        }
      } else {
        // Fallback to mock data
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const mockAnalysis: DoctorAnalysis = {
          overallScore: 72,
          carbonIntensity: {
            value: lcaData.co2Emission / 1000,
            benchmark: 1.8,
            isGap: lcaData.co2Emission / 1000 > 1.8,
          },
          energyEfficiency: {
            value: 78,
            benchmark: 85,
            isGap: true,
          },
          circularityRating: lcaData.circularityScore >= 70 ? 'Good' : 'Needs Improvement',
          improvements: [
            {
              id: '1',
              title: 'Increase Solar in Grid Mix',
              description: 'Shifting 15% of coal to solar would reduce carbon intensity by 12%.',
              potentialGain: 12,
              category: 'energy',
              simulateAction: {
                gridMix: { ...lcaData.gridMix, coal: lcaData.gridMix.coal - 15, solar: lcaData.gridMix.solar + 15 }
              }
            },
            {
              id: '2',
              title: 'Switch to Rail Transport',
              description: 'Rail transport for inbound logistics would cut transport emissions by 60%.',
              potentialGain: 8,
              category: 'transport',
              simulateAction: { transportMode: 'Rail', vehicleEfficiency: 0.04 }
            },
            {
              id: '3',
              title: 'Optimize Furnace Temperature',
              description: 'Reducing operating temperature by 100°C maintains quality while saving energy.',
              potentialGain: 5,
              category: 'process',
              simulateAction: { temperature: lcaData.temperature - 100 }
            },
            {
              id: '4',
              title: 'Increase Scrap Input Rate',
              description: 'Boosting recycled content to 65% significantly improves circularity score.',
              potentialGain: 15,
              category: 'circularity',
              simulateAction: { scrapInputRate: 65 }
            },
            {
              id: '5',
              title: 'Implement Closed-Loop Recovery',
              description: 'Establishing closed-loop partnerships could achieve 80% material return rate.',
              potentialGain: 10,
              category: 'circularity',
              simulateAction: { closedLoopRate: 80 }
            },
          ],
          riskFactors: [
            'High coal dependency in energy mix',
            'Road transport contributes 23% of total emissions',
            'Below industry benchmark for recycled content',
          ],
        };
        
        setAnalysis(mockAnalysis);
        setDoctorAnalysis(mockAnalysis, null);
        setAnalysisId(null);
      }
    } catch (error) {
      toast({
        title: 'Analysis Failed',
        description: (error as Error).message || 'Failed to run AI Doctor analysis.',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [isBackendConnected, lcaId, createNewLCA, runAnalysisMutation, lcaData, setDoctorAnalysis, toast]);

  const simulateImprovement = useCallback(async (improvement: DoctorImprovement) => {
    try {
      if (isBackendConnected && analysisId) {
        await applyImprovementMutation.mutateAsync({
          analysisId,
          improvementId: improvement.id,
        });
      }
      
      setSimulatedImprovement(improvement.id);
      applySimulation(improvement.simulateAction);
      
      toast({
        title: 'Simulation Applied',
        description: `Preview showing potential ${improvement.potentialGain}% improvement.`,
      });
    } catch (error) {
      toast({
        title: 'Simulation Failed',
        description: (error as Error).message || 'Failed to apply improvement.',
        variant: 'destructive',
      });
    }
  }, [isBackendConnected, analysisId, applyImprovementMutation, applySimulation, toast]);

  return (
    <MainLayout>
      <div className="h-screen flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex-shrink-0 px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Stethoscope className="w-6 h-6 text-primary" />
                AI Doctor
              </h1>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                Intelligent analysis and optimization recommendations
                {isBackendConnected ? (
                  <span className="inline-flex items-center gap-1 text-xs text-secondary">
                    <Wifi className="w-3 h-3" /> API Connected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <WifiOff className="w-3 h-3" /> Offline Mode
                  </span>
                )}
              </p>
            </div>
            <div className="flex gap-3">
              {analysis && (
                <Button variant="outline" onClick={() => navigate('/passport')}>
                  Generate Passport
                </Button>
              )}
              <Button variant="ghost" onClick={() => navigate('/')}>
                Back to Dashboard
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Analysis Trigger */}
            {!analysis && !isAnalyzing && (
              <div className="glass-card p-8 text-center">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <Stethoscope className="w-12 h-12 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">
                  Ready for Analysis
                </h2>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  The AI Doctor will analyze your current LCA parameters and provide 
                  actionable recommendations for improvement.
                </p>
                <Button size="lg" onClick={runAnalysis} className="gap-2">
                  <Play className="w-5 h-5" />
                  Send to AI Doctor
                </Button>
              </div>
            )}

            {/* Loading State */}
            {isAnalyzing && (
              <div className="glass-card p-8 text-center">
                <Loader2 className="w-16 h-16 mx-auto text-primary animate-spin" />
                <p className="mt-4 text-foreground font-medium animate-pulse">
                  Analyzing LCA Data...
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Comparing against industry benchmarks
                </p>
              </div>
            )}

            {/* Results */}
            {analysis && (
              <div className="space-y-6 animate-fade-in-up">
                {/* Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="glass-card p-5">
                    <p className="text-sm text-muted-foreground mb-1">Overall Score</p>
                    <p className="text-3xl font-bold text-primary">{analysis.overallScore}/100</p>
                  </div>
                  
                  <div className="glass-card p-5">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm text-muted-foreground">Carbon Intensity</p>
                      {analysis.carbonIntensity.isGap && (
                        <span className="gap-chip">GAP</span>
                      )}
                    </div>
                    <p className="text-3xl font-bold text-foreground">
                      {analysis.carbonIntensity.value.toFixed(2)}
                      <span className="text-sm text-muted-foreground ml-1">t CO₂/t</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Benchmark: {analysis.carbonIntensity.benchmark} t CO₂/t
                    </p>
                  </div>
                  
                  <div className="glass-card p-5">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm text-muted-foreground">Energy Efficiency</p>
                      {analysis.energyEfficiency.isGap && (
                        <span className="gap-chip">GAP</span>
                      )}
                    </div>
                    <p className="text-3xl font-bold text-foreground">
                      {analysis.energyEfficiency.value}%
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Benchmark: {analysis.energyEfficiency.benchmark}%
                    </p>
                  </div>
                </div>

                {/* Risk Factors */}
                <div className="glass-card p-5 border-l-4 border-l-accent">
                  <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-accent" />
                    Risk Factors Identified
                  </h3>
                  <ul className="space-y-2">
                    {analysis.riskFactors.map((risk, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-accent">•</span>
                        {risk}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Improvement Opportunities */}
                <div className="glass-card p-5">
                  <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-secondary" />
                    5 Improvement Opportunities
                  </h3>
                  <div className="space-y-4">
                    {analysis.improvements.map((improvement, index) => {
                      const Icon = categoryIcons[improvement.category];
                      const isSimulated = simulatedImprovement === improvement.id;
                      
                      return (
                        <div
                          key={improvement.id}
                          className={cn(
                            'p-4 rounded-lg border transition-all',
                            isSimulated 
                              ? 'border-secondary bg-secondary/10' 
                              : 'border-border bg-muted/30 hover:bg-muted/50'
                          )}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div className={cn(
                                'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                                improvement.category === 'energy' && 'bg-secondary/20',
                                improvement.category === 'transport' && 'bg-primary/20',
                                improvement.category === 'process' && 'bg-accent/20',
                                improvement.category === 'circularity' && 'bg-secondary/20'
                              )}>
                                <Icon className={cn(
                                  'w-4 h-4',
                                  improvement.category === 'energy' && 'text-secondary',
                                  improvement.category === 'transport' && 'text-primary',
                                  improvement.category === 'process' && 'text-accent',
                                  improvement.category === 'circularity' && 'text-secondary'
                                )} />
                              </div>
                              <div>
                                <p className="font-medium text-foreground">
                                  {index + 1}. {improvement.title}
                                </p>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {improvement.description}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-lg font-bold text-secondary">
                                +{improvement.potentialGain}%
                              </span>
                              <Button
                                size="sm"
                                variant={isSimulated ? 'default' : 'outline'}
                                onClick={() => simulateImprovement(improvement)}
                                disabled={isSimulated || applyImprovementMutation.isPending}
                                className="gap-1"
                              >
                                {isSimulated ? (
                                  <>
                                    <CheckCircle className="w-4 h-4" />
                                    Applied
                                  </>
                                ) : applyImprovementMutation.isPending ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <>
                                    <Play className="w-4 h-4" />
                                    Simulate
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Re-analyze Button */}
                <div className="text-center">
                  <Button variant="outline" onClick={runAnalysis} className="gap-2">
                    <Stethoscope className="w-4 h-4" />
                    Re-run Analysis
                  </Button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </MainLayout>
  );
}
