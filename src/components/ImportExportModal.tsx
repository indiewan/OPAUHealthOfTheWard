import React, { useState, useRef } from 'react';
import { WardSimulationState } from '../types';
import { exportWardToJson, validateWardJson } from '../utils/storage';
import { SCENARIO_PRESETS, ScenarioPreset } from '../data/simulationPresets';
import {
  X,
  Download,
  Upload,
  Copy,
  Check,
  FileText,
  AlertCircle,
  Layers,
  Sparkles,
  ArrowRight,
  HardDrive,
} from 'lucide-react';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  wardState: WardSimulationState;
  onImportState: (newState: WardSimulationState) => void;
  initialTab?: 'export' | 'import' | 'presets';
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  isOpen,
  onClose,
  wardState,
  onImportState,
  initialTab = 'export',
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'export' | 'import' | 'presets'>(initialTab);
  const [copied, setCopied] = useState(false);
  const [pasteJsonText, setPasteJsonText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [previewState, setPreviewState] = useState<WardSimulationState | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const jsonString = JSON.stringify(wardState, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownload = () => {
    exportWardToJson(wardState);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    setPreviewState(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        const result = validateWardJson(parsed);
        if (result.valid && result.state) {
          setPreviewState(result.state);
        } else {
          setImportError(result.error || 'Invalid simulation JSON format.');
        }
      } catch (err: any) {
        setImportError(`JSON Parse error: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  const handleValidatePasted = () => {
    setImportError(null);
    setPreviewState(null);
    if (!pasteJsonText.trim()) {
      setImportError('Please paste JSON data first.');
      return;
    }
    try {
      const parsed = JSON.parse(pasteJsonText);
      const result = validateWardJson(parsed);
      if (result.valid && result.state) {
        setPreviewState(result.state);
      } else {
        setImportError(result.error || 'Invalid simulation JSON format.');
      }
    } catch (err: any) {
      setImportError(`JSON Parse error: ${err.message}`);
    }
  };

  const handleConfirmImport = () => {
    if (!previewState) return;
    onImportState(previewState);
    onClose();
  };

  const handleLoadScenario = (preset: ScenarioPreset) => {
    const newState = preset.getState();
    onImportState(newState);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
      <div
        className="bg-white rounded-lg shadow-2xl border border-slate-300 w-full max-w-3xl overflow-hidden my-6"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-[#383582] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-white/15 p-1.5 rounded-full">
              <HardDrive className="w-4 h-4 text-purple-200" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight">Simulation Data Transfer & Scenarios</h3>
              <p className="text-[11px] text-purple-200">
                Export and import JSON format to transfer simulated wards between computers
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

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-5 pt-3 gap-2 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('export')}
            className={`flex items-center gap-1.5 px-4 py-2 font-bold border-b-2 transition-all ${
              activeTab === 'export'
                ? 'border-purple-700 text-purple-900 bg-white rounded-t'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('import')}
            className={`flex items-center gap-1.5 px-4 py-2 font-bold border-b-2 transition-all ${
              activeTab === 'import'
                ? 'border-purple-700 text-purple-900 bg-white rounded-t'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import JSON</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`flex items-center gap-1.5 px-4 py-2 font-bold border-b-2 transition-all ${
              activeTab === 'presets'
                ? 'border-purple-700 text-purple-900 bg-white rounded-t'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Simulation Scenarios</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 text-xs max-h-[70vh] overflow-y-auto">
          {/* TAB 1: EXPORT */}
          {activeTab === 'export' && (
            <div className="space-y-4">
              <div className="bg-purple-50 border border-purple-200 p-3.5 rounded text-purple-950 flex items-start gap-3">
                <FileText className="w-5 h-5 text-purple-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs">Export Current Ward Simulation</h4>
                  <p className="text-[11px] text-purple-800 mt-0.5 leading-relaxed">
                    Download all {wardState.beds.length} beds with current patient statuses, location data, destinations, NEWS scores, and flags into a portable <code>.json</code> file.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#383582] hover:bg-[#2d2a6a] text-white font-bold rounded shadow-xs transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download .json File</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded border border-slate-300 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied JSON!' : 'Copy to Clipboard'}</span>
                </button>
              </div>

              {/* JSON preview */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  JSON Data Preview ({wardState.beds.length} beds)
                </label>
                <textarea
                  readOnly
                  value={jsonString}
                  rows={10}
                  className="w-full p-3 font-mono text-[11px] bg-slate-900 text-emerald-400 rounded border border-slate-700 focus:outline-none select-all"
                />
              </div>
            </div>
          )}

          {/* TAB 2: IMPORT */}
          {activeTab === 'import' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 p-3.5 rounded text-blue-950 flex items-start gap-3">
                <Upload className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs">Import Simulation from Another Computer</h4>
                  <p className="text-[11px] text-blue-800 mt-0.5 leading-relaxed">
                    Upload a previously exported <code>.json</code> file or paste JSON code directly to replicate the exact health of the ward on this computer.
                  </p>
                </div>
              </div>

              {/* File upload option */}
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-5 text-center hover:bg-slate-50 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded text-xs transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Choose JSON File to Upload</span>
                </button>
                <p className="text-[11px] text-slate-500 mt-2">
                  Accepts files exported from this application (*.json)
                </p>
              </div>

              {/* Paste JSON option */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-bold text-slate-700">Or Paste JSON Content Below</label>
                  <button
                    type="button"
                    onClick={handleValidatePasted}
                    className="text-purple-700 hover:text-purple-900 font-bold text-[11px]"
                  >
                    Validate Pasted Text
                  </button>
                </div>
                <textarea
                  value={pasteJsonText}
                  onChange={(e) => {
                    setPasteJsonText(e.target.value);
                    setImportError(null);
                    setPreviewState(null);
                  }}
                  rows={5}
                  placeholder="Paste { ... } JSON data here..."
                  className="w-full p-2.5 font-mono text-[11px] border border-slate-300 rounded focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              {/* Error display */}
              {importError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded flex items-center gap-2 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{importError}</span>
                </div>
              )}

              {/* Validation Success & Preview */}
              {previewState && (
                <div className="p-4 bg-emerald-50 border border-emerald-300 rounded space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Valid Simulation Data Recognized!</span>
                    </span>
                    <span className="text-[11px] text-emerald-700 font-mono">
                      {previewState.beds.length} beds found
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                    <div className="bg-white p-2 rounded border border-emerald-200">
                      <div className="text-[10px] text-slate-500">Unit</div>
                      <div className="font-bold text-slate-800 truncate">{previewState.unitName}</div>
                    </div>
                    <div className="bg-white p-2 rounded border border-emerald-200">
                      <div className="text-[10px] text-slate-500">Occupied</div>
                      <div className="font-bold text-purple-700 font-mono">
                        {previewState.beds.filter((b) => b.status === 'occupied').length} beds
                      </div>
                    </div>
                    <div className="bg-white p-2 rounded border border-emerald-200">
                      <div className="text-[10px] text-slate-500">Closed</div>
                      <div className="font-bold text-slate-700 font-mono">
                        {previewState.beds.filter((b) => b.status === 'closed').length} beds
                      </div>
                    </div>
                    <div className="bg-white p-2 rounded border border-emerald-200">
                      <div className="text-[10px] text-slate-500">Scenario</div>
                      <div className="font-bold text-slate-800 truncate">
                        {previewState.metadata?.scenarioName || 'Imported File'}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={handleConfirmImport}
                      className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded shadow-xs transition-colors"
                    >
                      <span>Load This Ward Simulation</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PRESETS */}
          {activeTab === 'presets' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-600 mb-2">
                Quickly switch between pre-configured OPAU training scenarios for live simulation drills:
              </p>

              <div className="space-y-2.5">
                {SCENARIO_PRESETS.map((preset) => (
                  <div
                    key={preset.id}
                    className="p-3.5 border border-slate-200 rounded-lg hover:border-purple-400 hover:bg-purple-50/20 transition-all flex flex-col sm:flex-row justify-between sm:items-center gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900">{preset.name}</h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                          {preset.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{preset.description}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleLoadScenario(preset)}
                      className="shrink-0 px-3.5 py-1.5 bg-[#383582] hover:bg-[#2d2a6a] text-white font-bold rounded text-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Load Scenario</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-5 py-3 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
