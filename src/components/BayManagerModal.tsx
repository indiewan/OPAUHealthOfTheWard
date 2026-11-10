import React, { useState } from 'react';
import { WardSimulationState, WardBay, BedSpace } from '../types';
import {
  X,
  Plus,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Save,
  Grid,
  Check,
  AlertCircle,
  Hash,
  MoveHorizontal,
} from 'lucide-react';

interface BayManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  wardState: WardSimulationState;
  onUpdateBays: (bays: WardBay[], beds: BedSpace[]) => void;
}

export const BayManagerModal: React.FC<BayManagerModalProps> = ({
  isOpen,
  onClose,
  wardState,
  onUpdateBays,
}) => {
  const [bays, setBays] = useState<WardBay[]>(() => JSON.parse(JSON.stringify(wardState.bays)));
  const [beds, setBeds] = useState<BedSpace[]>(() => JSON.parse(JSON.stringify(wardState.beds)));
  const [newBayName, setNewBayName] = useState('');
  const [startNumber, setStartNumber] = useState<string>('2');
  const [prefix, setPrefix] = useState<string>('Bay ');
  const [padZero, setPadZero] = useState<boolean>(true);
  const [editingBayId, setEditingBayId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');

  // Synchronize state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setBays(JSON.parse(JSON.stringify(wardState.bays)));
      setBeds(JSON.parse(JSON.stringify(wardState.beds)));
      setEditingBayId(null);
    }
  }, [isOpen, wardState.bays, wardState.beds]);

  if (!isOpen) return null;

  // Handle renaming a bay
  const handleRenameBay = (bayId: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) return;

    setBays((prev) =>
      prev.map((b) => (b.id === bayId ? { ...b, name: trimmed } : b))
    );

    // Update bayName on beds in that bay
    setBeds((prev) =>
      prev.map((bed) => (bed.bayId === bayId ? { ...bed, bayName: trimmed } : bed))
    );

    setEditingBayId(null);
  };

  // Reorder bays left / right
  const handleMoveBay = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= bays.length) return;

    const newBays = [...bays];
    const temp = newBays[index];
    newBays[index] = newBays[targetIndex];
    newBays[targetIndex] = temp;

    // Update order property
    const reordered = newBays.map((b, idx) => ({ ...b, order: idx + 1 }));
    setBays(reordered);
  };

  // Add new bay
  const handleAddBay = () => {
    const trimmed = newBayName.trim();
    if (!trimmed) return;

    const newId = `bay-${Date.now()}`;
    const newBay: WardBay = {
      id: newId,
      name: trimmed,
      order: bays.length + 1,
    };

    setBays([...bays, newBay]);
    setNewBayName('');
  };

  // Delete a bay
  const handleDeleteBay = (bayId: string) => {
    const bayBeds = beds.filter((b) => b.bayId === bayId);
    if (bayBeds.length > 0) {
      if (
        !window.confirm(
          `This bay has ${bayBeds.length} bed space(s). Deleting it will also remove these beds from the whiteboard. Are you sure?`
        )
      ) {
        return;
      }
    }

    setBays((prev) => prev.filter((b) => b.id !== bayId));
    setBeds((prev) => prev.filter((b) => b.bayId !== bayId));
  };

  // Batch renumber bays starting from custom number (e.g. starting with 2, 3, 10, etc.)
  const handleRenumberBays = () => {
    const startNum = parseInt(startNumber, 10);
    if (isNaN(startNum)) return;

    const updatedBays = bays.map((bay, idx) => {
      const num = startNum + idx;
      const numStr = padZero && num < 10 ? `0${num}` : `${num}`;
      const name = `${prefix}${numStr}`;
      return {
        ...bay,
        name,
      };
    });

    // Update beds with new bay names
    const bayNameMap = new Map<string, string>();
    updatedBays.forEach((b) => bayNameMap.set(b.id, b.name));

    const updatedBeds = beds.map((bed) => ({
      ...bed,
      bayName: bayNameMap.get(bed.bayId) || bed.bayName,
    }));

    setBays(updatedBays);
    setBeds(updatedBeds);
  };

  const handleSaveAll = () => {
    onUpdateBays(bays, beds);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
      <div
        className="bg-white rounded-lg shadow-2xl border border-slate-300 w-full max-w-2xl overflow-hidden my-6"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-[#383582] text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-white/15 p-1.5 rounded-full">
              <Grid className="w-4 h-4 text-purple-200" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight">Manage Ward Bays & Numbering</h3>
              <p className="text-[11px] text-purple-200">
                Rename, reorder, renumber, add or remove bays on the simulation whiteboard
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white rounded p-1 hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 text-xs max-h-[75vh] overflow-y-auto">
          {/* Quick Renumber Tool: Solves "they are not starting with Bay 1" */}
          <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg space-y-3">
            <div className="flex items-center gap-2 text-purple-900 font-bold">
              <Hash className="w-4 h-4 text-purple-700" />
              <span>Quick Renumber Bays (e.g. Start at Bay 02, Bay 11, etc.)</span>
            </div>
            <p className="text-[11px] text-purple-800 leading-relaxed">
              If your hospital ward starts with a different bay number (e.g. Bay 2 instead of Bay 1), set the starting number below and click <strong>Apply Numbering</strong> to update all bays sequentially.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 items-end">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Prefix
                </label>
                <input
                  type="text"
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value)}
                  placeholder="Bay "
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Start Number
                </label>
                <input
                  type="number"
                  min="0"
                  max="999"
                  value={startNumber}
                  onChange={(e) => setStartNumber(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs font-bold font-mono focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center pb-2">
                <label className="flex items-center gap-1.5 text-[11px] text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={padZero}
                    onChange={(e) => setPadZero(e.target.checked)}
                    className="rounded text-purple-600 focus:ring-purple-500"
                  />
                  <span>Zero pad (e.g. 02)</span>
                </label>
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleRenumberBays}
                  className="w-full py-1.5 px-3 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded text-xs transition-colors shadow-2xs"
                >
                  Apply Numbering
                </button>
              </div>
            </div>
          </div>

          {/* Current Bays List */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="font-bold text-slate-800">
                Current Ward Bays ({bays.length} Columns)
              </label>
              <span className="text-[11px] text-slate-500">
                Use arrows to move columns left / right
              </span>
            </div>

            <div className="space-y-2 border border-slate-200 rounded-lg p-2.5 bg-slate-50">
              {bays.map((bay, index) => {
                const bayBedCount = beds.filter((b) => b.bayId === bay.id).length;
                const isEditing = editingBayId === bay.id;

                return (
                  <div
                    key={bay.id}
                    className="flex items-center justify-between gap-2 bg-white p-2.5 rounded border border-slate-200 hover:border-slate-300 shadow-2xs transition-all"
                  >
                    {/* Left: Position and Name */}
                    <div className="flex items-center gap-2.5 flex-1">
                      <span className="font-mono text-xs font-bold text-slate-400 w-5 text-center">
                        #{index + 1}
                      </span>

                      {isEditing ? (
                        <div className="flex items-center gap-1 flex-1 max-w-xs">
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleRenameBay(bay.id, editingName);
                              if (e.key === 'Escape') setEditingBayId(null);
                            }}
                            autoFocus
                            className="w-full px-2 py-1 text-xs font-bold border border-purple-500 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                          />
                          <button
                            type="button"
                            onClick={() => handleRenameBay(bay.id, editingName)}
                            className="p-1 bg-purple-700 text-white rounded hover:bg-purple-800"
                            title="Save Name"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingBayId(null)}
                            className="p-1 bg-slate-200 text-slate-600 rounded hover:bg-slate-300"
                            title="Cancel"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-xs">
                            {bay.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingBayId(bay.id);
                              setEditingName(bay.name);
                            }}
                            className="text-[11px] text-purple-700 hover:text-purple-900 underline font-medium"
                          >
                            Rename
                          </button>
                        </div>
                      )}

                      <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-mono">
                        {bayBedCount} bed{bayBedCount !== 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* Right: Reorder and Delete controls */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => handleMoveBay(index, 'left')}
                        className={`p-1 rounded border ${
                          index === 0
                            ? 'text-slate-300 border-slate-200 cursor-not-allowed'
                            : 'text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                        title="Move column left"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        disabled={index === bays.length - 1}
                        onClick={() => handleMoveBay(index, 'right')}
                        className={`p-1 rounded border ${
                          index === bays.length - 1
                            ? 'text-slate-300 border-slate-200 cursor-not-allowed'
                            : 'text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                        title="Move column right"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteBay(bay.id)}
                        className="p-1 rounded border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 ml-1"
                        title="Delete this bay"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add New Bay */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Add New Bay Column
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newBayName}
                onChange={(e) => setNewBayName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddBay()}
                placeholder="e.g. Bay 07, Frailty Assessment Bay, Discharge Lounge..."
                className="flex-1 px-3 py-1.5 border border-slate-300 rounded text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-purple-500 bg-white"
              />
              <button
                type="button"
                onClick={handleAddBay}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#383582] hover:bg-[#2d2a6a] text-white font-bold rounded text-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Bay</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-5 py-3 border-t border-slate-200 flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveAll}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#383582] hover:bg-[#2d2a6a] text-white font-bold rounded text-xs transition-colors shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save & Update Ward Board</span>
          </button>
        </div>
      </div>
    </div>
  );
};
