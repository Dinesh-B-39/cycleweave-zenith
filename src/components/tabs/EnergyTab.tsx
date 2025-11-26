import { useLCA } from '@/context/LCAContext';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Zap, Sun, Droplets, Flame, Factory } from 'lucide-react';

export function EnergyTab() {
  const { lcaData, updateLCAData } = useLCA();

  const updateGridMix = (source: keyof typeof lcaData.gridMix, value: number) => {
    const currentTotal = Object.values(lcaData.gridMix).reduce((a, b) => a + b, 0);
    const currentValue = lcaData.gridMix[source];
    const diff = value - currentValue;
    
    // Adjust other values proportionally to maintain 100%
    const others = Object.entries(lcaData.gridMix).filter(([k]) => k !== source);
    const othersTotal = others.reduce((sum, [, v]) => sum + v, 0);
    
    if (othersTotal > 0) {
      const newGridMix = { ...lcaData.gridMix, [source]: value };
      const scale = (100 - value) / othersTotal;
      
      others.forEach(([key]) => {
        newGridMix[key as keyof typeof lcaData.gridMix] = Math.round(lcaData.gridMix[key as keyof typeof lcaData.gridMix] * scale);
      });
      
      // Ensure total is exactly 100
      const newTotal = Object.values(newGridMix).reduce((a, b) => a + b, 0);
      if (newTotal !== 100) {
        const firstOther = others[0][0] as keyof typeof lcaData.gridMix;
        newGridMix[firstOther] += 100 - newTotal;
      }
      
      updateLCAData({ gridMix: newGridMix });
    }
  };

  const gridSources = [
    { key: 'coal' as const, label: 'Coal', icon: Factory, color: 'bg-muted-foreground' },
    { key: 'hydro' as const, label: 'Hydro', icon: Droplets, color: 'bg-primary' },
    { key: 'solar' as const, label: 'Solar', icon: Sun, color: 'bg-secondary' },
    { key: 'naturalGas' as const, label: 'Natural Gas', icon: Flame, color: 'bg-accent' },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
          <Zap className="w-5 h-5 text-secondary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">02 Energy</h2>
          <p className="text-sm text-muted-foreground">Configure energy consumption and grid mix</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Total Energy Consumption */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-3">
            <Label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Zap className="w-4 h-4 text-secondary" />
              Total Energy Consumption
            </Label>
            <span className="text-lg font-mono text-secondary">{lcaData.totalEnergyConsumption.toLocaleString()} kWh</span>
          </div>
          <Slider
            value={[lcaData.totalEnergyConsumption]}
            onValueChange={([value]) => updateLCAData({ totalEnergyConsumption: value })}
            max={50000}
            min={1000}
            step={100}
            className="w-full"
          />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>1,000 kWh</span>
            <span>50,000 kWh</span>
          </div>
        </div>

        {/* Process Heat */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-3">
            <Label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Flame className="w-4 h-4 text-accent" />
              Process Heat
            </Label>
            <span className="text-lg font-mono text-accent">{lcaData.processHeat.toLocaleString()} MJ</span>
          </div>
          <Slider
            value={[lcaData.processHeat]}
            onValueChange={([value]) => updateLCAData({ processHeat: value })}
            max={20000}
            min={1000}
            step={100}
            className="w-full"
          />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>1,000 MJ</span>
            <span>20,000 MJ</span>
          </div>
        </div>
      </div>

      {/* Grid Mix Distribution */}
      <div className="glass-card p-5">
        <Label className="text-sm font-medium text-foreground mb-4 block">
          Grid Mix Distribution
        </Label>
        
        {/* Visual Bar */}
        <div className="h-8 rounded-lg overflow-hidden flex mb-6">
          {gridSources.map(({ key, color }) => (
            <div
              key={key}
              className={`${color} transition-all duration-300`}
              style={{ width: `${lcaData.gridMix[key]}%` }}
            />
          ))}
        </div>

        {/* Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {gridSources.map(({ key, label, icon: Icon, color }) => (
            <div key={key} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <div className={`w-3 h-3 rounded ${color}`} />
                  <Icon className="w-4 h-4" />
                  {label}
                </span>
                <span className="text-sm font-mono text-foreground">{lcaData.gridMix[key]}%</span>
              </div>
              <Slider
                value={[lcaData.gridMix[key]]}
                onValueChange={([value]) => updateGridMix(key, value)}
                max={100}
                min={0}
                step={1}
                className="w-full"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Carbon Intensity Indicator */}
      <div className="glass-card p-4 border-l-4 border-l-secondary">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            <span className="text-secondary font-semibold">Carbon Intensity:</span> Based on your grid mix
          </p>
          <span className="text-lg font-mono text-secondary">
            {(
              lcaData.gridMix.coal * 0.95 +
              lcaData.gridMix.hydro * 0.02 +
              lcaData.gridMix.solar * 0.05 +
              lcaData.gridMix.naturalGas * 0.45
            ).toFixed(1)} kg CO₂/kWh
          </span>
        </div>
      </div>
    </div>
  );
}
