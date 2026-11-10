import React from 'react';
import { WardSimulationState, BedSpace } from '../types';
import { BedCard } from './BedCard';

interface WardBoardProps {
  wardState: WardSimulationState;
  isAdmin: boolean;
  onEditBed: (bed: BedSpace) => void;
  onQuickNewsChange?: (bedId: string, delta: number) => void;
  searchTerm?: string;
  filterService?: string;
}

export const WardBoard: React.FC<WardBoardProps> = ({
  wardState,
  isAdmin,
  onEditBed,
  onQuickNewsChange,
  searchTerm = '',
  filterService = 'ALL',
}) => {
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

  return (
    <div className="w-full overflow-x-auto pb-4">
      {/* 5-Column Bay Grid - min-w-[1340px] ensures authentic hospital whiteboard density and alignment */}
      <div className="grid grid-cols-5 gap-2.5 min-w-[1300px] px-2.5 pt-2">
        {wardState.bays.map((bay) => {
          const bayBeds = wardState.beds.filter((b) => b.bayId === bay.id);
          const visibleBeds = bayBeds.filter(filterBed);

          return (
            <div key={bay.id} className="flex flex-col gap-2">
              {/* Bay Header bar matching the hospital board */}
              <div className="bg-[#cbd5e1] border border-slate-300 py-1.5 px-3 text-center text-slate-800 font-bold text-sm tracking-tight shadow-2xs">
                {bay.name}
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
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
