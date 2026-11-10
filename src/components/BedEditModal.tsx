import React, { useState, useEffect } from 'react';
import { BedSpace, BedStatus, PatientGender, WardBay } from '../types';
import { X, Save, AlertTriangle, Sparkles, Trash2, LayoutGrid } from 'lucide-react';
import { ServiceBadge, DestinationBadge } from './Badges';

interface BedEditModalProps {
  bed: BedSpace | null;
  bays: WardBay[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedBed: BedSpace) => void;
  onDeleteBed?: (bedId: string) => void;
}

const COMMON_SERVICES = ['OPS', 'EACM', 'T.B.T.', 'CARD', 'GMG'];
const COMMON_DESTINATIONS = ['-', 'DIS', 'RBOPS1', 'RBOPS4', 'HOME', 'REHAB', 'AMU'];
const COMMON_FLAGS = ['.', '-', '**', '***', 'EOL', 'NR', 'TEL', '*TEL', 'FALLS', 'NBM'];

export const BedEditModal: React.FC<BedEditModalProps> = ({
  bed,
  bays,
  isOpen,
  onClose,
  onSave,
  onDeleteBed,
}) => {
  if (!isOpen || !bed) return null;

  const [status, setStatus] = useState<BedStatus>(bed.status);
  const [bedLabel, setBedLabel] = useState<string>(bed.bedLabel);
  const [bayId, setBayId] = useState<string>(bed.bayId);
  const [isSideRoom, setIsSideRoom] = useState<boolean>(bed.isSideRoom);
  const [patientName, setPatientName] = useState(bed.patient?.name || '');
  const [patientGender, setPatientGender] = useState<PatientGender>(bed.patient?.gender || 'M');
  const [patientAge, setPatientAge] = useState<string>(bed.patient?.age ? String(bed.patient.age) : '80');
  const [service, setService] = useState(bed.service || 'OPS');
  const [destination, setDestination] = useState(bed.destination || '-');
  const [newsScore, setNewsScore] = useState<string>(
    bed.newsScore !== null && bed.newsScore !== undefined ? String(bed.newsScore) : ''
  );
  const [patientInfo, setPatientInfo] = useState(bed.patientInfo || '.');
  const [isYellowHighlight, setIsYellowHighlight] = useState(bed.isYellowHighlight || false);
  const [hasSwabBanner, setHasSwabBanner] = useState(bed.hasSwabBanner || false);

  // Closed details
  const [closedReason, setClosedReason] = useState(bed.closedDetails?.reason || 'Pt in endoscopy');
  const [closedTime, setClosedTime] = useState(bed.closedDetails?.timestamp || '09/11 11:59PM');
  const [closedTag, setClosedTag] = useState(bed.closedDetails?.tag || 'Closed Beds');

  // Reset form when bed changes
  useEffect(() => {
    if (bed) {
      setStatus(bed.status);
      setBedLabel(bed.bedLabel);
      setBayId(bed.bayId);
      setIsSideRoom(bed.isSideRoom);
      setPatientName(bed.patient?.name || `SIM PATIENT ${bed.bedLabel.replace(/\D/g, '') || '01'}`);
      setPatientGender(bed.patient?.gender || 'M');
      setPatientAge(bed.patient?.age ? String(bed.patient.age) : '82');
      setService(bed.service || 'OPS');
      setDestination(bed.destination || '-');
      setNewsScore(bed.newsScore !== null && bed.newsScore !== undefined ? String(bed.newsScore) : '');
      setPatientInfo(bed.patientInfo || '.');
      setIsYellowHighlight(bed.isYellowHighlight || false);
      setHasSwabBanner(bed.hasSwabBanner || false);
      setClosedReason(bed.closedDetails?.reason || 'Pt in endoscopy');
      setClosedTime(bed.closedDetails?.timestamp || '09/11 11:59PM');
      setClosedTag(bed.closedDetails?.tag || 'Closed Beds');
    }
  }, [bed]);

  const handleSave = () => {
    const parsedNews = newsScore.trim() === '' ? null : Math.max(0, Math.min(20, parseInt(newsScore, 10) || 0));

    let updatedPatient = null;
    if (status === 'occupied') {
      updatedPatient = {
        id: bed.patient?.id || `p_${Date.now()}`,
        name: patientName.trim() || `SIM PATIENT ${bedLabel}`,
        gender: patientGender,
        age: parseInt(patientAge, 10) || 80,
      };
    }

    const selectedBay = bays.find((b) => b.id === bayId);
    const assignedBayName = selectedBay ? selectedBay.name : bed.bayName;

    const updated: BedSpace = {
      ...bed,
      bedLabel: bedLabel.trim() || bed.bedLabel,
      bayId,
      bayName: assignedBayName,
      isSideRoom,
      status,
      patient: updatedPatient,
      service: status === 'occupied' ? service : '',
      destination: status === 'occupied' ? destination : '-',
      newsScore: status === 'occupied' ? parsedNews : null,
      patientInfo: status === 'occupied' ? patientInfo : '',
      isYellowHighlight: status === 'occupied' ? isYellowHighlight : false,
      hasSwabBanner: status === 'occupied' ? hasSwabBanner : false,
      closedDetails:
        status === 'closed'
          ? {
              reason: closedReason,
              timestamp: closedTime,
              tag: closedTag,
            }
          : undefined,
    };

    onSave(updated);
    onClose();
  };

  const handleDischargeVacate = () => {
    setStatus('vacant');
    setPatientName('');
    setDestination('-');
    setNewsScore('');
    setPatientInfo('-');
    setIsYellowHighlight(false);
    setHasSwabBanner(false);
  };

  const handleMarkClosed = () => {
    setStatus('closed');
    setClosedReason('Pt in endoscopy');
    setClosedTime(
      `${new Date().getDate().toString().padStart(2, '0')}/${(new Date().getMonth() + 1).toString().padStart(2, '0')} 11:59PM`
    );
  };

  const generateAnonymousName = () => {
    const num = Math.floor(10 + Math.random() * 89);
    setPatientName(`SIM PATIENT ${num}`);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${bed.bedLabel} from the ward?`)) {
      if (onDeleteBed) {
        onDeleteBed(bed.id);
      }
      onClose();
    }
  };

  // NEWS risk scale calculation
  const numericNews = parseInt(newsScore, 10);
  const getNewsRiskText = (score: number) => {
    if (isNaN(score)) return { text: 'No score recorded (-)', color: 'text-slate-500' };
    if (score === 0) return { text: 'NEWS 0 - Normal / Low Clinical Risk', color: 'text-emerald-700' };
    if (score >= 1 && score <= 4) return { text: `NEWS ${score} - Low Risk (Ward Monitoring)`, color: 'text-yellow-700' };
    if (score >= 5 && score <= 6) return { text: `NEWS ${score} - Medium Risk (Urgent Review Threshold)`, color: 'text-amber-700' };
    return { text: `NEWS ${score} - HIGH RISK (Emergency / MET Call / SBAR Escalation)`, color: 'text-red-700 font-bold' };
  };

  const newsRisk = getNewsRiskText(numericNews);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
      <div
        className="bg-white rounded-lg shadow-2xl border border-slate-300 w-full max-w-2xl overflow-hidden my-6"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-[#383582] text-white px-5 py-3.5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight">{bedLabel}</span>
              <span className="bg-white/20 text-white text-[11px] font-bold px-2 py-0.5 rounded">
                Admin Editor
              </span>
            </div>
            <p className="text-xs text-purple-200 mt-0.5">
              Simulated bed space & patient clinical status configuration
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white rounded p-1 hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
          {/* Bed Allocation & Bay Assignment Row */}
          <div className="bg-slate-100 p-3 rounded-lg border border-slate-300 space-y-2.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs">
              <LayoutGrid className="w-4 h-4 text-purple-800" />
              <span>Bed Space & Bay Allocation</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Bed Identifier / Label
                </label>
                <input
                  type="text"
                  value={bedLabel}
                  onChange={(e) => setBedLabel(e.target.value)}
                  placeholder="e.g. Bed 01, Side Room 01"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs font-bold font-mono focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Assigned Bay Column
                </label>
                <select
                  value={bayId}
                  onChange={(e) => setBayId(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  {bays.map((bay) => (
                    <option key={bay.id} value={bay.id}>
                      {bay.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center pt-5">
                <label className="flex items-center gap-1.5 text-xs text-slate-800 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isSideRoom}
                    onChange={(e) => setIsSideRoom(e.target.checked)}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                  />
                  <span>Is Side Room</span>
                </label>
              </div>
            </div>
          </div>

          {/* Bed Status Radio Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Bed Space Status
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setStatus('occupied')}
                className={`py-2 px-3 rounded border text-xs font-bold transition-all text-center ${
                  status === 'occupied'
                    ? 'bg-purple-50 border-purple-600 text-purple-900 ring-2 ring-purple-500/20'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Occupied Patient
              </button>
              <button
                type="button"
                onClick={() => setStatus('closed')}
                className={`py-2 px-3 rounded border text-xs font-bold transition-all text-center ${
                  status === 'closed'
                    ? 'bg-slate-800 border-slate-900 text-white ring-2 ring-slate-700/40'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Closed Bed (e.g. Endoscopy)
              </button>
              <button
                type="button"
                onClick={() => setStatus('vacant')}
                className={`py-2 px-3 rounded border text-xs font-bold transition-all text-center ${
                  status === 'vacant'
                    ? 'bg-amber-50 border-amber-600 text-amber-900 ring-2 ring-amber-500/20'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Vacant / Discharged
              </button>
            </div>
          </div>

          {/* Conditional 1: OCCUPIED FIELDS */}
          {status === 'occupied' && (
            <div className="space-y-3.5 pt-1">
              {/* Patient Name & Gender */}
              <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">
                    Patient Simulated Name & Gender
                  </label>
                  <button
                    type="button"
                    onClick={generateAnonymousName}
                    className="flex items-center gap-1 text-[11px] text-purple-700 hover:text-purple-900 font-semibold"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Auto-generate Simulated Tag</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value.toUpperCase())}
                      placeholder="e.g. SIM PATIENT 01"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs font-bold font-mono focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      Tip: Keep names as safe placeholders (e.g. SIM PATIENT 12 or PATIENT 12).
                    </p>
                  </div>

                  {/* Gender Selector */}
                  <div className="flex items-center gap-1 bg-white p-1 rounded border border-slate-300">
                    {(['M', 'F', 'O'] as PatientGender[]).map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setPatientGender(g)}
                        className={`flex-1 py-1 text-center font-bold text-xs rounded transition-colors ${
                          patientGender === g
                            ? 'bg-purple-700 text-white'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {g === 'M' ? 'M' : g === 'F' ? 'F' : 'Other'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Service & Destination */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Where they are (Service) */}
                <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="font-bold text-slate-800">
                      Where they are (Service)
                    </label>
                    <ServiceBadge service={service} />
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {COMMON_SERVICES.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setService(s)}
                        className={`px-2 py-1 text-xs font-bold rounded border ${
                          service === s
                            ? 'bg-purple-700 text-white border-purple-800'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={service}
                    onChange={(e) => setService(e.target.value.toUpperCase())}
                    placeholder="Or enter custom service..."
                    className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded font-semibold focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                  <p className="text-[10px] text-slate-500">
                    OPS = Old People's Services, EACM, T.B.T., CARD = Cardiology, GMG
                  </p>
                </div>

                {/* Where they are going (Destination) */}
                <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="font-bold text-slate-800">
                      Where they are going (Destination)
                    </label>
                    <DestinationBadge destination={destination} />
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {COMMON_DESTINATIONS.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDestination(d)}
                        className={`px-2 py-1 text-xs font-bold rounded border ${
                          destination === d
                            ? 'bg-slate-800 text-white border-slate-900'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value.toUpperCase())}
                    placeholder="Or enter custom destination..."
                    className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded font-semibold focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                  <p className="text-[10px] text-slate-500">
                    DIS = Discharge, RBOPS1 / RBOPS4 = Base Wards, HOME, REHAB
                  </p>
                </div>
              </div>

              {/* NEWS Score & Clinical Risk */}
              <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-2">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-slate-800">
                    NEWS Score (Middle Bottom Number)
                  </label>
                  <span className={`text-[11px] font-semibold ${newsRisk.color}`}>
                    {newsRisk.text}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={newsScore}
                    onChange={(e) => setNewsScore(e.target.value)}
                    placeholder="Score (0-20)"
                    className="w-28 px-3 py-1.5 border border-slate-300 rounded text-sm font-bold font-mono text-center focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                  <div className="flex flex-wrap gap-1">
                    {[0, 1, 2, 3, 4, 5, 7, 8].map((score) => (
                      <button
                        key={score}
                        type="button"
                        onClick={() => setNewsScore(String(score))}
                        className={`w-7 h-7 flex items-center justify-center rounded text-xs font-bold font-mono border ${
                          newsScore === String(score)
                            ? 'bg-purple-700 text-white border-purple-800'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {score}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setNewsScore('')}
                      className="px-2 py-1 text-xs rounded border border-slate-300 bg-white text-slate-600 hover:bg-slate-100 font-mono"
                    >
                      Clear (-)
                    </button>
                  </div>
                </div>
              </div>

              {/* Patient Specific Info (Bottom Right) */}
              <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-2">
                <label className="font-bold text-slate-800 block">
                  Important Patient Specific Information (Bottom Right)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_FLAGS.map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setPatientInfo(f)}
                      className={`px-2 py-1 text-xs font-bold rounded border ${
                        patientInfo === f
                          ? 'bg-purple-700 text-white border-purple-800'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={patientInfo}
                  onChange={(e) => setPatientInfo(e.target.value)}
                  placeholder="e.g. **, ***, EOL, NR, TEL, *TEL, FALLS"
                  className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded font-semibold focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono"
                />
              </div>

              {/* Infection & Visual Alert Flags */}
              <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-2">
                <label className="font-bold text-slate-800 block">
                  Visual Alert Overlays & Infection Control
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center gap-2.5 p-2 bg-white rounded border border-slate-200 cursor-pointer hover:bg-yellow-50/50">
                    <input
                      type="checkbox"
                      checked={isYellowHighlight}
                      onChange={(e) => setIsYellowHighlight(e.target.checked)}
                      className="w-4 h-4 text-yellow-500 rounded focus:ring-yellow-400"
                    />
                    <div>
                      <span className="font-bold text-slate-800 block">Yellow Highlight Bar</span>
                      <span className="text-[10px] text-slate-500">Infection isolation / special alert</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-2 bg-white rounded border border-slate-200 cursor-pointer hover:bg-emerald-50/50">
                    <input
                      type="checkbox"
                      checked={hasSwabBanner}
                      onChange={(e) => setHasSwabBanner(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                    />
                    <div>
                      <span className="font-bold text-slate-800 block">Green SWAB Banner</span>
                      <span className="text-[10px] text-slate-500">Displays "SWAB" banner beneath name</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Conditional 2: CLOSED BED FIELDS */}
          {status === 'closed' && (
            <div className="bg-slate-800 text-white p-4 rounded space-y-3">
              <h4 className="font-bold text-amber-300 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Closed Bed Configuration</span>
              </h4>
              <div className="space-y-2 text-xs">
                <div>
                  <label className="block text-slate-300 mb-1">Reason for closure / procedure</label>
                  <input
                    type="text"
                    value={closedReason}
                    onChange={(e) => setClosedReason(e.target.value)}
                    placeholder="e.g. Pt in endoscopy, Deep clean"
                    className="w-full px-3 py-1.5 bg-slate-700 text-white rounded border border-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-400 font-medium"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-300 mb-1">Timestamp</label>
                    <input
                      type="text"
                      value={closedTime}
                      onChange={(e) => setClosedTime(e.target.value)}
                      placeholder="09/11 11:59PM"
                      className="w-full px-3 py-1.5 bg-slate-700 text-white rounded border border-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-400 font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1">Status Tag</label>
                    <input
                      type="text"
                      value={closedTag}
                      onChange={(e) => setClosedTag(e.target.value)}
                      placeholder="Closed Beds"
                      className="w-full px-3 py-1.5 bg-slate-700 text-white rounded border border-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-400 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Conditional 3: VACANT BED FIELDS */}
          {status === 'vacant' && (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded text-center space-y-2">
              <p className="text-amber-900 font-bold">This bed space is currently vacant.</p>
              <p className="text-xs text-amber-700">
                To assign a patient, switch status to <strong>Occupied Patient</strong> above.
              </p>
            </div>
          )}

          {/* Quick Actions Strip */}
          <div className="pt-2 border-t border-slate-200 flex flex-wrap gap-2 items-center justify-between">
            <div className="flex items-center gap-2">
              {status === 'occupied' && (
                <button
                  type="button"
                  onClick={handleDischargeVacate}
                  className="px-2.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold rounded text-xs transition-colors"
                >
                  Vacate Bed
                </button>
              )}
              {status !== 'closed' && (
                <button
                  type="button"
                  onClick={handleMarkClosed}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded text-xs transition-colors"
                >
                  Mark Closed
                </button>
              )}
              {onDeleteBed && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-semibold rounded text-xs border border-red-200 transition-colors"
                  title="Remove this bed space from the bay"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Bed</span>
                </button>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#383582] hover:bg-[#2d2a6a] text-white font-bold rounded text-xs transition-colors shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
