import type { Patient, VitalReading, Alert, AlertSeverity, RiskTier } from '../types';

export interface EvaluationResult {
  alerts: Alert[];
  compositeRiskScore: number;
  riskTier: RiskTier;
  riskTrend: 'RISING' | 'STABLE' | 'IMPROVING';
  riskExplanation: string;
}

/**
 * Calculates Z-Score based on personalized patient baseline
 */
function calculateZScore(value: number, mean: number, std: number): number {
  if (std <= 0) return 0;
  return parseFloat(((value - mean) / std).toFixed(2));
}

/**
 * Checks for directional trend across the last N readings
 */
function checkTrend(readings: number[], minPoints = 4): 'RISING' | 'FALLING' | 'STABLE' {
  if (readings.length < minPoints) return 'STABLE';
  const slice = readings.slice(-minPoints);
  let risingCount = 0;
  let fallingCount = 0;

  for (let i = 1; i < slice.length; i++) {
    const diff = slice[i] - slice[i - 1];
    if (diff > 1.5) risingCount++;
    else if (diff < -1.5) fallingCount++;
  }

  if (risingCount >= minPoints - 1) return 'RISING';
  if (fallingCount >= minPoints - 1) return 'FALLING';
  return 'STABLE';
}

/**
 * Evaluates patient's latest vitals against their personalized baseline
 * Reduces false alarms by respecting individual physiological norms while
 * detecting subtle deteriorating trends.
 */
