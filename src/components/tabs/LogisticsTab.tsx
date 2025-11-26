import { useLCA } from '@/context/LCAContext';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Truck, Train, Ship, Boxes, ArrowRight, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

const transportModes = [
  { id: 'Road', icon: Truck, label: 'Road', efficiency: 0.12 },
  { id: 'Rail', icon: Train, label: 'Rail', efficiency: 0.04 },
  { id: 'Sea', icon: Ship, label: 'Sea', efficiency: 0.02 },
  { id: 'Multi', icon: Boxes, label: 'Multi', efficiency: 0.08 },
] as const;

export function LogisticsTab() {
  const { lcaData, updateLCAData } = useLCA();

  const selectedMode = transportModes.find(m => m.id === lcaData.transportMode) || transportModes[0];
  const totalDistance = lcaData.inboundDistance + lcaData.outboundDistance;
  const totalEmissions = totalDistance * selectedMode.efficiency;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
          <Truck className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">04 Logistics</h2>
          <p className="text-sm text-muted-foreground">Configure transport and distribution</p>
        </div>
      </div>

      {/* Transport Mode Selection */}
      <div className="glass-card p-5">
        <Label className="text-sm font-medium text-foreground mb-4 block">Transport Mode</Label>
        <div className="grid grid-cols-4 gap-3">
          {transportModes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => updateLCAData({ 
                transportMode: mode.id, 
                vehicleEfficiency: mode.efficiency 
              })}
              className={cn(
                'flex flex-col items-center gap-2 p-4 rounded-lg border transition-all',
                lcaData.transportMode === mode.id
                  ? 'border-primary bg-primary/10 neon-border-teal'
                  : 'border-border bg-muted/50 hover:bg-muted'
              )}
            >
              <mode.icon className={cn(
                'w-6 h-6',
                lcaData.transportMode === mode.id ? 'text-primary' : 'text-muted-foreground'
              )} />
              <span className={cn(
                'text-sm font-medium',
                lcaData.transportMode === mode.id ? 'text-primary' : 'text-muted-foreground'
              )}>
                {mode.label}
              </span>
              <span className="text-xs text-muted-foreground">
                {mode.efficiency} kg/km
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Route Visualization */}
      <div className="glass-card p-5">
        <Label className="text-sm font-medium text-foreground mb-4 block">Route Visualization</Label>
        <div className="relative h-32 bg-muted/30 rounded-lg overflow-hidden">
          {/* Background grid */}
          <div className="absolute inset-0 bg-grid-pattern opacity-30" />
          
          {/* Route line */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 100">
            {/* Path */}
            <path
              d="M 30 50 Q 100 20, 200 50 T 370 50"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              strokeDasharray="5,5"
              className="animate-pulse"
            />
            
            {/* Start point */}
            <circle cx="30" cy="50" r="8" fill="hsl(var(--secondary))" />
            <text x="30" y="75" textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="10">Source</text>
            
            {/* End point */}
            <circle cx="370" cy="50" r="8" fill="hsl(var(--primary))" />
            <text x="370" y="75" textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="10">Dest</text>
            
            {/* Animated vehicle icon */}
            <g className="vehicle-animate" style={{ animationDuration: '4s' }}>
              {lcaData.transportMode === 'Road' && (
                <g transform="translate(-15, 40)">
                  <rect x="0" y="0" width="30" height="15" rx="2" fill="hsl(var(--primary))" />
                  <circle cx="7" cy="15" r="4" fill="hsl(var(--foreground))" />
                  <circle cx="23" cy="15" r="4" fill="hsl(var(--foreground))" />
                </g>
              )}
              {lcaData.transportMode === 'Rail' && (
                <g transform="translate(-20, 38)">
                  <rect x="0" y="0" width="40" height="18" rx="3" fill="hsl(var(--primary))" />
                  <rect x="5" y="3" width="8" height="8" rx="1" fill="hsl(var(--background))" />
                  <rect x="15" y="3" width="8" height="8" rx="1" fill="hsl(var(--background))" />
                  <circle cx="8" cy="18" r="3" fill="hsl(var(--foreground))" />
                  <circle cx="32" cy="18" r="3" fill="hsl(var(--foreground))" />
                </g>
              )}
              {lcaData.transportMode === 'Sea' && (
                <g transform="translate(-18, 35)">
                  <path d="M 0 15 Q 18 5, 36 15 L 32 22 L 4 22 Z" fill="hsl(var(--primary))" />
                  <rect x="14" y="5" width="8" height="12" fill="hsl(var(--secondary))" />
                </g>
              )}
              {lcaData.transportMode === 'Multi' && (
                <g transform="translate(-12, 38)">
                  <rect x="0" y="0" width="24" height="16" rx="2" fill="hsl(var(--primary))" />
                  <rect x="3" y="3" width="18" height="10" fill="hsl(var(--secondary))" opacity="0.5" />
                </g>
              )}
            </g>
          </svg>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inbound Distance */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-3">
            <Label className="text-sm font-medium text-foreground flex items-center gap-2">
              <MapPin className="w-4 h-4 text-secondary" />
              Inbound Distance
            </Label>
            <span className="text-lg font-mono text-secondary">{lcaData.inboundDistance} km</span>
          </div>
          <Slider
            value={[lcaData.inboundDistance]}
            onValueChange={([value]) => updateLCAData({ inboundDistance: value })}
            max={1000}
            min={10}
            step={10}
            className="w-full"
          />
        </div>

        {/* Outbound Distance */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-3">
            <Label className="text-sm font-medium text-foreground flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              Outbound Distance
            </Label>
            <span className="text-lg font-mono text-primary">{lcaData.outboundDistance} km</span>
          </div>
          <Slider
            value={[lcaData.outboundDistance]}
            onValueChange={([value]) => updateLCAData({ outboundDistance: value })}
            max={1000}
            min={10}
            step={10}
            className="w-full"
          />
        </div>
      </div>

      {/* Summary */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Total Distance</p>
              <p className="text-xl font-bold text-foreground">{totalDistance} km</p>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground" />
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Transport Emissions</p>
              <p className="text-xl font-bold text-primary">{totalEmissions.toFixed(1)} kg CO₂</p>
            </div>
          </div>
          <selectedMode.icon className="w-8 h-8 text-primary opacity-50" />
        </div>
      </div>
    </div>
  );
}
