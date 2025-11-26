import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useLCA } from '@/context/LCAContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Download, 
  QrCode, 
  Shield, 
  Clock,
  CheckCircle,
  Leaf,
  Factory,
  Truck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function Passport() {
  const { lcaData, doctorAnalysis } = useLCA();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const passportId = useMemo(() => {
    return `CW-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  }, []);

  const provenanceEvents = [
    { timestamp: '2024-01-15 09:30', event: 'Raw Material Sourced', location: 'Mining Site A, Chile', verified: true },
    { timestamp: '2024-01-18 14:15', event: 'Transport to Smelter', location: 'Port of Valparaiso', verified: true },
    { timestamp: '2024-01-25 08:00', event: 'Smelting Process', location: 'Smelter Facility B', verified: true },
    { timestamp: '2024-02-01 16:45', event: 'Quality Certification', location: 'Testing Lab C', verified: true },
    { timestamp: '2024-02-05 10:00', event: 'Passport Generated', location: 'CycleWeave Platform', verified: true },
  ];

  const downloadPDF = async () => {
    setIsGenerating(true);
    
    // Simulate PDF generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: 'PDF Generated',
      description: 'Material Passport downloaded successfully.',
    });
    
    setIsGenerating(false);
  };

  const getCircularityGrade = (score: number) => {
    if (score >= 80) return { grade: 'A', label: 'Excellent', color: 'text-secondary' };
    if (score >= 60) return { grade: 'B', label: 'Good', color: 'text-primary' };
    if (score >= 40) return { grade: 'C', label: 'Moderate', color: 'text-accent' };
    return { grade: 'D', label: 'Needs Improvement', color: 'text-destructive' };
  };

  const circularityGrade = getCircularityGrade(lcaData.circularityScore);

  return (
    <MainLayout showPreview={false}>
      <div className="h-screen flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex-shrink-0 px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <FileText className="w-6 h-6 text-primary" />
                Material Passport
              </h1>
              <p className="text-sm text-muted-foreground">
                Comprehensive LCA documentation and provenance tracking
              </p>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={downloadPDF} 
                disabled={isGenerating}
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                {isGenerating ? 'Generating...' : 'Download PDF'}
              </Button>
              <Button variant="ghost" onClick={() => navigate('/')}>
                Back to Dashboard
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-grid-pattern">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Holographic Card */}
            <div className="relative">
              <div className="absolute inset-0 holographic opacity-20 rounded-2xl blur-xl" />
              <div className="relative glass-card p-8 neon-border-teal rounded-2xl">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-5 h-5 text-primary" />
                      <span className="text-xs font-mono text-muted-foreground">VERIFIED MATERIAL PASSPORT</span>
                    </div>
                    <h2 className="text-3xl font-bold text-foreground">{lcaData.metalType}</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Lifecycle Assessment Certificate
                    </p>
                  </div>
                  
                  {/* QR Code Placeholder */}
                  <div className="w-24 h-24 bg-foreground rounded-lg flex items-center justify-center">
                    <QrCode className="w-20 h-20 text-background" />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div>
                    <p className="text-xs text-muted-foreground">Passport ID</p>
                    <p className="font-mono text-sm text-foreground">{passportId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Issue Date</p>
                    <p className="font-mono text-sm text-foreground">{new Date().toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Scenario</p>
                    <p className="font-mono text-sm text-foreground">{lcaData.scenarioType}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Grade</p>
                    <p className={cn('font-bold text-lg', circularityGrade.color)}>
                      {circularityGrade.grade}
                    </p>
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
                  <div className="text-center">
                    <Leaf className="w-6 h-6 mx-auto text-secondary mb-2" />
                    <p className="text-2xl font-bold text-foreground">{lcaData.co2Emission}</p>
                    <p className="text-xs text-muted-foreground">kg CO₂</p>
                  </div>
                  <div className="text-center">
                    <Factory className="w-6 h-6 mx-auto text-primary mb-2" />
                    <p className="text-2xl font-bold text-foreground">{lcaData.circularityScore}%</p>
                    <p className="text-xs text-muted-foreground">Circularity</p>
                  </div>
                  <div className="text-center">
                    <Truck className="w-6 h-6 mx-auto text-accent mb-2" />
                    <p className="text-2xl font-bold text-foreground">{lcaData.inboundDistance + lcaData.outboundDistance}</p>
                    <p className="text-xs text-muted-foreground">km Transport</p>
                  </div>
                  <div className="text-center">
                    <Shield className="w-6 h-6 mx-auto text-primary mb-2" />
                    <p className="text-2xl font-bold text-foreground">{lcaData.scrapInputRate}%</p>
                    <p className="text-xs text-muted-foreground">Recycled Content</p>
                  </div>
                </div>
              </div>
            </div>

            {/* LCA Data Summary */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">LCA Data Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Extraction */}
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-primary">01 Extraction</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Mining Method</span>
                      <span className="text-foreground">{lcaData.miningMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ore Grade</span>
                      <span className="text-foreground">{lcaData.oreGrade}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Water Usage</span>
                      <span className="text-foreground">{lcaData.waterUsage} m³/ton</span>
                    </div>
                  </div>
                </div>

                {/* Energy */}
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-secondary">02 Energy</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Consumption</span>
                      <span className="text-foreground">{lcaData.totalEnergyConsumption.toLocaleString()} kWh</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Renewable %</span>
                      <span className="text-foreground">{lcaData.gridMix.solar + lcaData.gridMix.hydro}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Process Heat</span>
                      <span className="text-foreground">{lcaData.processHeat.toLocaleString()} MJ</span>
                    </div>
                  </div>
                </div>

                {/* Smelting */}
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-accent">03 Smelting</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Furnace Type</span>
                      <span className="text-foreground">{lcaData.furnaceType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Temperature</span>
                      <span className="text-foreground">{lcaData.temperature}°C</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Slag Recovery</span>
                      <span className="text-foreground">{lcaData.slagRecovery}%</span>
                    </div>
                  </div>
                </div>

                {/* Logistics */}
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-primary">04 Logistics</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Transport Mode</span>
                      <span className="text-foreground">{lcaData.transportMode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Distance</span>
                      <span className="text-foreground">{lcaData.inboundDistance + lcaData.outboundDistance} km</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Efficiency</span>
                      <span className="text-foreground">{lcaData.vehicleEfficiency} kg/km</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Provenance Timeline */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Provenance Timeline
              </h3>
              <div className="space-y-4">
                {provenanceEvents.map((event, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                        event.verified ? 'bg-secondary/20' : 'bg-muted'
                      )}>
                        {event.verified ? (
                          <CheckCircle className="w-4 h-4 text-secondary" />
                        ) : (
                          <Clock className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                      {index < provenanceEvents.length - 1 && (
                        <div className="w-px h-12 bg-border mt-2" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="font-medium text-foreground">{event.event}</p>
                      <p className="text-sm text-muted-foreground">{event.location}</p>
                      <p className="text-xs text-muted-foreground mt-1">{event.timestamp}</p>
                    </div>
                    {event.verified && (
                      <span className="text-xs text-secondary font-medium px-2 py-1 bg-secondary/10 rounded">
                        Verified
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Doctor Recommendations (if available) */}
            {doctorAnalysis && (
              <div className="glass-card p-6">
                <h3 className="text-lg font-bold text-foreground mb-4">AI Doctor Recommendations</h3>
                <div className="space-y-3">
                  {doctorAnalysis.improvements.slice(0, 5).map((imp, index) => (
                    <div key={imp.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <span className="text-sm font-mono text-muted-foreground">{index + 1}.</span>
                      <span className="text-sm text-foreground flex-1">{imp.title}</span>
                      <span className="text-sm font-bold text-secondary">+{imp.potentialGain}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Certifications</h3>
              <div className="flex flex-wrap gap-3">
                {['ISO 14001', 'ISO 14064', 'GHG Protocol', 'Circular Economy Standard'].map((cert) => (
                  <span 
                    key={cert}
                    className="px-4 py-2 bg-muted rounded-full text-sm font-medium text-foreground flex items-center gap-2"
                  >
                    <Shield className="w-4 h-4 text-primary" />
                    {cert}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </MainLayout>
  );
}
