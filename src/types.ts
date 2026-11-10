/**
 * Types for OPAU Health of the Ward Simulation
 */

export type ServiceCode = 'OPS' | 'EACM' | 'T.B.T.' | 'CARD' | 'GMG' | string;

export type DestinationCode = 'DIS' | 'RBOPS1' | 'RBOPS4' | 'HOME' | 'REHAB' | 'AMU' | '-' | string;

export type PatientGender = 'M' | 'F' | 'O' | '';

export interface Patient {
  id: string;
  name: string;
  gender: PatientGender;
  age?: number;
}

export type BedStatus = 'occupied' | 'vacant' | 'closed';

export interface ClosedDetails {
  reason: string;
  timestamp: string;
  tag?: string;
}

export interface BedSpace {
  id: string;
  bayId: string;
  bayName: string;
  bedLabel: string;
  isSideRoom: boolean;
  status: BedStatus;
  patient: Patient | null;
  service: ServiceCode;
  destination: DestinationCode;
  newsScore: number | null; // null represents '-'
  patientInfo: string; // e.g. '.', '-', '**', '***', 'EOL', 'NR', 'TEL', '*TEL'
  isYellowHighlight: boolean;
  hasSwabBanner: boolean;
  closedDetails?: ClosedDetails;
  notes?: string;
}

export interface WardBay {
  id: string;
  name: string;
  order: number;
}

export interface WardSimulationState {
  version: string;
  hospitalName: string;
  unitName: string;
  simulationNotice: string;
  lastRefreshed: string;
  refreshIntervalSeconds: number;
  bays: WardBay[];
  beds: BedSpace[];
  metadata?: {
    exportedAt?: string;
    scenarioName?: string;
    description?: string;
  };
}
