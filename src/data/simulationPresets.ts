import { DEFAULT_WARD_STATE } from './defaultWardData';
import { WardSimulationState } from '../types';

export interface ScenarioPreset {
  id: string;
  name: string;
  badge: string;
  description: string;
  getState: () => WardSimulationState;
}

export const SCENARIO_PRESETS: ScenarioPreset[] = [
  {
    id: 'baseline-opau',
    name: 'Standard OPAU Baseline (From Real Board)',
    badge: 'Standard',
    description: '42/43 occupancy, 1 bed closed for endoscopy, standard mix of OPS, EACM, T.B.T., CARD, and GMG.',
    getState: () => JSON.parse(JSON.stringify(DEFAULT_WARD_STATE)),
  },
  {
    id: 'deteriorating-patient-drill',
    name: 'Rapid Deterioration & Escalation Drill',
    badge: 'Critical Care / MET Drill',
    description: '3 patients with severe NEWS spikes (NEWS 7, 8, 9) requiring immediate clinical review, SBAR handover, and critical care outreach.',
    getState: () => {
      const state: WardSimulationState = JSON.parse(JSON.stringify(DEFAULT_WARD_STATE));
      // Increase NEWS for specific beds
      const b1Bed03 = state.beds.find((b) => b.id === 'b1-bed03');
      if (b1Bed03) {
        b1Bed03.newsScore = 7;
        b1Bed03.patientInfo = 'SEPSIS ALERT';
        b1Bed03.isYellowHighlight = true;
      }
      const b3Bed01 = state.beds.find((b) => b.id === 'b3-bed01');
      if (b3Bed01) {
        b3Bed01.newsScore = 9;
        b3Bed01.patientInfo = 'MET CALLED';
      }
      const b6Bed05 = state.beds.find((b) => b.id === 'b6-bed05');
      if (b6Bed05) {
        b6Bed05.newsScore = 8;
        b6Bed05.patientInfo = 'O2 ESCALATED';
      }
      state.metadata = { scenarioName: 'Rapid Deterioration & Escalation Drill' };
      return state;
    },
  },
  {
    id: 'discharge-flow-drill',
    name: 'Discharge Lounge & Flow Pressure Drill',
    badge: 'Flow & Bed Capacity',
    description: '12 patients marked DIS awaiting medications or transport, with ED hold surge needing admissions.',
    getState: () => {
      const state: WardSimulationState = JSON.parse(JSON.stringify(DEFAULT_WARD_STATE));
      const disIds = ['b1-bed01', 'b1-bed04', 'b2-bed03', 'b2-bed04', 'b3-bed02', 'b3-bed04', 'b3-bed05', 'b5-bed01', 'b5-bed04', 'b6-bed01', 'b6-bed03', 'b6-bed05'];
      state.beds.forEach((b) => {
        if (disIds.includes(b.id)) {
          b.destination = 'DIS';
          b.patientInfo = 'TTO AWAITED';
        }
      });
      state.metadata = { scenarioName: 'Discharge Flow Drill' };
      return state;
    },
  },
  {
    id: 'infection-control-outbreak',
    name: 'Infection Control & Cohorting Drill',
    badge: 'Infection Prevention',
    description: 'Norovirus / Flu outbreak requiring side room isolation, swab tracking, and closed bed management.',
    getState: () => {
      const state: WardSimulationState = JSON.parse(JSON.stringify(DEFAULT_WARD_STATE));
      state.beds.forEach((b) => {
        if (b.isSideRoom) {
          b.hasSwabBanner = true;
          b.isYellowHighlight = true;
          b.patientInfo = 'ISOLATION';
        }
      });
      const b2Bed06 = state.beds.find((b) => b.id === 'b2-bed06');
      if (b2Bed06) {
        b2Bed06.status = 'closed';
        b2Bed06.patient = null;
        b2Bed06.closedDetails = {
          reason: 'Deep clean pending',
          timestamp: '10/11 08:30AM',
          tag: 'Closed Beds',
        };
      }
      state.metadata = { scenarioName: 'Infection Control Outbreak Drill' };
      return state;
    },
  },
];
