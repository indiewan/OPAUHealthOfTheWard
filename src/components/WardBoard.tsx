import React, { useState } from 'react';
import { WardSimulationState, BedSpace, WardBay } from '../types';
import { BedCard } from './BedCard';
import { Edit3, Check, X, ArrowLeft, ArrowRight, Plus } from 'lucide-react';

interface WardBoardProps {
  wardState: WardSimulationState;
  isAdmin: boolean;
  onEditBed: (bed: BedSpace) => void;
  onQuickNewsChange?: (bedId: string, delta: number) => void;
  onRenameBay?: (bayId: string, newName: string) => void;
  onMoveBay?: (index: number, direction: 'left' | 'right') => void;
  onAddBedToBay?: (bayId: string, bayName: string) => void;
  searchTerm?: string;
  filterService?: string;
}

export const WardBoard: React.FC<WardBoardProps> = ({
  wardState,
  isAdmin,
  onEditBed,
  onQuickNewsChange,
  onRenameBay,
  onMoveBay,
  onAddBedToBay,
  searchTerm = '',
  filterService = 'ALL',
}) => {
  const [inlineEditingBayId, setInlineEditingBayId] = useState<string | null>(null);
  const [inlineBayName, setInlineBayName] = useState<string>('');

  const handleStartRename = (bay: WardBay) => {
    setInlineEditingBayId(bay.id);
    setInlineBayName(bay.name);
  };

  const handleSaveRename = (bayId: string) => {
    if (inlineBayName.trim() && onRenameBay) {
      onRenameBay(bayId, inlineBayName.trim());
    }
    setInlineEditingBayId(null);
  };

  // Filter beds if search or filter is applied
  const filterBed = (bed: BedSpace) => {
    if (filterService !== 'ALL' && bed.service.toUpperCase() !== filterService) {
      return false;
    }
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const bedMatch = bed.bedLabel.toLowerCase().includes(term);
    const bayMatch = bed.bayName.toLowerCase().includes(term);
    const patientMatch = bed.patient?.name.toLowerCase().includes(term);
    const infoMatch = bed.patientInfo.toLowerCase().includes(term);
    const destMatch = bed.destination.toLowerCase().includes(term);
    return bedMatch || bayMatch || patientMatch || infoMatch || destMatch;
  };

  const bayCount = wardState.bays.length;

  return (
    <div className="w-full overflow-x-auto pb-4">
      {/* Dynamic Column Bay Grid - minimum width ensures authentic hospital whiteboard density */}
      <div
        className="grid gap-2.5 px-2.5 pt-2"
        style={{
          gridTemplateColumns: `repeat(${bayCount}, minmax(250px, 1fr))`,
          minWidth: `${Math.max(1200, bayCount * 260)}px`,
        }}
      >
        {wardState.bays.map((bay, index) => {
          const bayBeds = wardState.beds.filter((b) => b.bayId === bay.id);
          const visibleBeds = bayBeds.filter(filterBed);
          const isInlineEditing = inlineEditingBayId === bay.id;

          return (
            <div key={bay.id} className="flex flex-col gap-2">
              {/* Bay Header bar matching the hospital board */}
              <div className="group/bay relative bg-[#cbd5e1] border border-slate-300 py-1.5 px-2 text-center text-slate-800 font-bold text-sm tracking-tight shadow-2xs flex items-center justify-between">
                {/* Left arrow (in admin mode) */}
                {isAdmin && onMoveBay && (
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => onMoveBay(index, 'left')}
                    className={`p-0.5 rounded text-slate-600 hover:text-slate-900 ${
                      index === 0 ? 'opacity-20 cursor-not-allowed' : 'hover:bg-slate-300'
                    }`}
                    title="Move bay column left"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Bay Name or Inline Rename Field */}
                <div className="flex-1 px-1">
                  {isInlineEditing ? (
                    <div className="flex items-center gap-1 justify-center">
                      <input
                        type="text"
                        value={inlineBayName}
                        onChange={(e) => setInlineBayName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveRename(bay.id);
                          if (e.key === 'Escape') setInlineEditingBayId(null);
                        }}
                        autoFocus
                        className="px-1.5 py-0.5 text-xs font-bold border border-purple-500 rounded bg-white text-slate-900 w-28 text-center focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveRename(bay.id)}
                        className="p-1 bg-purple-700 text-white rounded hover:bg-purple-800"
                        title="Save Name"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setInlineEditingBayId(null)}
                        className="p-1 bg-slate-300 text-slate-700 rounded hover:bg-slate-400"
                        title="Cancel"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-1.5">
                      <span
                        className={isAdmin ? 'cursor-pointer hover:underline' : ''}
                        onClick={() => isAdmin && handleStartRename(bay)}
                        title={isAdmin ? 'Click to rename this bay' : undefined}
                      >
                        {bay.name}
                      </span>
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => handleStartRename(bay)}
                          className="opacity-0 group-hover/bay:opacity-100 transition-opacity p-0.5 text-purple-800 hover:text-purple-950"
                          title="Rename bay"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Right arrow (in admin mode) */}
                {isAdmin && onMoveBay && (
                  <button
                    type="button"
                    disabled={index === bayCount - 1}
                    onClick={() => onMoveBay(index, 'right')}
                    className={`p-0.5 rounded text-slate-600 hover:text-slate-900 ${
                      index === bayCount - 1 ? 'opacity-20 cursor-not-allowed' : 'hover:bg-slate-300'
                    }`}
                    title="Move bay column right"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Bay Beds List */}
              <div className="flex flex-col gap-2">
                {visibleBeds.map((bed) => (
                  <BedCard
                    key={bed.id}
                    bed={bed}
                    isAdmin={isAdmin}
                    onEdit={onEditBed}
                    onQuickNewsChange={onQuickNewsChange}
                  />
                ))}

                {visibleBeds.length === 0 && (
                  <div className="p-4 text-center text-xs text-slate-400 bg-white/60 border border-dashed border-slate-300">
                    No beds match current filter
                  </div>
                )}

                {/* Quick Add Bed to this Bay button in Admin Mode */}
                {isAdmin && onAddBedToBay && (
                  <button
                    type="button"
                    onClick={() => onAddBedToBay(bay.id, bay.name)}
                    className="p-1.5 text-xs font-semibold text-purple-800 hover:text-purple-950 bg-white/80 hover:bg-purple-50 border border-dashed border-purple-300 rounded flex items-center justify-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Bed to {bay.name}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
