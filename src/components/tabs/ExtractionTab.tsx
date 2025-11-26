import { useLCA } from '@/context/LCAContext';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pickaxe, Droplets, Mountain } from 'lucide-react';

export function ExtractionTab() {
  const { lcaData, updateLCAData } = useLCA();

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
          <Pickaxe className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">01 Extraction</h2>
          <p className="text-sm text-muted-foreground">Configure ore extraction parameters</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Metal Type */}
        <div className="glass-card p-5">
          <Label className="text-sm font-medium text-foreground mb-3 block">
            Metal Type
          </Label>
          <Select
            value={lcaData.metalType}
            onValueChange={(value) => updateLCAData({ metalType: value as any })}
          >
            <SelectTrigger className="bg-muted border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Aluminium">Aluminium</SelectItem>
              <SelectItem value="Steel">Steel</SelectItem>
              <SelectItem value="Copper">Copper</SelectItem>
              <SelectItem value="Zinc">Zinc</SelectItem>
              <SelectItem value="Lead">Lead</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Mining Method */}
        <div className="glass-card p-5">
          <Label className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <Mountain className="w-4 h-4 text-muted-foreground" />
            Mining Method
          </Label>
          <Select
            value={lcaData.miningMethod}
            onValueChange={(value) => updateLCAData({ miningMethod: value as any })}
          >
            <SelectTrigger className="bg-muted border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Open Pit">Open Pit</SelectItem>
              <SelectItem value="Underground">Underground</SelectItem>
              <SelectItem value="Heap Leach">Heap Leach</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Ore Grade */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-3">
            <Label className="text-sm font-medium text-foreground">Ore Grade</Label>
            <span className="text-lg font-mono text-primary">{lcaData.oreGrade}%</span>
          </div>
          <Slider
            value={[lcaData.oreGrade]}
            onValueChange={([value]) => updateLCAData({ oreGrade: value })}
            max={100}
            min={10}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>Low Grade (10%)</span>
            <span>High Grade (100%)</span>
          </div>
        </div>

        {/* Water Usage */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-3">
            <Label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Droplets className="w-4 h-4 text-primary" />
              Water Usage
            </Label>
            <span className="text-lg font-mono text-primary">{lcaData.waterUsage} m³/ton</span>
          </div>
          <Slider
            value={[lcaData.waterUsage]}
            onValueChange={([value]) => updateLCAData({ waterUsage: value })}
            max={50}
            min={1}
            step={0.5}
            className="w-full"
          />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>Efficient (1)</span>
            <span>High Usage (50)</span>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="glass-card p-4 border-l-4 border-l-primary">
        <p className="text-sm text-muted-foreground">
          <span className="text-primary font-semibold">Tip:</span> Higher ore grades typically require less energy for processing but may indicate more intensive extraction methods.
        </p>
      </div>
    </div>
  );
}
