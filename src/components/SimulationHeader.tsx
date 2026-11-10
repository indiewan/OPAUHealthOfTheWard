import React, { useState, useEffect } from 'react';
import { WardSimulationState } from '../types';
import {
  Lock,
  Unlock,
  RefreshCw,
  Download,
  Upload,
  RotateCcw,
  Maximize2,
  Minimize2,
  Sliders,
  AlertTriangle,
  Layers,
  Search,
} from 'lucide-react';

interface SimulationHeaderProps {
  wardState: WardSimulationState;
  isAdmin: boolean;
  onOpenAdminAuth: () => void;
  onExitAdmin: () => void;
  onOpenExportImport: () => void;
  onOpenPresets: () => void;
  onResetWard: () => void;
  onManualRefresh: () => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterService: string;
  onFilterServiceChange: (service: string) => void;
}

export const SimulationHeader: React.FC<SimulationHeaderProps> = ({
  wardState,
  isAdmin,
  onOpenAdminAuth,
  onExitAdmin,
  onOpenExportImport,
  onOpenPresets,
  onResetWard,
  onManualRefresh,
  searchTerm,
  onSearchChange,
  filterService,
  onFilterServiceChange,
}) => {
  // Live countdown timer for "⏱ 01:55"
  const [countdown, setCountdown] = useState<number>(wardState.refreshIntervalSeconds || 115);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showToolbar, setShowToolbar] = useState<boolean>(false);

  // Ticking countdown effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          onManualRefresh();
          return wardState.refreshIntervalSeconds || 115;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [wardState.refreshIntervalSeconds, onManualRefresh]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate live occupancy
  const totalBeds = wardState.beds.length;
  const occupiedBeds = wardState.beds.filter((b) => b.status === 'occupied').length;
  const closedBeds = wardState.beds.filter((b) => b.status === 'closed').length;

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 shadow-md">
      {/* 1. MANDATORY SAFETY BANNER FOR CLINICAL SIMULATION */}
      <div className="bg-amber-400 text-amber-950 px-4 py-1 flex items-center justify-between text-xs font-bold tracking-wider uppercase border-b border-amber-500/50 shadow-xs">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-900 shrink-0" />
          <span>SIMULATION ONLY — NOT FOR REAL CLINICAL CARE — OPAU TRANSFORMATION TRAINING</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-semibold text-amber-900">
          <span>SAFE SYNTHETIC DATA</span>
          <span className="hidden sm:inline">·</span>
          <span className="hidden sm:inline">TRAINING SIMULATION MODE</span>
        </div>
      </div>

      {/* 2. AUTHENTIC HOSPITAL WHITEBOARD TOP BAR (MATCHES SCREENSHOT) */}
      <div className="bg-[#383582] text-white px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 border-b border-[#2d2a6a]">
        {/* Left: Hospital Name & Department */}
        <div className="flex items-center gap-3">
          <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
            <span>{wardState.hospitalName} - {wardState.unitName}</span>
          </h1>
          {isAdmin && (
            <span className="bg-emerald-500/90 text-white text-[11px] font-extrabold uppercase px-2 py-0.5 rounded-sm tracking-wider ring-1 ring-white/30 animate-pulse">
              Admin Edit Mode
            </span>
          )}
        </div>

        {/* Right: Hospital telemetry values (Last Refreshed, Occupancy, Timer) */}
        <div className="flex items-center gap-4 text-xs font-medium text-slate-200">
          {/* Last Refreshed */}
          <div className="hidden md:flex items-center gap-1.5 text-slate-200">
            <span>Last Refreshed</span>
            <span className="font-mono text-white font-semibold">{wardState.lastRefreshed}</span>
          </div>

          {/* Occupancy e.g. 42/43 */}
          <div
            className="bg-white/10 hover:bg-white/20 transition-colors px-2 py-1 rounded text-xs font-mono font-bold text-white tracking-wider cursor-default"
            title={`${occupiedBeds} Occupied, ${closedBeds} Closed, ${totalBeds - occupiedBeds - closedBeds} Vacant of ${totalBeds} Total Beds`}
          >
            <span className="text-white">{occupiedBeds}</span>
            <span className="text-white/60">/</span>
            <span className="text-white/90">{totalBeds}</span>
          </div>

          {/* Refresh Timer e.g. ⏱ 01:55 */}
          <button
            type="button"
            onClick={onManualRefresh}
            className="flex items-center gap-1 bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded font-mono font-bold text-xs transition-colors"
            title="Click to reset timer & refresh ward"
          >
            <span>⏱</span>
            <span>{formatTimer(countdown)}</span>
          </button>

          {/* Admin Mode Trigger Button */}
          {isAdmin ? (
            <button
              type="button"
              onClick={onExitAdmin}
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-2.5 py-1 rounded text-xs transition-colors shadow-xs"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>Exit Admin</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenAdminAuth}
              className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white font-medium px-2.5 py-1 rounded text-xs transition-colors border border-white/20"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Admin Mode</span>
            </button>
          )}

          {/* Fullscreen Button */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1 hover:bg-white/15 rounded text-white/90 hover:text-white transition-colors"
            title="Toggle Fullscreen for simulation projector / TV"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 3. SIMULATION TOOLBAR (ALWAYS VISIBLE IN ADMIN, OR TOGGLEABLE) */}
      <div className="bg-[#292663] text-slate-200 px-4 py-2 flex flex-wrap items-center justify-between gap-2.5 border-b border-indigo-950/40 text-xs">
        {/* Left: Quick Search and Service Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search bed, patient, info, DIS..."
              className="bg-black/30 text-white placeholder-slate-400 pl-8 pr-3 py-1 rounded text-xs w-48 sm:w-60 focus:outline-none focus:ring-1 focus:ring-purple-400 border border-white/15"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                ×
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 text-slate-300">
            <span className="text-[11px] text-slate-400 font-medium">Service:</span>
            <select
              value={filterService}
              onChange={(e) => onFilterServiceChange(e.target.value)}
              className="bg-black/30 text-white text-xs py-1 px-2 rounded border border-white/15 focus:outline-none focus:ring-1 focus:ring-purple-400"
            >
              <option value="ALL">All Services</option>
              <option value="OPS">OPS (Old People's Services)</option>
              <option value="EACM">EACM</option>
              <option value="T.B.T.">T.B.T.</option>
              <option value="CARD">CARD</option>
              <option value="GMG">GMG</option>
            </select>
          </div>
        </div>

        {/* Right: Simulation Controls (JSON Export/Import, Scenarios, Reset) */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={onOpenExportImport}
            className="flex items-center gap-1.5 bg-indigo-600/80 hover:bg-indigo-600 text-white px-2.5 py-1 rounded font-medium text-xs transition-colors border border-indigo-400/40"
            title="Export or Import Ward Data in JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <Upload className="w-3.5 h-3.5 -ml-1" />
            <span>JSON Transfer</span>
          </button>

          <button
            type="button"
            onClick={onOpenPresets}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-2.5 py-1 rounded font-medium text-xs transition-colors border border-white/15"
            title="Load Pre-configured OPAU Drill Scenarios"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Sim Scenarios</span>
          </button>

          {isAdmin && (
            <button
              type="button"
              onClick={onResetWard}
              className="flex items-center gap-1.5 bg-red-900/40 hover:bg-red-800/60 text-red-200 px-2 py-1 rounded font-medium text-xs transition-colors border border-red-700/40"
              title="Reset to default OPAU simulation data"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Ward</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
