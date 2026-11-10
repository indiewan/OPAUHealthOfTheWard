import React from 'react';
import { BedSpace } from '../types';
import { ServiceBadge, DestinationBadge } from './Badges';
import { Edit3, Plus, Minus, Lock, AlertCircle } from 'lucide-react';

interface BedCardProps {
  bed: BedSpace;
  isAdmin: boolean;
  onEdit: (bed: BedSpace) => void;
  onQuickNewsChange?: (bedId: string, delta: number) => void;
}

export const BedCard: React.FC<BedCardProps> = ({
  bed,
  isAdmin,
  onEdit,
  onQuickNewsChange,
}) => {
  // 1. Closed Bed Space rendering (e.g. Bed 05 Bay 01 in screenshot)
  if (bed.status === 'closed') {
    return (
      <div
        onClick={() => isAdmin && onEdit(bed)}
        className={`relative bg-[#40454d] text-white rounded-none border border-[#2e3238] p-2 min-h-[92px] flex flex-col justify-between text-xs transition-all ${
          isAdmin ? 'cursor-pointer hover:ring-2 hover:ring-amber-400 hover:brightness-110' : ''
        }`}
        title={isAdmin ? 'Click to edit closed bed details' : undefined}
      >
        {isAdmin && (
          <div className="absolute -top-2 -right-2 bg-amber-500 text-slate-900 rounded-full p-1 shadow-md z-10">
            <Edit3 className="w-3 h-3" />
          </div>
        )}
        <div className="flex justify-between items-center border-b border-slate-600/60 pb-1">
          <span className="font-bold text-slate-100 text-[13px] tracking-tight">{bed.bedLabel}</span>
          <span className="font-mono text-[11px] text-slate-300">
            {bed.closedDetails?.timestamp || '09/11 11:59PM'}
          </span>
        </div>
        <div className="py-1 text-slate-200 text-xs font-medium">
          {bed.closedDetails?.reason || 'Pt in endoscopy'}
        </div>
        <div className="pt-1 border-t border-slate-600/60 text-[11px] text-slate-300 flex justify-between items-center">
          <span>{bed.closedDetails?.tag || 'Closed Beds'}</span>
          {isAdmin && <span className="text-[10px] text-amber-300 uppercase font-semibold">Click to re-open</span>}
        </div>
      </div>
    );
  }

  // 2. Vacant Bed Space rendering
  if (bed.status === 'vacant' || !bed.patient) {
    return (
      <div
        onClick={() => isAdmin && onEdit(bed)}
        className={`bg-slate-50 text-slate-500 rounded-none border border-dashed border-slate-300 p-2 min-h-[92px] flex flex-col justify-between text-xs transition-all ${
          isAdmin ? 'cursor-pointer hover:bg-purple-50 hover:border-purple-400 hover:text-purple-700' : ''
        }`}
        title={isAdmin ? 'Click to admit simulated patient' : undefined}
      >
        <div className="flex justify-between items-center">
          <span className="font-bold text-slate-700 text-[13px]">{bed.bedLabel}</span>
          <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">Vacant</span>
        </div>
        <div className="text-center py-2 text-slate-400 italic font-mono text-xs">
          {isAdmin ? '+ Click to admit patient' : 'No Patient Assigned'}
        </div>
        <div className="grid grid-cols-3 border-t border-slate-200 text-center pt-1 text-slate-300 text-xs font-mono">
          <span>-</span>
          <span>-</span>
          <span>-</span>
        </div>
      </div>
    );
  }

  // 3. Occupied Bed Space rendering (matches screenshot)
  const patientDisplayName = bed.patient?.name
    ? `${bed.patient.name} ${bed.patient.gender ? `(${bed.patient.gender})` : ''}`
    : 'UNKNOWN PATIENT';

  // Format NEWS score display
  const newsDisplay = bed.newsScore !== null && bed.newsScore !== undefined ? bed.newsScore : '-';
  const isHighNews = typeof bed.newsScore === 'number' && bed.newsScore >= 7;
  const isMediumNews = typeof bed.newsScore === 'number' && bed.newsScore >= 5 && bed.newsScore < 7;

  return (
    <div
      onClick={() => isAdmin && onEdit(bed)}
      className={`group relative bg-white text-slate-900 border border-slate-300 shadow-xs flex flex-col justify-between min-h-[96px] transition-all select-none ${
        isAdmin ? 'cursor-pointer hover:border-purple-600 hover:shadow-md' : ''
      }`}
      title={isAdmin ? `Edit ${bed.bedLabel} (${bed.patient.name})` : undefined}
    >
      {/* Admin indicator icon */}
      {isAdmin && (
        <button
          type="button"
          aria-label={`Edit ${bed.bedLabel}`}
          className="absolute -top-2 -right-2 bg-purple-700 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-20 hover:bg-purple-800"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(bed);
          }}
        >
          <Edit3 className="w-3 h-3" />
        </button>
      )}

      {/* TOP ROW: Bed Label on left, Service Badge on right */}
      <div className="flex justify-between items-center px-2 pt-1 pb-0.5">
        <span className="font-bold text-slate-900 text-[13px] tracking-tight">
          {bed.bedLabel}
        </span>
        <div className="shrink-0">
          <ServiceBadge service={bed.service} />
        </div>
      </div>

      {/* MIDDLE ROW: Patient Name & Optional Swab Banner */}
      <div className="px-1 py-0.5">
        <div
          className={`px-1 py-0.5 text-[13px] font-bold tracking-tight text-slate-900 truncate ${
            bed.isYellowHighlight ? 'bg-[#fff000] text-slate-950 font-extrabold' : ''
          }`}
          title={patientDisplayName}
        >
          {patientDisplayName}
        </div>

        {bed.hasSwabBanner && (
          <div className="bg-[#0f8b39] text-white text-[11px] font-extrabold text-center py-0.5 mt-0.5 tracking-wider uppercase">
            SWAB
          </div>
        )}
      </div>

      {/* BOTTOM ROW: 3 Distinct Columns (Destination, NEWS Score, Patient Specific Info) */}
      <div className="grid grid-cols-3 border-t border-slate-300 text-center divide-x divide-slate-300 bg-white">
        {/* Cell 1: Where they are going (DIS, RBOPS1, etc.) */}
        <div className="py-1 px-1 flex items-center justify-center min-h-[26px]">
          <DestinationBadge destination={bed.destination} />
        </div>

        {/* Cell 2: Middle bottom is NEWS score */}
        <div className="py-1 px-1 flex items-center justify-center min-h-[26px] relative group/news">
          <span
            className={`font-mono font-bold text-sm tabular-nums leading-none ${
              isHighNews
                ? 'text-red-600 bg-red-50 px-1.5 py-0.5 rounded-sm ring-1 ring-red-400'
                : isMediumNews
                ? 'text-amber-700'
                : 'text-slate-900'
            }`}
          >
            {newsDisplay}
          </span>

          {/* Quick NEWS stepper for instructors during simulation drills */}
          {isAdmin && onQuickNewsChange && (
            <div
              className="absolute inset-0 bg-purple-50/95 hidden group-hover:flex items-center justify-center gap-1 z-10 px-0.5"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                title="Decrease NEWS"
                className="w-5 h-5 flex items-center justify-center bg-white border border-slate-300 hover:bg-slate-100 rounded text-slate-700 text-xs"
                onClick={() => onQuickNewsChange(bed.id, -1)}
              >
                <Minus className="w-2.5 h-2.5" />
              </button>
              <button
                type="button"
                title="Increase NEWS"
                className="w-5 h-5 flex items-center justify-center bg-purple-700 hover:bg-purple-800 text-white rounded text-xs"
                onClick={() => onQuickNewsChange(bed.id, 1)}
              >
                <Plus className="w-2.5 h-2.5" />
              </button>
            </div>
          )}
        </div>

        {/* Cell 3: Bottom right is important patient specific information */}
        <div className="py-1 px-1 flex items-center justify-center min-h-[26px]">
          <span
            className={`text-xs font-semibold tracking-tight ${
              bed.patientInfo === 'EOL'
                ? 'text-purple-900 font-extrabold'
                : bed.patientInfo === 'NR'
                ? 'text-slate-800 font-extrabold'
                : bed.patientInfo.includes('*')
                ? 'text-slate-700 font-mono font-bold'
                : 'text-slate-500 font-mono'
            }`}
          >
            {bed.patientInfo || '-'}
          </span>
        </div>
      </div>
    </div>
  );
};
