import { useLCA } from '@/context/LCAContext';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Flame, Thermometer, Beaker, Recycle } from 'lucide-react';

export function SmeltingTab() {
  const { lcaData, updateLCAData } = useLCA();

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
          <Flame className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">03 Smelting</h2>
          <p className="text-sm text-muted-foreground">Configure furnace and process parameters</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Furnace Type */}
        <div className="glass-card p-5">
          <Label className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <Flame className="w-4 h-4 text-accent" />
            Furnace Type
          </Label>
          <Select
            value={lcaData.furnaceType}
            onValueChange={(value) => updateLCAData({ furnaceType: value as any })}
          >
            <SelectTrigger className="bg-muted border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Electric Arc">Electric Arc Furnace</SelectItem>
              <SelectItem value="Blast">Blast Furnace</SelectItem>
              <SelectItem value="Induction">Induction Furnace</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-2">
            {lcaData.furnaceType === 'Electric Arc' && 'Lower emissions, ideal for recycled materials'}
            {lcaData.furnaceType === 'Blast' && 'Traditional method, higher capacity'}
            {lcaData.furnaceType === 'Induction' && 'Precise temperature control, efficient for alloys'}
          </p>
        </div>

        {/* Temperature */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-3">
            <Label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-destructive" />
              Operating Temperature
            </Label>
            <span className="text-lg font-mono text-accent">{lcaData.temperature}°C</span>
          </div>
          <Slider
            value={[lcaData.temperature]}
            onValueChange={([value]) => updateLCAData({ temperature: value })}
            max={2000}
            min={500}
            step={10}
            className="w-full"
          />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>500°C</span>
            <span>2000°C</span>
          </div>
          {/* Temperature indicator */}
          <div className="mt-3 h-2 rounded-full bg-gradient-to-r from-yellow-500 via-orange-500 to-red-600 opacity-70" />
        </div>

        {/* Flux Usage */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-3">
            <Label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Beaker className="w-4 h-4 text-primary" />
              Flux Usage
            </Label>
            <span className="text-lg font-mono text-primary">{lcaData.fluxUsage} kg/ton</span>
          </div>
          <Slider
            value={[lcaData.fluxUsage]}
            onValueChange={([value]) => updateLCAData({ fluxUsage: value })}
            max={100}
            min={10}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>10 kg/ton</span>
            <span>100 kg/ton</span>
          </div>
        </div>

        {/* Slag Recovery */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-3">
            <Label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Recycle className="w-4 h-4 text-secondary" />
              Slag Recovery Rate
            </Label>
            <span className="text-lg font-mono text-secondary">{lcaData.slagRecovery}%</span>
          </div>
          <Slider
            value={[lcaData.slagRecovery]}
            onValueChange={([value]) => updateLCAData({ slagRecovery: value })}
            max={100}
            min={0}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* Process Efficiency Card */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Estimated Process Efficiency</p>
            <p className="text-xs text-muted-foreground">Based on furnace type and temperature</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-accent">
              {Math.min(95, Math.round(85 + (lcaData.slagRecovery * 0.1) - ((lcaData.temperature - 1200) * 0.005)))}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