export function evaluateVitals(patient: Patient, reading: VitalReading): EvaluationResult {
  const alerts: Alert[] = [];
  const b = patient.baseline;
  const history = [...patient.vitalsHistory, reading];
  const now = reading.timestamp;

  // 1. Systolic Blood Pressure Evaluation
  const sysZ = calculateZScore(reading.systolic, b.systolic.mean, b.systolic.std);
  const recentSys = history.slice(-5).map(v => v.systolic);
  const sysTrend = checkTrend(recentSys);

  if (reading.systolic >= 180 || reading.diastolic >= 110) {
    alerts.push({
      id: `alert-bp-crit-${Date.now()}`,
      patientId: patient.id,
      patientName: patient.name,
      timestamp: now,
      metric: 'BLOOD_PRESSURE',
      severity: 'CRITICAL',
      currentVal: `${reading.systolic}/${reading.diastolic} mmHg`,
      baselineVal: `${b.systolic.mean}/${b.diastolic.mean} mmHg (±${b.systolic.std})`,
      zScore: sysZ,
      message: `Hypertensive Urgency/Crisis detected (${reading.systolic}/${reading.diastolic} mmHg)`,
      clinicalAdvice: 'Immediate teleconsultation or emergency referral required. Assess for end-organ symptoms.',
      status: 'ACTIVE'
    });
  } else if (sysZ >= 2.5 || (sysZ >= 1.8 && sysTrend === 'RISING')) {
    const severity: AlertSeverity = sysZ >= 3.0 ? 'HIGH' : 'MODERATE';
    alerts.push({
      id: `alert-bp-${Date.now()}`,
      patientId: patient.id,
      patientName: patient.name,
      timestamp: now,
      metric: 'BLOOD_PRESSURE',
      severity,
      currentVal: `${reading.systolic}/${reading.diastolic} mmHg`,
      baselineVal: `${b.systolic.mean}/${b.diastolic.mean} mmHg (±${b.systolic.std})`,
      zScore: sysZ,
      message: `Personalized BP elevation (${reading.systolic} mmHg is +${sysZ}σ above baseline)${sysTrend === 'RISING' ? ' with 48h rising trend' : ''}`,
      clinicalAdvice: 'Review anti-hypertensive adherence and sodium intake. Schedule proactive video consult.',
      status: 'ACTIVE'
    });
  }

  // 2. Heart Rate Evaluation
  const hrZ = calculateZScore(reading.heartRate, b.heartRate.mean, b.heartRate.std);
  if (reading.heartRate > 125 || reading.heartRate < 45) {
    alerts.push({
      id: `alert-hr-crit-${Date.now()}`,
      patientId: patient.id,
      patientName: patient.name,
      timestamp: now,
      metric: 'HEART_RATE',
      severity: 'CRITICAL',
      currentVal: `${reading.heartRate} bpm`,
      baselineVal: `${b.heartRate.mean} bpm (±${b.heartRate.std})`,
      zScore: hrZ,
      message: `Marked ${reading.heartRate > 125 ? 'Tachycardia' : 'Bradycardia'} (${reading.heartRate} bpm)`,
      clinicalAdvice: 'Check for arrhythmia, palpitations, dizziness, or medication interaction.',
      status: 'ACTIVE'
    });
  } else if (Math.abs(hrZ) >= 2.2) {
    alerts.push({
      id: `alert-hr-${Date.now()}`,
      patientId: patient.id,
      patientName: patient.name,
      timestamp: now,
      metric: 'HEART_RATE',
      severity: 'MODERATE',
      currentVal: `${reading.heartRate} bpm`,
      baselineVal: `${b.heartRate.mean} bpm (±${b.heartRate.std})`,
      zScore: hrZ,
      message: `Heart rate deviation of ${hrZ > 0 ? '+' : ''}${hrZ}σ from patient baseline`,
      clinicalAdvice: 'Inquire about recent exertion, caffeine, anxiety, or missed beta-blockers.',
      status: 'ACTIVE'
    });
  }

  // 3. SpO2 Oxygen Saturation Evaluation
  const spo2Z = calculateZScore(reading.spO2, b.spO2.mean, b.spO2.std);
  if (reading.spO2 < 90) {
    alerts.push({
      id: `alert-spo2-crit-${Date.now()}`,
      patientId: patient.id,
      patientName: patient.name,
      timestamp: now,
      metric: 'SPO2',
      severity: 'CRITICAL',
      currentVal: `${reading.spO2}%`,
      baselineVal: `${b.spO2.mean}% (±${b.spO2.std})`,
      zScore: spo2Z,
      message: `Severe Hypoxemia detected (${reading.spO2}%)`,
      clinicalAdvice: 'Emergency oxygen protocol, immediate teleconsultation and respiratory assessment.',
      status: 'ACTIVE'
    });
  } else if (reading.spO2 <= 93 || (reading.spO2 < b.spO2.minSafe && spo2Z <= -2.0)) {
    alerts.push({
      id: `alert-spo2-${Date.now()}`,
      patientId: patient.id,
      patientName: patient.name,
      timestamp: now,
      metric: 'SPO2',
      severity: 'HIGH',
      currentVal: `${reading.spO2}%`,
      baselineVal: `${b.spO2.mean}% (±${b.spO2.std})`,
      zScore: spo2Z,
      message: `Oxygen saturation drop below personal safe baseline (${reading.spO2}%, baseline: ${b.spO2.mean}%)`,
      clinicalAdvice: 'Check probe placement. Assess for dyspnea, wheezing, or COPD exacerbation.',
      status: 'ACTIVE'
    });
  }

  // 4. Blood Glucose Evaluation
  const gluZ = calculateZScore(reading.glucose, b.glucose.mean, b.glucose.std);
  if (reading.glucose < 65) {
    alerts.push({
      id: `alert-glu-crit-${Date.now()}`,
      patientId: patient.id,
      patientName: patient.name,
      timestamp: now,
      metric: 'GLUCOSE',
      severity: 'CRITICAL',
      currentVal: `${reading.glucose} mg/dL`,
      baselineVal: `${b.glucose.mean} mg/dL`,
      zScore: gluZ,
      message: `Acute Hypoglycemia Alert (${reading.glucose} mg/dL)`,
      clinicalAdvice: 'Rule of 15: Ingest 15g fast-acting carbs (glucose tablets, juice) immediately. Retest in 15 min.',
      status: 'ACTIVE'
    });
  } else if (reading.glucose >= 280) {
    alerts.push({
      id: `alert-glu-high-${Date.now()}`,
      patientId: patient.id,
      patientName: patient.name,
      timestamp: now,
      metric: 'GLUCOSE',
      severity: 'HIGH',
      currentVal: `${reading.glucose} mg/dL`,
      baselineVal: `${b.glucose.mean} mg/dL (±${b.glucose.std})`,
      zScore: gluZ,
      message: `Severe Hyperglycemic spike (${reading.glucose} mg/dL, z=+${gluZ}σ)`,
      clinicalAdvice: 'Check for ketone symptoms, hydration status, and insulin adherence.',
      status: 'ACTIVE'
    });
  } else if (gluZ >= 2.5) {
    alerts.push({
      id: `alert-glu-mod-${Date.now()}`,
      patientId: patient.id,
      patientName: patient.name,
      timestamp: now,
      metric: 'GLUCOSE',
      severity: 'MODERATE',
      currentVal: `${reading.glucose} mg/dL`,
      baselineVal: `${b.glucose.mean} mg/dL (±${b.glucose.std})`,
      zScore: gluZ,
      message: `Glucose elevated significantly above personal post-meal baseline (${reading.glucose} mg/dL)`,
      clinicalAdvice: 'Advise light walk, adequate hydration, log meal contents in patient diary.',
      status: 'ACTIVE'
    });
  }

  // 5. Body Temperature & Composite Sepsis/Infection Check
  const tempZ = calculateZScore(reading.temperature, b.temperature.mean, b.temperature.std);
  if (reading.temperature >= 38.5) {
    const isSepticRisk = reading.heartRate > 100 && reading.spO2 < 95;
    alerts.push({
      id: `alert-temp-${Date.now()}`,
      patientId: patient.id,
      patientName: patient.name,
      timestamp: now,
      metric: 'TEMPERATURE',
      severity: isSepticRisk ? 'CRITICAL' : 'HIGH',
      currentVal: `${reading.temperature} °C`,
      baselineVal: `${b.temperature.mean} °C (±${b.temperature.std})`,
      zScore: tempZ,
      message: isSepticRisk
        ? `High fever (${reading.temperature}°C) coupled with tachycardia and mild desaturation (Sepsis warning)`
        : `Pyrexia / Elevated Temperature (${reading.temperature} °C, +${tempZ}σ above baseline)`,
      clinicalAdvice: isSepticRisk
        ? 'Urgent clinical evaluation required to rule out acute systemic infection.'
        : 'Encourage fluid intake, monitor for chills, check temperature every 2 hours.',
      status: 'ACTIVE'
    });
  }

  // 6. Calculate Composite Risk Score (0 - 100)
  let riskScore = 15;

  if (reading.systolic >= 180) riskScore += 45;
  else if (sysZ >= 3.0) riskScore += 30;
  else if (sysZ >= 2.0) riskScore += 18;
  else if (sysTrend === 'RISING') riskScore += 10;

  if (reading.spO2 < 90) riskScore += 50;
  else if (reading.spO2 < 94) riskScore += 30;
  else if (reading.spO2 < 96) riskScore += 12;

  if (reading.heartRate > 120 || reading.heartRate < 45) riskScore += 35;
  else if (Math.abs(hrZ) >= 2.5) riskScore += 18;
  else if (Math.abs(hrZ) >= 1.8) riskScore += 8;

  if (reading.glucose < 65 || reading.glucose > 300) riskScore += 40;
  else if (gluZ >= 2.5) riskScore += 18;
  else if (gluZ >= 1.8) riskScore += 8;

  if (reading.temperature >= 38.5) riskScore += 20;

  if (patient.primaryDiagnosis.toLowerCase().includes('heart') && (reading.heartRate > 105 || reading.spO2 < 94)) {
    riskScore += 15;
  }
  if (patient.primaryDiagnosis.toLowerCase().includes('diabetes') && reading.glucose > 220) {
    riskScore += 10;
  }

  riskScore = Math.min(100, Math.max(5, Math.round(riskScore)));

  let riskTier: RiskTier = 'STABLE';
  if (riskScore >= 75 || alerts.some(a => a.severity === 'CRITICAL')) {
    riskTier = 'CRITICAL';
  } else if (riskScore >= 55 || alerts.some(a => a.severity === 'HIGH')) {
    riskTier = 'HIGH';
  } else if (riskScore >= 35 || alerts.some(a => a.severity === 'MODERATE')) {
    riskTier = 'MODERATE';
  }

  const prevScore = patient.riskScore || 20;
  const riskTrend = riskScore > prevScore + 5 ? 'RISING' : riskScore < prevScore - 5 ? 'IMPROVING' : 'STABLE';

  let riskExplanation = 'All monitored parameters are within the patient’s personalized baseline ranges.';
  if (alerts.length > 0) {
    riskExplanation = `${alerts.length} active parameter deviation(s): ${alerts.map(a => a.message).join('; ')}`;
  } else if (sysTrend === 'RISING') {
    riskExplanation = 'Gradual upward blood pressure trend detected across last 48 hours; monitoring closely.';
  }

  return {
    alerts,
    compositeRiskScore: riskScore,
    riskTier,
    riskTrend,
    riskExplanation,
  };
}
