import { WardSimulationState } from '../types';
import { DEFAULT_WARD_STATE } from '../data/defaultWardData';

const STORAGE_KEY = 'opau_health_of_ward_simulation_state_v1';
const ADMIN_SESSION_KEY = 'opau_admin_authenticated';

export function loadWardState(): WardSimulationState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_WARD_STATE;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.beds) || !Array.isArray(parsed.bays)) {
      return DEFAULT_WARD_STATE;
    }
    return parsed;
  } catch (err) {
    console.error('Failed to load ward state from localStorage:', err);
    return DEFAULT_WARD_STATE;
  }
}

export function saveWardState(state: WardSimulationState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save ward state to localStorage:', err);
  }
}

export function resetWardState(): WardSimulationState {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Error resetting ward state:', err);
  }
  return DEFAULT_WARD_STATE;
}

export function getAdminSession(): boolean {
  try {
    return sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setAdminSession(active: boolean): void {
  try {
    if (active) {
      sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
    } else {
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
    }
  } catch {
    // Ignore storage issues
  }
}

export function exportWardToJson(state: WardSimulationState): void {
  const exportPayload: WardSimulationState = {
    ...state,
    metadata: {
      ...state.metadata,
      exportedAt: new Date().toISOString(),
      scenarioName: state.metadata?.scenarioName || 'OPAU Ward Simulation',
    },
  };

  const jsonStr = JSON.stringify(exportPayload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const timeStr = `${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;
  a.href = url;
  a.download = `OPAU_Health_Of_Ward_Simulation_${dateStr}_${timeStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function validateWardJson(jsonObj: any): { valid: boolean; error?: string; state?: WardSimulationState } {
  if (!jsonObj || typeof jsonObj !== 'object') {
    return { valid: false, error: 'File content is not a valid JSON object.' };
  }
  if (!Array.isArray(jsonObj.beds)) {
    return { valid: false, error: 'Missing required "beds" array in the simulation data.' };
  }
  if (!Array.isArray(jsonObj.bays)) {
    return { valid: false, error: 'Missing required "bays" array in the simulation data.' };
  }
  if (jsonObj.beds.length === 0) {
    return { valid: false, error: 'The beds array is empty.' };
  }

  // Ensure mandatory fields exist
  const normalizedState: WardSimulationState = {
    version: jsonObj.version || '1.0.0',
    hospitalName: jsonObj.hospitalName || 'Royal Bournemouth Hospital',
    unitName: jsonObj.unitName || 'Older Persons Admissions Unit',
    simulationNotice: jsonObj.simulationNotice || 'SIMULATION ONLY — NOT FOR REAL CLINICAL CARE',
    lastRefreshed: jsonObj.lastRefreshed || new Date().toLocaleString(),
    refreshIntervalSeconds: jsonObj.refreshIntervalSeconds || 115,
    bays: jsonObj.bays,
    beds: jsonObj.beds.map((b: any, index: number) => ({
      id: b.id || `bed-${index}`,
      bayId: b.bayId || 'bay-01',
      bayName: b.bayName || 'Bay 01',
      bedLabel: b.bedLabel || `Bed ${index + 1}`,
      isSideRoom: Boolean(b.isSideRoom),
      status: b.status || (b.closedDetails ? 'closed' : b.patient ? 'occupied' : 'vacant'),
      patient: b.patient || null,
      service: b.service || '',
      destination: b.destination || '-',
      newsScore: typeof b.newsScore === 'number' ? b.newsScore : null,
      patientInfo: b.patientInfo ?? '.',
      isYellowHighlight: Boolean(b.isYellowHighlight),
      hasSwabBanner: Boolean(b.hasSwabBanner),
      closedDetails: b.closedDetails,
      notes: b.notes || '',
    })),
    metadata: jsonObj.metadata,
  };

  return { valid: true, state: normalizedState };
}
