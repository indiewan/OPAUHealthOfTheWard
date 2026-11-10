/**
 * Health of the Ward - OPAU Simulation Application
 * For Transformation Training & Clinical Sim Exercises
 */

import React, { useState, useEffect, useCallback } from 'react';
import { WardSimulationState, BedSpace, WardBay } from './types';
import {
  loadWardState,
  saveWardState,
  resetWardState,
  getAdminSession,
  setAdminSession,
  exportWardToJson,
} from './utils/storage';
import { SimulationHeader } from './components/SimulationHeader';
import { WardBoard } from './components/WardBoard';
import { AdminPasswordModal } from './components/AdminPasswordModal';
import { BedEditModal } from './components/BedEditModal';
import { ImportExportModal } from './components/ImportExportModal';
import { BayManagerModal } from './components/BayManagerModal';
import { UserGuideModal } from './components/UserGuideModal';
import {
  ShieldAlert,
  Download,
  Upload,
  Plus,
  RefreshCw,
  CheckCircle2,
  Info,
  X,
  Shuffle,
  AlertTriangle,
  Sliders,
  Grid,
} from 'lucide-react';

export default function App() {
  const [wardState, setWardState] = useState<WardSimulationState>(loadWardState);
  const [isAdmin, setIsAdmin] = useState<boolean>(getAdminSession);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingBed, setEditingBed] = useState<BedSpace | null>(null);
  const [isExportImportModalOpen, setIsExportImportModalOpen] = useState<boolean>(false);
  const [exportImportInitialTab, setExportImportInitialTab] = useState<'export' | 'import' | 'presets'>('export');
  const [isBayManagerModalOpen, setIsBayManagerModalOpen] = useState<boolean>(false);
  const [isUserGuideOpen, setIsUserGuideOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterService, setFilterService] = useState<string>('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Show temporary toast notification
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3500);
  }, []);

  // Sync state to LocalStorage whenever wardState changes
  useEffect(() => {
    saveWardState(wardState);
  }, [wardState]);

  // Admin authentication handlers
  const handleUnlockAdmin = () => {
    setIsAdmin(true);
    setAdminSession(true);
    showToast('Admin Mode unlocked! Click any bed space or bay header to edit.');
  };

  const handleExitAdmin = () => {
    setIsAdmin(false);
    setAdminSession(false);
    showToast('Exited Admin Mode. Viewing mode active (read-only).');
  };

  // Open Bed Edit Modal
  const handleEditBed = (bed: BedSpace) => {
    if (!isAdmin) {
      setIsPasswordModalOpen(true);
      return;
    }
    setEditingBed(bed);
    setIsEditModalOpen(true);
  };

  // Save changes from Bed Edit Modal
  const handleSaveBed = (updatedBed: BedSpace) => {
    setWardState((prev) => {
      const updatedBeds = prev.beds.map((b) => (b.id === updatedBed.id ? updatedBed : b));
      return {
        ...prev,
        beds: updatedBeds,
        lastRefreshed: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      };
    });
    showToast(`Saved details for ${updatedBed.bedLabel}`);
  };

  // Delete bed
  const handleDeleteBed = (bedId: string) => {
    setWardState((prev) => ({
      ...prev,
      beds: prev.beds.filter((b) => b.id !== bedId),
    }));
    showToast('Bed space removed.');
  };

  // Add bed directly to a bay
  const handleAddBedToBay = (bayId: string, bayName: string) => {
    const existingInBay = wardState.beds.filter((b) => b.bayId === bayId);
    const nextNumber = existingInBay.length + 1;
    const padded = nextNumber < 10 ? `0${nextNumber}` : `${nextNumber}`;
    const newBedId = `bed-${bayId}-${Date.now()}`;
    const newBed: BedSpace = {
      id: newBedId,
      bayId,
      bayName,
      bedLabel: `Bed ${padded}`,
      isSideRoom: false,
      status: 'occupied',
      patient: {
        id: `p-${Date.now()}`,
        name: `SIM PATIENT ${Math.floor(10 + Math.random() * 89)}`,
        gender: Math.random() > 0.5 ? 'M' : 'F',
        age: 80,
      },
      service: 'OPS',
      destination: '-',
      newsScore: Math.floor(Math.random() * 3) + 1,
      patientInfo: '.',
      isYellowHighlight: false,
      hasSwabBanner: false,
    };

    setWardState((prev) => ({
      ...prev,
      beds: [...prev.beds, newBed],
    }));

    showToast(`Added ${newBed.bedLabel} to ${bayName}`);
  };

  // Inline rename bay
  const handleRenameBay = (bayId: string, newName: string) => {
    setWardState((prev) => {
      const updatedBays = prev.bays.map((b) => (b.id === bayId ? { ...b, name: newName } : b));
      const updatedBeds = prev.beds.map((bed) =>
        bed.bayId === bayId ? { ...bed, bayName: newName } : bed
      );
      return {
        ...prev,
        bays: updatedBays,
        beds: updatedBeds,
      };
    });
    showToast(`Renamed bay to "${newName}"`);
  };

  // Reorder bays left / right
  const handleMoveBay = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= wardState.bays.length) return;

    setWardState((prev) => {
      const newBays = [...prev.bays];
      const temp = newBays[index];
      newBays[index] = newBays[targetIndex];
      newBays[targetIndex] = temp;
      const reordered = newBays.map((b, idx) => ({ ...b, order: idx + 1 }));
      return {
        ...prev,
        bays: reordered,
      };
    });
  };

  // Save all bays and beds from BayManagerModal
  const handleUpdateBays = (newBays: WardBay[], newBeds: BedSpace[]) => {
    setWardState((prev) => ({
      ...prev,
      bays: newBays,
      beds: newBeds,
    }));
    showToast('Ward bays and layout updated successfully.');
  };

  // Quick NEWS increment / decrement on card
  const handleQuickNewsChange = (bedId: string, delta: number) => {
    if (!isAdmin) return;
    setWardState((prev) => {
      const updatedBeds = prev.beds.map((bed) => {
        if (bed.id !== bedId) return bed;
        const currentNews = bed.newsScore ?? 0;
        const newNews = Math.max(0, Math.min(20, currentNews + delta));
        return {
          ...bed,
          newsScore: newNews,
        };
      });
      return {
        ...prev,
        beds: updatedBeds,
      };
    });
  };

  // Reset to default OPAU simulation scenario
  const handleResetWard = () => {
    if (window.confirm('Reset all beds to the default OPAU simulation baseline? Any unsaved edits will be replaced.')) {
      const fresh = resetWardState();
      setWardState(fresh);
      showToast('Ward reset to default simulation baseline.');
    }
  };

  // Import JSON state
  const handleImportState = (newState: WardSimulationState) => {
    setWardState(newState);
    saveWardState(newState);
    showToast(`Successfully loaded simulation with ${newState.beds.length} beds and ${newState.bays.length} bays.`);
  };

  // Manual refresh / countdown trigger
  const handleManualRefresh = useCallback(() => {
    const now = new Date();
    const dateFormatted = `${now.toLocaleString('default', { month: 'short' })} ${now.getDate()}, ${now.getFullYear()} ${now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true })}`;
    setWardState((prev) => ({
      ...prev,
      lastRefreshed: dateFormatted,
    }));
  }, []);

  // Quick Randomize NEWS scores for drill variety
  const handleRandomizeNews = () => {
    if (!window.confirm('Randomize NEWS scores across occupied beds for an unexpected clinical drill?')) return;
    setWardState((prev) => {
      const updatedBeds = prev.beds.map((b) => {
        if (b.status !== 'occupied') return b;
        const r = Math.random();
        let newScore = 1;
        if (r < 0.3) newScore = 0;
        else if (r < 0.6) newScore = Math.floor(Math.random() * 3) + 1;
        else if (r < 0.85) newScore = Math.floor(Math.random() * 3) + 4;
        else newScore = Math.floor(Math.random() * 4) + 7;
        return {
          ...b,
          newsScore: newScore,
        };
      });
      return {
        ...prev,
        beds: updatedBeds,
      };
    });
    showToast('NEWS scores randomized for simulation drill.');
  };

  // Quick Batch Safe Renaming
  const handleAnonymizeAll = () => {
    setWardState((prev) => {
      let patientCounter = 1;
      const updatedBeds = prev.beds.map((b) => {
        if (b.status === 'occupied' && b.patient) {
          const padded = patientCounter.toString().padStart(2, '0');
          patientCounter++;
          return {
            ...b,
            patient: {
              ...b.patient,
              name: `SIM PATIENT ${padded}`,
            },
          };
        }
        return b;
      });
      return {
        ...prev,
        beds: updatedBeds,
      };
    });
    showToast('All occupied beds numbered as SIM PATIENT 01..42.');
  };

  return (
    <div className="min-h-screen bg-[#dce1e9] flex flex-col font-sans text-slate-900 select-none">
      {/* 1. Header Bar with Simulation Notice, Hospital Title & Telemetry */}
      <SimulationHeader
        wardState={wardState}
        isAdmin={isAdmin}
        onOpenAdminAuth={() => setIsPasswordModalOpen(true)}
        onExitAdmin={handleExitAdmin}
        onOpenExportImport={() => {
          setExportImportInitialTab('export');
          setIsExportImportModalOpen(true);
        }}
        onOpenPresets={() => {
          setExportImportInitialTab('presets');
          setIsExportImportModalOpen(true);
        }}
        onOpenBayManager={() => setIsBayManagerModalOpen(true)}
        onOpenUserGuide={() => setIsUserGuideOpen(true)}
        onResetWard={handleResetWard}
        onManualRefresh={handleManualRefresh}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterService={filterService}
        onFilterServiceChange={setFilterService}
      />

      {/* 2. Admin Helper Ribbon (Shown when Admin Mode is unlocked) */}
      {isAdmin && (
        <div className="bg-amber-100 border-b border-amber-300 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs text-amber-950 no-print animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <span className="bg-amber-600 text-white font-extrabold px-2 py-0.5 rounded text-[11px] uppercase tracking-wider">
              ADMIN MODE ACTIVE
            </span>
            <span className="font-medium text-slate-800">
              Click any bay header or bed space to edit. Use arrows to reorder columns.
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setIsBayManagerModalOpen(true)}
              className="flex items-center gap-1.5 bg-purple-800 hover:bg-purple-900 text-white font-bold px-2.5 py-1 rounded shadow-2xs transition-colors"
              title="Rename, renumber, add or reorder bays"
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Manage Bays & Numbering</span>
            </button>
            <button
              type="button"
              onClick={handleAnonymizeAll}
              className="bg-white hover:bg-amber-50 text-amber-900 font-bold px-2.5 py-1 rounded border border-amber-300 shadow-2xs transition-colors"
              title="Ensure all names are safe simulation placeholders: SIM PATIENT 01..."
            >
              Number Patients (01..42)
            </button>
            <button
              type="button"
              onClick={handleRandomizeNews}
              className="flex items-center gap-1.5 bg-white hover:bg-amber-50 text-amber-900 font-bold px-2.5 py-1 rounded border border-amber-300 shadow-2xs transition-colors"
              title="Simulate random NEWS score changes for triage training"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>Randomize NEWS</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setExportImportInitialTab('export');
                setIsExportImportModalOpen(true);
              }}
              className="flex items-center gap-1.5 bg-indigo-700 hover:bg-indigo-800 text-white font-bold px-2.5 py-1 rounded shadow-2xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON File</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. Main Ward Whiteboard Board (Dynamic Columns: Bays) */}
      <main className="flex-1 py-1 px-1 sm:px-2">
        <WardBoard
          wardState={wardState}
          isAdmin={isAdmin}
          onEditBed={handleEditBed}
          onQuickNewsChange={handleQuickNewsChange}
          onRenameBay={handleRenameBay}
          onMoveBay={handleMoveBay}
          onAddBedToBay={handleAddBedToBay}
          searchTerm={searchTerm}
          filterService={filterService}
        />
      </main>

      {/* 4. Footer Safety & Simulation Watermark */}
      <footer className="bg-slate-300 border-t border-slate-400/80 px-4 py-2 text-center text-xs text-slate-700 flex flex-wrap justify-between items-center gap-2 no-print">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-slate-800 uppercase tracking-wider">
            [SIMULATION ONLY]
          </span>
          <span>Older Persons Admissions Unit (OPAU) Transformation Scenario</span>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-slate-600 font-mono">
          <span>Password: <strong>Admin</strong></span>
          <span>·</span>
          <span>{wardState.bays.length} Bays ({wardState.beds.length} Bed Spaces)</span>
          <span>·</span>
          <button
            type="button"
            onClick={() => setIsBayManagerModalOpen(true)}
            className="text-purple-800 hover:text-purple-950 underline font-semibold font-sans"
          >
            Manage Bays
          </button>
          <span>·</span>
          <button
            type="button"
            onClick={() => setIsUserGuideOpen(true)}
            className="text-purple-800 hover:text-purple-950 underline font-semibold font-sans"
          >
            User Guide
          </button>
          <span>·</span>
          <button
            type="button"
            onClick={() => {
              setExportImportInitialTab('export');
              setIsExportImportModalOpen(true);
            }}
            className="text-purple-800 hover:text-purple-950 underline font-semibold font-sans"
          >
            Export/Import JSON
          </button>
        </div>
      </footer>

      {/* 5. Modals & Dialogs */}
      {/* Quick User Guide Modal */}
      <UserGuideModal
        isOpen={isUserGuideOpen}
        onClose={() => setIsUserGuideOpen(false)}
      />
      {/* Admin Password Prompt Modal */}
      <AdminPasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSuccess={handleUnlockAdmin}
      />

      {/* Patient & Bed Space Editor Modal */}
      <BedEditModal
        bed={editingBed}
        bays={wardState.bays}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingBed(null);
        }}
        onSave={handleSaveBed}
        onDeleteBed={handleDeleteBed}
      />

      {/* Bay Manager & Renumbering Modal */}
      <BayManagerModal
        isOpen={isBayManagerModalOpen}
        onClose={() => setIsBayManagerModalOpen(false)}
        wardState={wardState}
        onUpdateBays={handleUpdateBays}
      />

      {/* JSON Import / Export & Presets Modal */}
      <ImportExportModal
        isOpen={isExportImportModalOpen}
        onClose={() => setIsExportImportModalOpen(false)}
        wardState={wardState}
        onImportState={handleImportState}
        initialTab={exportImportInitialTab}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 border border-slate-700 text-xs animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
