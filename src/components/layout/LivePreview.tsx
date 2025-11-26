import { useLCA } from '@/context/LCAContext';
import { TrendingDown, TrendingUp, Leaf, Zap, RefreshCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function LivePreview() {
  const { lcaData, resetLCAData } = useLCA();

  const metrics = [
    {
      label: 'CO₂ Emission',
      value: lcaData.co2Emission,
      unit: 'kg',
      trend: 'down',
      color: 'text-primary ticker-glow',
      icon: TrendingDown,
    },
    {
      label: 'Circularity Score',
      value: lcaData.circularityScore,
      unit: '%',
      trend: 'up',
      color: 'text-secondary ticker-glow',
      icon: Leaf,
    },
    {
      label: 'Energy Usage',
      value: (lcaData.totalEnergyConsumption / 1000).toFixed(1),
      unit: 'MWh',
      trend: 'neutral',
      color: 'text-accent',
      icon: Zap,
    },
    {
      label: 'Recycled Content',
      value: lcaData.scrapInputRate,
      unit: '%',
      trend: 'up',
      color: 'text-secondary',
      icon: TrendingUp,
    },
  ];

  const getCircularityGrade = (score: number) => {
    if (score >= 80) return { grade: 'A', color: 'text-secondary' };
    if (score >= 60) return { grade: 'B', color: 'text-primary' };
    if (score >= 40) return { grade: 'C', color: 'text-accent' };
    return { grade: 'D', color: 'text-destructive' };
  };

  const circularityGrade = getCircularityGrade(lcaData.circularityScore);

  return (
    <aside className="w-80 h-screen bg-card border-l border-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">Live Preview</h2>
            <p className="text-xs text-muted-foreground">Real-time LCA Metrics</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={resetLCAData}
            className="text-muted-foreground hover:text-foreground"
          >
            <RefreshCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Scenario Badge */}
      <div className="px-4 pt-4">
        <div className={cn(
          'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium',
          lcaData.scenarioType === 'Optimized' 
            ? 'bg-secondary/20 text-secondary neon-border-lime' 
            : 'bg-muted text-muted-foreground'
        )}>
          {lcaData.scenarioType} Scenario
        </div>
      </div>

      {/* Main Circularity Score */}
      <div className="p-6">
        <div className="glass-card p-6 text-center">
          <p className="text-sm text-muted-foreground mb-2">Circularity Grade</p>
          <div className={cn('text-7xl font-black', circularityGrade.color)}>
            {circularityGrade.grade}
          </div>
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                style={{ width: `${lcaData.circularityScore}%` }}
              />
            </div>
            <span className="text-sm font-mono text-foreground">{lcaData.circularityScore}%</span>
          </div>
        </div>
      </div>

      {/* Live Metrics */}
      <div className="flex-1 px-4 pb-4 overflow-y-auto custom-scrollbar">
        <div className="space-y-3">
          {metrics.map((metric) => (
            <div key={metric.label} className="glass-card p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <metric.icon className={cn('w-4 h-4', metric.color)} />
                  <span className="text-sm text-muted-foreground">{metric.label}</span>
                </div>
                {metric.trend === 'down' && <TrendingDown className="w-4 h-4 text-primary" />}
                {metric.trend === 'up' && <TrendingUp className="w-4 h-4 text-secondary" />}
              </div>
              <div className="mt-2">
                <span className={cn('text-2xl font-bold font-mono', metric.color)}>
                  {metric.value}
                </span>
                <span className="text-sm text-muted-foreground ml-1">{metric.unit}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Grid Mix Breakdown */}
        <div className="mt-4 glass-card p-4">
          <p className="text-sm text-muted-foreground mb-3">Energy Grid Mix</p>
          <div className="space-y-2">
            {Object.entries(lcaData.gridMix).map(([source, value]) => (
              <div key={source} className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground capitalize w-20">{source}</span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full transition-all duration-300',
                      source === 'coal' && 'bg-muted-foreground',
                      source === 'hydro' && 'bg-primary',
                      source === 'solar' && 'bg-secondary',
                      source === 'naturalGas' && 'bg-accent'
                    )}
                    style={{ width: `${value}%` }}
                  />
                </div>
                <span className="text-xs font-mono text-foreground w-8">{value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Stats */}
      <div className="p-4 border-t border-border">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Total Distance: {lcaData.inboundDistance + lcaData.outboundDistance}km</span>
          <span>Mode: {lcaData.transportMode}</span>
        </div>
      </div>
    </aside>
  );
}
