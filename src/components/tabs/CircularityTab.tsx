import { useLCA } from '@/context/LCAContext';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Recycle, ArrowUpCircle, Trash2, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function CircularityTab() {
  const { lcaData, updateLCAData, lastScanResult } = useLCA();
  const navigate = useNavigate();

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
            <Recycle className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">05 Circularity</h2>
            <p className="text-sm text-muted-foreground">Configure recycling and waste parameters</p>
          </div>
        </div>
        <Button
          onClick={() => navigate('/scanner')}
          className="gap-2"
          variant="outline"
        >
          <ArrowUpCircle className="w-4 h-4" />
          Scan Scrap
        </Button>
      </div>

      {/* Scan Result Banner */}
      {lastScanResult && (
        <div className="glass-card p-4 neon-border-lime">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary">Last Scan Applied</p>
              <p className="text-xs text-muted-foreground">
                {lastScanResult.scrapType} at {lastScanResult.purity}% purity
              </p>
            </div>
            <span className="text-lg font-mono text-secondary">
              -{lastScanResult.co2Saved} kg CO₂
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scrap Input Rate (Recycled Content) */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-3">
            <Label className="text-sm font-medium text-foreground flex items-center gap-2">
              <ArrowUpCircle className="w-4 h-4 text-secondary" />
              Scrap Input Rate
            </Label>
            <span className="text-lg font-mono text-secondary">{lcaData.scrapInputRate}%</span>
          </div>
          <Slider
            value={[lcaData.scrapInputRate]}
            onValueChange={([value]) => updateLCAData({ scrapInputRate: value })}
            max={100}
            min={0}
            step={1}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Percentage of recycled content in feedstock
          </p>
        </div>

        {/* Recycling Efficiency (Scrap Recovery Rate) */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-3">
            <Label className="text-sm font-medium text-foreground flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-primary" />
              Recycling Efficiency
            </Label>
            <span className="text-lg font-mono text-primary">{lcaData.recyclingEfficiency}%</span>
          </div>
          <Slider
            value={[lcaData.recyclingEfficiency]}
            onValueChange={([value]) => updateLCAData({ recyclingEfficiency: value })}
            max={100}
            min={50}
            step={1}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Material recovery rate during recycling
          </p>
        </div>

        {/* Waste Recovery */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-3">
            <Label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-accent" />
              Waste Recovery
            </Label>
            <span className="text-lg font-mono text-accent">{lcaData.wasteRecovery}%</span>
          </div>
          <Slider
            value={[lcaData.wasteRecovery]}
            onValueChange={([value]) => updateLCAData({ wasteRecovery: value })}
            max={100}
            min={0}
            step={1}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Process waste recovered and reused
          </p>
        </div>

        {/* Closed Loop Rate */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-3">
            <Label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Recycle className="w-4 h-4 text-secondary" />
              Closed Loop Rate
            </Label>
            <span className="text-lg font-mono text-secondary">{lcaData.closedLoopRate}%</span>
          </div>
          <Slider
            value={[lcaData.closedLoopRate]}
            onValueChange={([value]) => updateLCAData({ closedLoopRate: value })}
            max={100}
            min={0}
            step={1}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Material returned to same supply chain
          </p>
        </div>
      </div>

      {/* Circularity Breakdown */}
      <div className="glass-card p-5">
        <Label className="text-sm font-medium text-foreground mb-4 block">
          Circularity Score Breakdown
        </Label>
        <div className="space-y-3">
          {[
            { label: 'Scrap Input', value: lcaData.scrapInputRate, weight: 30, color: 'bg-secondary' },
            { label: 'Recycling Efficiency', value: lcaData.recyclingEfficiency, weight: 30, color: 'bg-primary' },
            { label: 'Waste Recovery', value: lcaData.wasteRecovery, weight: 20, color: 'bg-accent' },
            { label: 'Closed Loop', value: lcaData.closedLoopRate, weight: 20, color: 'bg-secondary' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-32">{item.label}</span>
              <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full ${item.color} transition-all duration-300`}
                  style={{ width: `${item.value}%` }}
                />
              </div>
              <span className="text-xs font-mono text-foreground w-12 text-right">
                {item.value}%
              </span>
              <span className="text-xs text-muted-foreground w-16">
                ×{item.weight}%
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">Total Circularity Score</span>
          <span className="text-2xl font-bold text-secondary">{lcaData.circularityScore}%</span>
        </div>
      </div>
    </div>
  );
}
