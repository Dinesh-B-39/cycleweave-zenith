import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ExtractionTab } from '@/components/tabs/ExtractionTab';
import { EnergyTab } from '@/components/tabs/EnergyTab';
import { SmeltingTab } from '@/components/tabs/SmeltingTab';
import { LogisticsTab } from '@/components/tabs/LogisticsTab';
import { CircularityTab } from '@/components/tabs/CircularityTab';
import { useLCA } from '@/context/LCAContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScanLine, Stethoscope, FileText, ChevronRight } from 'lucide-react';

const tabs = {
  extraction: ExtractionTab,
  energy: EnergyTab,
  smelting: SmeltingTab,
  logistics: LogisticsTab,
  circularity: CircularityTab,
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('extraction');
  const { lcaData } = useLCA();
  const navigate = useNavigate();

  const ActiveTabComponent = tabs[activeTab as keyof typeof tabs];

  return (
    <MainLayout activeTab={activeTab} onTabChange={setActiveTab}>
      <div className="h-screen flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex-shrink-0 px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">LCA Command Center</h1>
              <p className="text-sm text-muted-foreground">
                Configure lifecycle assessment parameters for {lcaData.metalType}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/scanner')}
                className="gap-2"
              >
                <ScanLine className="w-4 h-4" />
                Scan Scrap
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/doctor')}
                className="gap-2"
              >
                <Stethoscope className="w-4 h-4" />
                AI Doctor
              </Button>
              <Button
                size="sm"
                onClick={() => navigate('/passport')}
                className="gap-2"
              >
                <FileText className="w-4 h-4" />
                Generate Passport
              </Button>
            </div>
          </div>
        </header>

        {/* Tab Navigation Pills */}
        <div className="flex-shrink-0 px-6 py-3 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2">
            {Object.keys(tabs).map((tab, index) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${activeTab === tab 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                  }
                `}
              >
                <span className="text-xs opacity-70">0{index + 1}</span>
                <span className="capitalize">{tab}</span>
                {activeTab === tab && <ChevronRight className="w-3 h-3" />}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-background/50 bg-grid-pattern">
          <ActiveTabComponent />
        </main>
      </div>
    </MainLayout>
  );
}
