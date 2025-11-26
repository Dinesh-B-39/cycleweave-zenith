import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useLCA } from '@/context/LCAContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScanResult } from '@/types/lca';
import { Camera, Upload, Loader2, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function Scanner() {
  const { setLastScanResult, updateLCAData } = useLCA();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const mockScan = async () => {
    setIsScanning(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    const result: ScanResult = {
      scrapType: 'Aluminum UBC (Used Beverage Cans)',
      purity: 94.2,
      estimatedWeight: 1250,
      co2Saved: 892,
      revenueEstimate: 2340,
      recommendedProcess: 'Electric Arc Furnace',
    };
    
    setScanResult(result);
    setIsScanning(false);
  };

  const applyToLCA = () => {
    if (!scanResult) return;
    
    setLastScanResult(scanResult);
    updateLCAData({
      scrapInputRate: Math.round(scanResult.purity),
      recyclingEfficiency: Math.min(95, Math.round(scanResult.purity * 0.95)),
      furnaceType: 'Electric Arc',
    });
    
    toast({
      title: 'Scan Applied',
      description: 'Circularity parameters updated with scan data.',
    });
    
    navigate('/');
  };

  return (
    <MainLayout showPreview={false}>
      <div className="h-screen flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex-shrink-0 px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-secondary" />
                Scan Scrap
              </h1>
              <p className="text-sm text-muted-foreground">
                AI-powered scrap material analysis and classification
              </p>
            </div>
            <Button variant="ghost" onClick={() => navigate('/')}>
              Back to Dashboard
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Camera / Upload */}
            <div className="space-y-6">
              {/* Mock Camera Feed */}
              <div className="glass-card overflow-hidden">
                <div className="aspect-video relative neon-border-teal rounded-lg overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-muted to-background flex items-center justify-center">
                    {isScanning ? (
                      <div className="text-center">
                        <div className="relative">
                          <div className="w-32 h-32 rounded-full border-4 border-primary/30 animate-ping absolute inset-0" />
                          <div className="w-32 h-32 rounded-full border-4 border-primary flex items-center justify-center">
                            <Loader2 className="w-12 h-12 text-primary animate-spin" />
                          </div>
                        </div>
                        <p className="mt-4 text-primary font-medium animate-pulse">
                          Analyzing Material...
                        </p>
                      </div>
                    ) : scanResult ? (
                      <div className="text-center">
                        <CheckCircle className="w-16 h-16 text-secondary mx-auto" />
                        <p className="mt-4 text-secondary font-medium">Scan Complete</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Camera className="w-16 h-16 text-muted-foreground mx-auto" />
                        <p className="mt-4 text-muted-foreground">Live Camera Feed</p>
                        <p className="text-xs text-muted-foreground">(Mock Preview)</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Scan lines effect */}
                  {isScanning && (
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                      <div className="absolute w-full h-1 bg-primary/50 animate-[scan_2s_linear_infinite]" 
                           style={{ animation: 'scan 2s linear infinite' }} />
                    </div>
                  )}
                </div>
              </div>

              {/* Upload Area */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); mockScan(); }}
                className={cn(
                  'glass-card p-8 border-2 border-dashed transition-all cursor-pointer',
                  dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'
                )}
                onClick={mockScan}
              >
                <div className="text-center">
                  <Upload className={cn(
                    'w-10 h-10 mx-auto mb-3',
                    dragOver ? 'text-primary' : 'text-muted-foreground'
                  )} />
                  <p className="text-sm font-medium text-foreground">
                    Drop image here or click to upload
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Supports JPG, PNG, HEIC up to 10MB
                  </p>
                </div>
              </div>

              <Button 
                className="w-full gap-2"
                size="lg"
                onClick={mockScan}
                disabled={isScanning}
              >
                {isScanning ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Camera className="w-5 h-5" />
                    Start Scan
                  </>
                )}
              </Button>
            </div>

            {/* Right: Results */}
            <div className="space-y-6">
              {scanResult ? (
                <>
                  {/* Result Card - Glassmorphic */}
                  <div className="glass-card p-6 neon-border-lime animate-slide-in-right">
                    <h3 className="text-lg font-bold text-foreground mb-4">
                      Analysis Results
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-3 border-b border-border">
                        <span className="text-muted-foreground">Scrap Type</span>
                        <span className="font-medium text-foreground">{scanResult.scrapType}</span>
                      </div>
                      
                      <div className="flex justify-between items-center py-3 border-b border-border">
                        <span className="text-muted-foreground">Purity</span>
                        <span className="text-2xl font-bold text-secondary">{scanResult.purity}%</span>
                      </div>
                      
                      <div className="flex justify-between items-center py-3 border-b border-border">
                        <span className="text-muted-foreground">Est. Weight</span>
                        <span className="font-mono text-foreground">{scanResult.estimatedWeight} kg</span>
                      </div>
                      
                      <div className="flex justify-between items-center py-3 border-b border-border">
                        <span className="text-muted-foreground">CO₂ Saved</span>
                        <span className="text-xl font-bold text-primary">-{scanResult.co2Saved} kg</span>
                      </div>
                      
                      <div className="flex justify-between items-center py-3 border-b border-border">
                        <span className="text-muted-foreground">Revenue Est.</span>
                        <span className="font-bold text-secondary">${scanResult.revenueEstimate}</span>
                      </div>
                      
                      <div className="flex justify-between items-center py-3">
                        <span className="text-muted-foreground">Recommended Process</span>
                        <span className="text-sm font-medium text-accent">{scanResult.recommendedProcess}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button 
                    className="w-full gap-2 neon-border-teal"
                    size="lg"
                    onClick={applyToLCA}
                  >
                    <ArrowRight className="w-5 h-5" />
                    Use in LCA
                  </Button>
                </>
              ) : (
                <div className="glass-card p-8 text-center">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <Sparkles className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    Ready to Scan
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Position your scrap material in frame or upload an image to begin AI analysis.
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <style>{`
        @keyframes scan {
          0% { top: 0; }
          100% { top: 100%; }
        }
      `}</style>
    </MainLayout>
  );
}
