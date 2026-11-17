export type RiskTier = 'CRITICAL' | 'HIGH' | 'MODERATE' | 'STABLE';
export type MetricType = 'HEART_RATE' | 'BLOOD_PRESSURE' | 'SPO2' | 'GLUCOSE' | 'TEMPERATURE' | 'COMPOSITE_RISK';
export type AlertSeverity = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
export type AlertStatus = 'ACTIVE' | 'ACKNOWLEDGED' | 'IN_CONSULT' | 'RESOLVED';
export type UserRole = 'DOCTOR' | 'PATIENT' | 'ADMIN';

export interface BaselineParam {
  mean: number;
  std: number;
  minSafe: number;
  maxSafe: number;
  unit: string;
}

export interface PatientBaseline {
  heartRate: BaselineParam;
  systolic: BaselineParam;
  diastolic: BaselineParam;
  spO2: BaselineParam;
  glucose: BaselineParam;
  temperature: BaselineParam;
}

export interface VitalReading {
  timestamp: string;
  heartRate: number;       // bpm
  spO2: number;            // %
  systolic: number;        // mmHg
  diastolic: number;       // mmHg
  glucose: number;          // mg/dL
  temperature: number;      // °C
  source: 'Smart Band' | 'Digital BP Cuff' | 'CGM Sensor' | 'Pulse Oximeter' | 'Simulated IoT Feed' | 'Manual Log';
  batteryLevel?: number;
  signalStrength?: 'STRONG' | 'MEDIUM' | 'WEAK';
  notes?: string;
}

export interface Alert {
  id: string;
  patientId: string;
  patientName: string;
  timestamp: string;
  metric: MetricType;
  severity: AlertSeverity;
  currentVal: string;
  baselineVal: string;
  zScore: number;
  message: string;
  clinicalAdvice: string;
  status: AlertStatus;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}

export interface DeviceStatus {
  id: string;
  type: 'SMART_BAND' | 'BP_CUFF' | 'CGM' | 'PULSE_OXIMETER' | 'GLUCOMETER';
  name: string;
  serialNo: string;
  battery: number;
  isConnected: boolean;
  lastSync: string;
  firmware: string;
}

export interface ConsentRecord {
  consentId: string;
  abhaAddress: string;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
  grantedDate: string;
  expiryDate: string;
  dataTypesConsented: string[];
  purpose: string;
  hospitalPartner: string;
  dataEncrypted: boolean;
  encryptionProtocol: string;
  auditLedgerHash: string;
}

export interface MedicationItem {
  id: string;
  name: string;
  dosage: string;
  frequency: string;      // e.g. "1-0-1 (After Meals)"
  duration: string;       // e.g. "30 Days"
  instructions: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  doctorName: string;
  doctorRegistration: string;
  hospitalName: string;
  date: string;
  diagnosis: string;
  vitalsSnapshot: {
    bp: string;
    hr: number;
    spo2: number;
    glucose: number;
    temp: number;
  };
  medications: MedicationItem[];
  dietaryAdvice: string;
  lifestyleAdvice: string;
  nextReviewDate: string;
  signedDigitalHash: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userRole: UserRole | 'SYSTEM_AI';
  actorName: string;
  action: string;
  targetPatientId: string;
  details: string;
  hash: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  email: string;
  abhaId: string;          // Ayushman Bharat Health Account ID
  address: string;
  district: string;
  state: string;
  pinCode: string;
  avatarUrl?: string;

  // Clinical profile
  primaryDiagnosis: string;
  secondaryConditions: string[];
  allergies: string[];
  bloodGroup: string;
  primaryDoctor: string;
  monitoringSince: string;

  // Dynamic Triage Risk
  riskScore: number;       // 0 - 100
  riskTier: RiskTier;
  riskTrend: 'RISING' | 'STABLE' | 'IMPROVING';
  riskExplanation: string;

  // Baseline Model
  baseline: PatientBaseline;

  // Real-time telemetry
  currentVitals: VitalReading;
  vitalsHistory: VitalReading[];

  // Connected peripherals
  devices: DeviceStatus[];

  // Security & Legal
  consent: ConsentRecord;

  // Emergency contact
  emergencyContact: {
    name: string;
    relation: string;
    phone: string;
  };

  // Consultations & alerts
  activeAlerts: Alert[];
  prescriptions: Prescription[];
}
