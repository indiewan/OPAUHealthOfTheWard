import React from 'react';
import { X, Lock, Edit3, Grid, Download, Upload, HelpCircle, CheckCircle, ShieldAlert } from 'lucide-react';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserGuideModal: React.FC<UserGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
      <div
        className="bg-white rounded-lg shadow-2xl border border-slate-300 w-full max-w-2xl overflow-hidden my-6"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-[#383582] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-white/15 p-1.5 rounded-full">
              <HelpCircle className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight">OPAU Simulation Ward Guide</h3>
              <p className="text-[11px] text-purple-200">
                Quick reference instructions for inputting patients & managing the ward
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white rounded p-1 hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs text-slate-700 max-h-[75vh] overflow-y-auto leading-relaxed">
          {/* Section 1: Modes */}
          <div className="border border-slate-200 rounded-lg p-3.5 bg-slate-50 space-y-1.5">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-purple-800" />
              <span>1. Viewing Mode vs Admin Edit Mode</span>
            </h4>
            <p>
              By default, the whiteboard opens in <strong>Viewing Mode (read-only)</strong> so information cannot be accidentally clicked or changed during presentations.
            </p>
            <p className="bg-white p-2 rounded border border-slate-200 font-medium">
              👉 To edit: Click the <strong>"Admin Mode"</strong> button in the top right. Enter password: <strong className="text-purple-900 font-mono">Admin</strong>.
            </p>
          </div>

          {/* Section 2: Editing a Patient / Bed */}
          <div className="border border-slate-200 rounded-lg p-3.5 bg-slate-50 space-y-2">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <Edit3 className="w-4 h-4 text-purple-800" />
              <span>2. How to Edit a Patient or Bed Space</span>
            </h4>
            <p>
              Once in <strong>Admin Mode</strong>, click on <strong>any bed card</strong> to open the patient editor:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-[11px]">
              <li><strong>Patient Name:</strong> Type any simulated placeholder name (e.g. <code>SIM PATIENT 01</code>) or click <em>Auto-generate Simulated Tag</em>.</li>
              <li><strong>Gender:</strong> Select <code>M</code> (Male), <code>F</code> (Female), or <code>Other</code>.</li>
              <li><strong>Bed Status:</strong> Choose <strong>Occupied</strong>, <strong>Closed</strong> (with procedure/reason note), or <strong>Vacant</strong> (discharged).</li>
              <li><strong>Where they are (Service - Top Right):</strong> Select <code>OPS</code>, <code>EACM</code>, <code>T.B.T.</code>, <code>CARD</code>, <code>GMG</code>, or type custom.</li>
              <li><strong>Where they are going (Destination - Bottom Left):</strong> Select <code>DIS</code> (Discharge), <code>RBOPS1</code>, <code>RBOPS4</code>, <code>HOME</code>, <code>REHAB</code>, or <code>-</code>.</li>
              <li><strong>NEWS Score (Bottom Middle):</strong> Enter the patient's early warning score (0 to 20) or click the number buttons.</li>
              <li><strong>Important Patient Info (Bottom Right):</strong> Select or type flags like <code>**</code>, <code>***</code>, <code>EOL</code> (End of Life), <code>NR</code> (DNACPR), <code>TEL</code>, <code>*TEL</code>, <code>FALLS</code>.</li>
              <li><strong>Visual Alerts:</strong> Toggle <strong>Yellow Highlight Bar</strong> (isolation/alert) or <strong>Green SWAB Banner</strong>.</li>
            </ul>
          </div>

          {/* Section 3: Bays & Numbering */}
          <div className="border border-slate-200 rounded-lg p-3.5 bg-slate-50 space-y-1.5">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <Grid className="w-4 h-4 text-purple-800" />
              <span>3. Renaming & Altering Ward Bays</span>
            </h4>
            <ul className="list-disc pl-5 space-y-1 text-[11px]">
              <li><strong>Direct Rename:</strong> In Admin Mode, click directly on any Bay Header (e.g. <em>Bay 01</em>) to type a new name and press <kbd className="bg-slate-200 px-1 rounded">Enter</kbd>.</li>
              <li><strong>Reorder Columns:</strong> Click the <strong><code>←</code></strong> and <strong><code>→</code></strong> arrows on bay headers to reorder columns.</li>
              <li><strong>Quick Renumber All Bays:</strong> Click <strong>"Manage Bays & Numbering"</strong> in the Admin toolbar. Enter a starting number (e.g. <code>2</code>) and click <em>Apply Numbering</em> to renumber the whole ward (Bay 02, Bay 03...).</li>
            </ul>
          </div>

          {/* Section 4: Transferring between computers */}
          <div className="border border-slate-200 rounded-lg p-3.5 bg-slate-50 space-y-1.5">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <Download className="w-4 h-4 text-purple-800" />
              <span>4. Transferring Data to Other Computers (JSON Transfer)</span>
            </h4>
            <p>
              Your changes automatically save in your current browser. To move your customized ward to another laptop or projector screen:
            </p>
            <ol className="list-decimal pl-5 space-y-1 text-[11px]">
              <li>Click <strong>"JSON Transfer"</strong> in the top bar.</li>
              <li>Under <strong>Export JSON</strong>, click <strong>"Download .json File"</strong> (or Copy to Clipboard).</li>
              <li>On the other computer, open the website, click <strong>JSON Transfer</strong> &rarr; <strong>Import JSON</strong>, and select the file. Click <strong>Load This Ward Simulation</strong>.</li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-5 py-3 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-white bg-[#383582] hover:bg-[#2d2a6a] rounded transition-colors"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
