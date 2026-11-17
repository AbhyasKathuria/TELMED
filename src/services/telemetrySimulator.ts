import type { Patient, VitalReading } from '../types';
import { evaluateVitals } from './baselineModel';

export type SimulationScenario =
  | 'NORMAL_CIRCADIAN'
  | 'HYPERTENSIVE_CRISIS'
  | 'HYPERGLYCEMIC_SPIKE'
  | 'HYPOGLYCEMIC_CRASH'
  | 'RESPIRATORY_DESATURATION'
  | 'TACHYCARDIA_ARRHYTHMIA';

/**
 * Generates the next realistic vital reading based on current scenario
 */
export function generateNextReading(
  patient: Patient,
  scenario: SimulationScenario = 'NORMAL_CIRCADIAN'
): VitalReading {
  const current = patient.currentVitals;
  const base = patient.baseline;
  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

  let hr = current.heartRate;
  let spo2 = current.spO2;
  let sys = current.systolic;
  let dia = current.diastolic;
  let glu = current.glucose;
  let temp = current.temperature;

  // Small organic jitter around current values
  hr += Math.round(Math.random() * 2 - 1);
  spo2 += parseFloat((Math.random() * 0.4 - 0.2).toFixed(1));
  sys += Math.round(Math.random() * 2 - 1);
  dia += Math.round(Math.random() * 2 - 1);
  glu += Math.round(Math.random() * 4 - 2);
  temp += parseFloat((Math.random() * 0.1 - 0.05).toFixed(1));

  // Apply Scenario-specific drift
  switch (scenario) {
    case 'HYPERTENSIVE_CRISIS':
      sys = Math.min(195, sys + 6 + Math.round(Math.random() * 3));
      dia = Math.min(115, dia + 3 + Math.round(Math.random() * 2));
      hr = Math.min(115, hr + 2);
      break;

    case 'HYPERGLYCEMIC_SPIKE':
      glu = Math.min(360, glu + 18 + Math.round(Math.random() * 8));
      break;

    case 'HYPOGLYCEMIC_CRASH':
      glu = Math.max(48, glu - 14 - Math.round(Math.random() * 6));
      hr = Math.min(110, hr + 3);
      break;

    case 'RESPIRATORY_DESATURATION':
      spo2 = Math.max(84, spo2 - 1.2 - Math.random() * 0.5);
      hr = Math.min(125, hr + 4);
      break;

    case 'TACHYCARDIA_ARRHYTHMIA':
      hr = Math.min(145, hr + 8 + Math.round(Math.random() * 6));
      sys = Math.max(105, sys - 3);
      break;

    case 'NORMAL_CIRCADIAN':
    default:
      sys += Math.round((base.systolic.mean - sys) * 0.15);
      dia += Math.round((base.diastolic.mean - dia) * 0.15);
      hr += Math.round((base.heartRate.mean - hr) * 0.15);
      spo2 += parseFloat(((base.spO2.mean - spo2) * 0.15).toFixed(1));
      glu += Math.round((base.glucose.mean - glu) * 0.15);
      temp += parseFloat(((base.temperature.mean - temp) * 0.15).toFixed(1));
      break;
  }

  hr = Math.min(160, Math.max(40, hr));
  spo2 = Math.min(100, Math.max(78, parseFloat(spo2.toFixed(1))));
  sys = Math.min(220, Math.max(80, sys));
  dia = Math.min(130, Math.max(50, dia));
  glu = Math.min(450, Math.max(45, glu));
  temp = Math.min(41.0, Math.max(35.5, parseFloat(temp.toFixed(1))));

  return {
    timestamp: timeStr,
    heartRate: hr,
    spO2: spo2,
    systolic: sys,
    diastolic: dia,
    glucose: glu,
    temperature: temp,
    source: 'Simulated IoT Feed',
    batteryLevel: Math.max(15, (current.batteryLevel || 80) - 1),
    signalStrength: 'STRONG'
  };
}

/**
 * Updates patient state by appending reading and running baseline evaluation
 */
export function processIncomingReading(
  patient: Patient,
  reading: VitalReading
): Patient {
  const evalResult = evaluateVitals(patient, reading);

  const updatedHistory = [...patient.vitalsHistory.slice(-29), reading];

  const existingAlertIds = new Set(patient.activeAlerts.map(a => `${a.metric}-${a.severity}`));
  const newUniqueAlerts = evalResult.alerts.filter(
    a => !existingAlertIds.has(`${a.metric}-${a.severity}`)
  );

  const mergedAlerts = [...newUniqueAlerts, ...patient.activeAlerts].slice(0, 8);

  return {
    ...patient,
    currentVitals: reading,
    vitalsHistory: updatedHistory,
    riskScore: evalResult.compositeRiskScore,
    riskTier: evalResult.riskTier,
    riskTrend: evalResult.riskTrend,
    riskExplanation: evalResult.riskExplanation,
    activeAlerts: mergedAlerts
  };
}
