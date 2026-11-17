import type { Patient, VitalReading, AuditLogEntry } from '../types';

/**
 * Generates realistic historical vitals for a patient over the past 24 hours
 */
function generateHistoricalVitals(
  baseSys: number,
  baseDia: number,
  baseHr: number,
  baseSpo2: number,
  baseGlu: number,
  baseTemp: number,
  trendType: 'RISING_BP' | 'GLUCOSE_SPIKE' | 'SPO2_DROP' | 'STABLE' | 'HYPOGLYCEMIA'
): VitalReading[] {
  const readings: VitalReading[] = [];
  const now = new Date();
  const totalPoints = 20;

  for (let i = totalPoints - 1; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 45 * 60 * 1000);
    const timeStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

    let sys = baseSys + (Math.random() * 6 - 3);
    let dia = baseDia + (Math.random() * 4 - 2);
    let hr = baseHr + (Math.random() * 6 - 3);
    let spo2 = baseSpo2 + (Math.random() * 1.5 - 0.7);
    let glu = baseGlu + (Math.random() * 10 - 5);
    let temp = baseTemp + (Math.random() * 0.3 - 0.15);

    const recentIndex = totalPoints - 1 - i;
    if (trendType === 'RISING_BP' && recentIndex >= 14) {
      const step = recentIndex - 13;
      sys += step * 7;
      dia += step * 3.5;
      hr += step * 2;
    } else if (trendType === 'GLUCOSE_SPIKE' && recentIndex >= 15) {
      const step = recentIndex - 14;
      glu += step * 28;
    } else if (trendType === 'SPO2_DROP' && recentIndex >= 14) {
      const step = recentIndex - 13;
      spo2 -= step * 1.5;
      hr += step * 5;
      temp += step * 0.25;
    } else if (trendType === 'HYPOGLYCEMIA' && recentIndex >= 16) {
      const step = recentIndex - 15;
      glu -= step * 16;
      hr += step * 4;
    }

    readings.push({
      timestamp: timeStr,
      heartRate: Math.round(hr),
      spO2: Math.min(100, Math.max(75, parseFloat(spo2.toFixed(1)))),
      systolic: Math.round(sys),
      diastolic: Math.round(dia),
      glucose: Math.round(glu),
      temperature: parseFloat(temp.toFixed(1)),
      source: 'Simulated IoT Feed',
      batteryLevel: Math.max(20, 95 - i),
      signalStrength: 'STRONG'
    });
  }

  return readings;
}

export const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'pat-001',
    name: 'Rameshwar Patel',
    age: 64,
    gender: 'Male',
    phone: '+91 98230 44102',
    email: 'rameshwar.p@example.com',
    abhaId: '91-4521-8890-1204',
    address: 'Plot 42, Kisan Nagar, Mohol Road',
    district: 'Solapur',
    state: 'Maharashtra',
    pinCode: '413002',
    primaryDiagnosis: 'Essential Hypertension (Stage 2)',
    secondaryConditions: ['Coronary Artery Disease', 'Mild Dyslipidemia'],
    allergies: ['Penicillin', 'Sulfa Drugs'],
    bloodGroup: 'B+',
    primaryDoctor: 'Dr. Vikram Malhotra (Cardiologist)',
    monitoringSince: '14 Oct 2025',
    riskScore: 84,
    riskTier: 'CRITICAL',
    riskTrend: 'RISING',
    riskExplanation: 'Systolic blood pressure surged from 128 to 168 mmHg over 6 hours (+3.8σ deviation). Hypertensive urgency protocol triggered.',
    baseline: {
      heartRate: { mean: 72, std: 6, minSafe: 55, maxSafe: 95, unit: 'bpm' },
      systolic: { mean: 124, std: 7, minSafe: 105, maxSafe: 140, unit: 'mmHg' },
      diastolic: { mean: 78, std: 5, minSafe: 65, maxSafe: 88, unit: 'mmHg' },
      spO2: { mean: 97.5, std: 1.0, minSafe: 94, maxSafe: 100, unit: '%' },
      glucose: { mean: 110, std: 12, minSafe: 70, maxSafe: 140, unit: 'mg/dL' },
      temperature: { mean: 36.6, std: 0.3, minSafe: 36.0, maxSafe: 37.4, unit: '°C' }
    },
    currentVitals: {
      timestamp: 'Just now',
      heartRate: 88,
      spO2: 97,
      systolic: 168,
      diastolic: 98,
      glucose: 122,
      temperature: 36.7,
      source: 'Digital BP Cuff',
      batteryLevel: 82,
      signalStrength: 'STRONG'
    },
    vitalsHistory: generateHistoricalVitals(124, 78, 72, 97.5, 110, 36.6, 'RISING_BP'),
    devices: [
      { id: 'dev-01', type: 'BP_CUFF', name: 'Omron Connect Smart BP Cuff', serialNo: 'OMR-IN-88912', battery: 82, isConnected: true, lastSync: '2 min ago', firmware: 'v2.4.1' },
      { id: 'dev-02', type: 'SMART_BAND', name: 'HealthPulse Smart Band 5', serialNo: 'HPB-7740', battery: 64, isConnected: true, lastSync: '1 min ago', firmware: 'v1.8.0' }
    ],
    consent: {
      consentId: 'ABDM-CONSENT-2025-9921',
      abhaAddress: 'rameshwar.patel@abdm',
      status: 'ACTIVE',
      grantedDate: '14 Oct 2025',
      expiryDate: '14 Oct 2027',
      dataTypesConsented: ['Vital Signs Stream', 'Diagnostic Reports', 'Prescription History'],
      purpose: 'Remote Chronic Disease Care & Emergency Teleconsultation',
      hospitalPartner: 'Apollo Rural Telehealth Node #04',
      dataEncrypted: true,
      encryptionProtocol: 'AES-256-GCM / TLS 1.3',
      auditLedgerHash: '8f92b4c107e3d8194a50f145cbe27a192'
    },
    emergencyContact: {
      name: 'Sachin Patel',
      relation: 'Son',
      phone: '+91 94220 18832'
    },
    activeAlerts: [
      {
        id: 'alt-001',
        patientId: 'pat-001',
        patientName: 'Rameshwar Patel',
        timestamp: '10 min ago',
        metric: 'BLOOD_PRESSURE',
        severity: 'CRITICAL',
        currentVal: '168/98 mmHg',
        baselineVal: '124/78 mmHg (±7)',
        zScore: 3.82,
        message: 'Personalized BP elevation (+3.8σ above baseline) with sharp 48h rising trend',
        clinicalAdvice: 'Initiate emergency teleconsultation. Review anti-hypertensive adherence and assess for headache, blurred vision, or chest tightness.',
        status: 'ACTIVE'
      }
    ],
    prescriptions: [
      {
        id: 'rx-901',
        patientId: 'pat-001',
        doctorName: 'Dr. Vikram Malhotra',
        doctorRegistration: 'MCI-38291',
        hospitalName: 'Apollo Telehealth Network, Pune Hub',
        date: '02 Nov 2026',
        diagnosis: 'Essential Hypertension Stage 2, Uncontrolled',
        vitalsSnapshot: { bp: '150/92', hr: 78, spo2: 97, glucose: 115, temp: 36.6 },
        medications: [
          { id: 'm1', name: 'Telmisartan 40mg', dosage: '40 mg', frequency: '1-0-0 (Morning, after food)', duration: '30 Days', instructions: 'Take with full glass of water' },
          { id: 'm2', name: 'Amlodipine 5mg', dosage: '5 mg', frequency: '0-0-1 (Night, before bed)', duration: '30 Days', instructions: 'Monitor for ankle swelling' },
          { id: 'm3', name: 'Atorvastatin 20mg', dosage: '20 mg', frequency: '0-0-1 (Night)', duration: '60 Days', instructions: 'Cholesterol control' }
        ],
        dietaryAdvice: 'Strict low-sodium DASH diet (<2g sodium/day). Avoid papad, pickles, and processed snacks.',
        lifestyleAdvice: '30 mins brisk walking daily. Self-monitor BP morning and evening.',
        nextReviewDate: '02 Dec 2026',
        signedDigitalHash: 'e4c919a3b839210fdcae884109b'
      }
    ]
  },
  {
    id: 'pat-002',
    name: 'Sunita Devi',
    age: 58,
    gender: 'Female',
    phone: '+91 97110 39820',
    email: 'sunita.d@example.com',
    abhaId: '91-3829-1092-4412',
    address: 'Near Kashi Vishwanath Mandir, Dashashwamedh',
    district: 'Varanasi',
    state: 'Uttar Pradesh',
    pinCode: '221001',
    primaryDiagnosis: 'Diabetes Mellitus Type 2',
    secondaryConditions: ['Diabetic Neuropathy', 'Mild Hypertension'],
    allergies: ['None known'],
    bloodGroup: 'O+',
    primaryDoctor: 'Dr. Ananya Sen (Endocrinologist)',
    monitoringSince: '20 Sep 2025',
    riskScore: 78,
    riskTier: 'HIGH',
    riskTrend: 'RISING',
    riskExplanation: 'Continuous glucose monitor registered postprandial spike of 286 mg/dL (+4.2σ above personal post-meal average of 155 mg/dL).',
    baseline: {
      heartRate: { mean: 76, std: 6, minSafe: 60, maxSafe: 90, unit: 'bpm' },
      systolic: { mean: 126, std: 6, minSafe: 110, maxSafe: 138, unit: 'mmHg' },
      diastolic: { mean: 80, std: 5, minSafe: 70, maxSafe: 86, unit: 'mmHg' },
      spO2: { mean: 98.0, std: 0.8, minSafe: 95, maxSafe: 100, unit: '%' },
      glucose: { mean: 155, std: 18, minSafe: 80, maxSafe: 180, unit: 'mg/dL' },
      temperature: { mean: 36.7, std: 0.2, minSafe: 36.2, maxSafe: 37.3, unit: '°C' }
    },
    currentVitals: {
      timestamp: 'Just now',
      heartRate: 84,
      spO2: 98,
      systolic: 134,
      diastolic: 84,
      glucose: 286,
      temperature: 36.8,
      source: 'CGM Sensor',
      batteryLevel: 91,
      signalStrength: 'STRONG'
    },
    vitalsHistory: generateHistoricalVitals(126, 80, 76, 98, 155, 36.7, 'GLUCOSE_SPIKE'),
    devices: [
      { id: 'dev-03', type: 'CGM', name: 'FreeStyle Libre 3 Continuous Sensor', serialNo: 'FSL3-IND-4091', battery: 91, isConnected: true, lastSync: '1 min ago', firmware: 'v3.1.2' },
      { id: 'dev-04', type: 'SMART_BAND', name: 'HealthPulse Smart Band 5', serialNo: 'HPB-9912', battery: 78, isConnected: true, lastSync: '3 min ago', firmware: 'v1.8.0' }
    ],
    consent: {
      consentId: 'ABDM-CONSENT-2025-4190',
      abhaAddress: 'sunita.devi@abdm',
      status: 'ACTIVE',
      grantedDate: '20 Sep 2025',
      expiryDate: '20 Sep 2027',
      dataTypesConsented: ['Continuous Glucose Telemetry', 'Clinical Consultations', 'Diagnostic Labs'],
      purpose: 'Endocrine Care & Automated Glycemic Triage',
      hospitalPartner: 'BHU Heritage Telehealth Center',
      dataEncrypted: true,
      encryptionProtocol: 'AES-256-GCM / TLS 1.3',
      auditLedgerHash: '3b18d9f4e2c0715a9e3381a4b678c02'
    },
    emergencyContact: {
      name: 'Rohan Sharma',
      relation: 'Nephew',
      phone: '+91 98390 12091'
    },
    activeAlerts: [
      {
        id: 'alt-002',
        patientId: 'pat-002',
        patientName: 'Sunita Devi',
        timestamp: '18 min ago',
        metric: 'GLUCOSE',
        severity: 'HIGH',
        currentVal: '286 mg/dL',
        baselineVal: '155 mg/dL (±18)',
        zScore: 4.17,
        message: 'Severe Hyperglycemic spike (286 mg/dL, +4.2σ above personal baseline)',
        clinicalAdvice: 'Review recent meal carbohydrate content, check for ketones, verify insulin/oral hypoglycemic administration.',
        status: 'ACTIVE'
      }
    ],
    prescriptions: [
      {
        id: 'rx-902',
        patientId: 'pat-002',
        doctorName: 'Dr. Ananya Sen',
        doctorRegistration: 'MCI-44109',
        hospitalName: 'BHU Heritage Telehealth Center',
        date: '28 Oct 2026',
        diagnosis: 'Type 2 Diabetes Mellitus with Poor Postprandial Control',
        vitalsSnapshot: { bp: '130/82', hr: 76, spo2: 98, glucose: 195, temp: 36.7 },
        medications: [
          { id: 'm4', name: 'Metformin 1000mg ER', dosage: '1000 mg', frequency: '1-0-1 (With meals)', duration: '60 Days', instructions: 'Do not crush or chew' },
          { id: 'm5', name: 'Vildagliptin 50mg', dosage: '50 mg', frequency: '1-0-1', duration: '60 Days', instructions: 'Take with breakfast and dinner' },
          { id: 'm6', name: 'Empagliflozin 10mg', dosage: '10 mg', frequency: '1-0-0 (Morning)', duration: '60 Days', instructions: 'Ensure adequate water intake' }
        ],
        dietaryAdvice: 'Low glycemic index carbohydrates. Substitute white rice with brown rice/foxtail millet. Limit sweets.',
        lifestyleAdvice: '15 minutes post-meal stroll. Adequate hydration (2.5L clean water daily).',
        nextReviewDate: '28 Dec 2026',
        signedDigitalHash: 'f93c09b11e284a5d710ab9e4871'
      }
    ]
  },
  {
    id: 'pat-003',
    name: 'Gurpreet Singh',
    age: 71,
    gender: 'Male',
    phone: '+91 98140 88219',
    email: 'gurpreet.s@example.com',
    abhaId: '91-8819-2041-9981',
    address: 'VPO Sahnewal, GT Road',
    district: 'Ludhiana',
    state: 'Punjab',
    pinCode: '141120',
    primaryDiagnosis: 'Congestive Heart Failure (NYHA Class II)',
    secondaryConditions: ['Coronary Artery Disease', 'Hypertension'],
    allergies: ['Aspirin (Bronchospasm)'],
    bloodGroup: 'AB+',
    primaryDoctor: 'Dr. Vikram Malhotra (Cardiologist)',
    monitoringSince: '05 Aug 2025',
    riskScore: 89,
    riskTier: 'CRITICAL',
    riskTrend: 'RISING',
    riskExplanation: 'Resting SpO2 dropped to 89.2% accompanied by heart rate surge to 106 bpm. High risk of pulmonary congestion / heart failure decompensation.',
    baseline: {
      heartRate: { mean: 74, std: 7, minSafe: 55, maxSafe: 90, unit: 'bpm' },
      systolic: { mean: 128, std: 8, minSafe: 105, maxSafe: 142, unit: 'mmHg' },
      diastolic: { mean: 82, std: 6, minSafe: 65, maxSafe: 88, unit: 'mmHg' },
      spO2: { mean: 96.5, std: 1.2, minSafe: 93, maxSafe: 100, unit: '%' },
      glucose: { mean: 115, std: 14, minSafe: 75, maxSafe: 150, unit: 'mg/dL' },
      temperature: { mean: 36.6, std: 0.3, minSafe: 36.1, maxSafe: 37.4, unit: '°C' }
    },
    currentVitals: {
      timestamp: 'Just now',
      heartRate: 106,
      spO2: 89.2,
      systolic: 144,
      diastolic: 92,
      glucose: 120,
      temperature: 36.8,
      source: 'Pulse Oximeter',
      batteryLevel: 75,
      signalStrength: 'STRONG'
    },
    vitalsHistory: generateHistoricalVitals(128, 82, 74, 96.5, 115, 36.6, 'SPO2_DROP'),
    devices: [
      { id: 'dev-05', type: 'PULSE_OXIMETER', name: 'Contec Medical Smart Pulse Oximeter', serialNo: 'CMS-50D-IN', battery: 75, isConnected: true, lastSync: '1 min ago', firmware: 'v1.4' },
      { id: 'dev-06', type: 'BP_CUFF', name: 'Omron Connect Smart BP Cuff', serialNo: 'OMR-IN-77123', battery: 88, isConnected: true, lastSync: '5 min ago', firmware: 'v2.4.1' }
    ],
    consent: {
      consentId: 'ABDM-CONSENT-2025-1102',
      abhaAddress: 'gurpreet.singh@abdm',
      status: 'ACTIVE',
      grantedDate: '05 Aug 2025',
      expiryDate: '05 Aug 2027',
      dataTypesConsented: ['Cardiopulmonary Stream', 'All Clinical Records', 'Emergency Dispatch Access'],
      purpose: 'Heart Failure Remote Triage & Early Decompensation Interception',
      hospitalPartner: 'Dayanand Medical College Telehealth Wing',
      dataEncrypted: true,
      encryptionProtocol: 'AES-256-GCM / TLS 1.3',
      auditLedgerHash: '9a77c381e02f901cb548a318e7c10b2'
    },
    emergencyContact: {
      name: 'Harpreet Singh',
      relation: 'Son',
      phone: '+91 98141 99012'
    },
    activeAlerts: [
      {
        id: 'alt-003',
        patientId: 'pat-003',
        patientName: 'Gurpreet Singh',
        timestamp: '5 min ago',
        metric: 'SPO2',
        severity: 'CRITICAL',
        currentVal: '89.2%',
        baselineVal: '96.5% (±1.2)',
        zScore: -6.08,
        message: 'Severe Hypoxemia (89.2%) combined with resting tachycardia (106 bpm)',
        clinicalAdvice: 'URGENT: Initiate emergency teleconsult. Assess for orthopnea, paroxysmal nocturnal dyspnea, pedal edema. Prepare 108 ambulance dispatch if cyanotic.',
        status: 'ACTIVE'
      }
    ],
    prescriptions: [
      {
        id: 'rx-903',
        patientId: 'pat-003',
        doctorName: 'Dr. Vikram Malhotra',
        doctorRegistration: 'MCI-38291',
        hospitalName: 'Apollo Telehealth Network, Pune Hub',
        date: '10 Nov 2026',
        diagnosis: 'Congestive Cardiac Failure with Mild Volume Overload',
        vitalsSnapshot: { bp: '138/88', hr: 84, spo2: 94, glucose: 112, temp: 36.6 },
        medications: [
          { id: 'm7', name: 'Torsemide 10mg', dosage: '10 mg', frequency: '1-0-0 (Morning on empty stomach)', duration: '30 Days', instructions: 'Diuretic. Track daily morning weight' },
          { id: 'm8', name: 'Sacubitril/Valsartan 50mg', dosage: '50 mg', frequency: '1-0-1', duration: '30 Days', instructions: 'Take consistently 12 hours apart' },
          { id: 'm9', name: 'Bisoprolol 2.5mg', dosage: '2.5 mg', frequency: '1-0-0', duration: '30 Days', instructions: 'Beta blocker for heart rate regulation' }
        ],
        dietaryAdvice: 'Fluid restriction: Maximum 1.5 Litres total fluids per 24 hours. Salt < 1.5g per day.',
        lifestyleAdvice: 'Weigh yourself every morning after first urination. If weight rises by >1.5 kg in 2 days, notify doctor immediately.',
        nextReviewDate: '25 Nov 2026',
        signedDigitalHash: 'a8710bc93e110492dafe87102b4'
      }
    ]
  },
  {
    id: 'pat-004',
    name: 'Meenakshi Sundaram',
    age: 52,
    gender: 'Female',
    phone: '+91 94432 19801',
    email: 'meenakshi.s@example.com',
    abhaId: '91-1029-4821-6651',
    address: 'East Veli Street, Near Meenakshi Temple',
    district: 'Madurai',
    state: 'Tamil Nadu',
    pinCode: '625001',
    primaryDiagnosis: 'Coronary Artery Disease (Post-PTCA)',
    secondaryConditions: ['Hyperlipidemia', 'Osteoarthritis'],
    allergies: ['NSAIDs (Gastric sensitivity)'],
    bloodGroup: 'A+',
    primaryDoctor: 'Dr. Vikram Malhotra (Cardiologist)',
    monitoringSince: '12 Jan 2026',
    riskScore: 22,
    riskTier: 'STABLE',
    riskTrend: 'STABLE',
    riskExplanation: 'Stable baseline. Heart rate, blood pressure, and SpO2 in target post-angioplasty therapeutic windows.',
    baseline: {
      heartRate: { mean: 68, std: 5, minSafe: 55, maxSafe: 85, unit: 'bpm' },
      systolic: { mean: 118, std: 6, minSafe: 100, maxSafe: 135, unit: 'mmHg' },
      diastolic: { mean: 76, std: 5, minSafe: 65, maxSafe: 85, unit: 'mmHg' },
      spO2: { mean: 98.2, std: 0.7, minSafe: 95, maxSafe: 100, unit: '%' },
      glucose: { mean: 102, std: 10, minSafe: 70, maxSafe: 135, unit: 'mg/dL' },
      temperature: { mean: 36.5, std: 0.2, minSafe: 36.1, maxSafe: 37.2, unit: '°C' }
    },
    currentVitals: {
      timestamp: 'Just now',
      heartRate: 67,
      spO2: 98.5,
      systolic: 116,
      diastolic: 74,
      glucose: 98,
      temperature: 36.5,
      source: 'Smart Band',
      batteryLevel: 94,
      signalStrength: 'STRONG'
    },
    vitalsHistory: generateHistoricalVitals(118, 76, 68, 98.2, 102, 36.5, 'STABLE'),
    devices: [
      { id: 'dev-07', type: 'SMART_BAND', name: 'HealthPulse Pro ECG Smart Band', serialNo: 'HPB-PRO-0021', battery: 94, isConnected: true, lastSync: '1 min ago', firmware: 'v2.1.0' },
      { id: 'dev-08', type: 'BP_CUFF', name: 'Omron Connect Smart BP Cuff', serialNo: 'OMR-IN-11940', battery: 90, isConnected: true, lastSync: '4 hours ago', firmware: 'v2.4.1' }
    ],
    consent: {
      consentId: 'ABDM-CONSENT-2026-0812',
      abhaAddress: 'meenakshi.s@abdm',
      status: 'ACTIVE',
      grantedDate: '12 Jan 2026',
      expiryDate: '12 Jan 2028',
      dataTypesConsented: ['All Telemetry Streams', 'E-Prescriptions', 'Cardiology Imaging'],
      purpose: 'Post-Angioplasty Rehabilitation & Continuous Monitoring',
      hospitalPartner: 'Apollo Speciality Hospitals Madurai',
      dataEncrypted: true,
      encryptionProtocol: 'AES-256-GCM / TLS 1.3',
      auditLedgerHash: '1e44a980b332c1998f45a0b77c1092a'
    },
    emergencyContact: {
      name: 'K. Sundaram',
      relation: 'Husband',
      phone: '+91 94432 19800'
    },
    activeAlerts: [],
    prescriptions: [
      {
        id: 'rx-904',
        patientId: 'pat-004',
        doctorName: 'Dr. Vikram Malhotra',
        doctorRegistration: 'MCI-38291',
        hospitalName: 'Apollo Telehealth Network, Pune Hub',
        date: '14 Oct 2026',
        diagnosis: 'Post Percutaneous Coronary Intervention (DES in LAD), Stable',
        vitalsSnapshot: { bp: '116/74', hr: 68, spo2: 98, glucose: 100, temp: 36.5 },
        medications: [
          { id: 'm10', name: 'Ticagrelor 90mg', dosage: '90 mg', frequency: '1-0-1', duration: '90 Days', instructions: 'Antiplatelet. Do not miss doses' },
          { id: 'm11', name: 'Aspirin 75mg Gastro-resistant', dosage: '75 mg', frequency: '0-1-0 (After lunch)', duration: '90 Days', instructions: 'Take with meal' },
          { id: 'm12', name: 'Rosuvastatin 20mg', dosage: '20 mg', frequency: '0-0-1 (Night)', duration: '90 Days', instructions: 'Maintain LDL < 55 mg/dL' }
        ],
        dietaryAdvice: 'Heart-healthy Mediterranean diet with Indian adaptations (Olive/Mustard oil, walnuts, steamed legumes).',
        lifestyleAdvice: 'Cardiac rehab walking plan: 40 minutes morning walk. Avoid heavy weights.',
        nextReviewDate: '14 Jan 2027',
        signedDigitalHash: '6d9124a90f84bc1912a77192a001'
      }
    ]
  },
  {
    id: 'pat-005',
    name: 'Anand Mohan Verma',
    age: 62,
    gender: 'Male',
    phone: '+91 93340 77102',
    email: 'anand.verma@example.com',
    abhaId: '91-6621-3990-2184',
    address: 'Boring Road, Near Alpana Market',
    district: 'Patna',
    state: 'Bihar',
    pinCode: '800001',
    primaryDiagnosis: 'Chronic Obstructive Pulmonary Disease (COPD)',
    secondaryConditions: ['Cor Pulmonale', 'Chronic Bronchitis'],
    allergies: ['Dust mites', 'Cold air trigger'],
    bloodGroup: 'B-',
    primaryDoctor: 'Dr. Rajiv Nambiar (Pulmonologist)',
    monitoringSince: '18 Nov 2025',
    riskScore: 72,
    riskTier: 'HIGH',
    riskTrend: 'RISING',
    riskExplanation: 'Body temperature elevated to 38.3°C with SpO2 dropping to 91% and heart rate at 102 bpm. Potential infective exacerbation of COPD.',
    baseline: {
      heartRate: { mean: 80, std: 7, minSafe: 60, maxSafe: 98, unit: 'bpm' },
      systolic: { mean: 126, std: 7, minSafe: 110, maxSafe: 140, unit: 'mmHg' },
      diastolic: { mean: 82, std: 5, minSafe: 70, maxSafe: 88, unit: 'mmHg' },
      spO2: { mean: 94.0, std: 1.5, minSafe: 91, maxSafe: 98, unit: '%' },
      glucose: { mean: 108, std: 12, minSafe: 70, maxSafe: 140, unit: 'mg/dL' },
      temperature: { mean: 36.7, std: 0.3, minSafe: 36.1, maxSafe: 37.3, unit: '°C' }
    },
    currentVitals: {
      timestamp: 'Just now',
      heartRate: 102,
      spO2: 91.0,
      systolic: 132,
      diastolic: 86,
      glucose: 114,
      temperature: 38.3,
      source: 'Pulse Oximeter',
      batteryLevel: 68,
      signalStrength: 'MEDIUM'
    },
    vitalsHistory: generateHistoricalVitals(126, 82, 80, 94.0, 108, 36.7, 'SPO2_DROP'),
    devices: [
      { id: 'dev-09', type: 'PULSE_OXIMETER', name: 'Smart Pulse Oximeter Bluetooth', serialNo: 'POX-PAT-3310', battery: 68, isConnected: true, lastSync: '2 min ago', firmware: 'v1.5.0' },
      { id: 'dev-10', type: 'SMART_BAND', name: 'HealthPulse Smart Band 5', serialNo: 'HPB-2201', battery: 52, isConnected: true, lastSync: '4 min ago', firmware: 'v1.8.0' }
    ],
    consent: {
      consentId: 'ABDM-CONSENT-2025-7719',
      abhaAddress: 'anand.verma@abdm',
      status: 'ACTIVE',
      grantedDate: '18 Nov 2025',
      expiryDate: '18 Nov 2027',
      dataTypesConsented: ['Respiratory Telemetry', 'Clinical Notes', 'Inhaler Adherence Tracking'],
      purpose: 'COPD Tele-Management & Acute Exacerbation Detection',
      hospitalPartner: 'AIIMS Patna Telemedicine Center',
      dataEncrypted: true,
      encryptionProtocol: 'AES-256-GCM / TLS 1.3',
      auditLedgerHash: '7a19c4d8120e891bca77201948ba120'
    },
    emergencyContact: {
      name: 'Priyanka Verma',
      relation: 'Daughter',
      phone: '+91 93341 88200'
    },
    activeAlerts: [
      {
        id: 'alt-005',
        patientId: 'pat-005',
        patientName: 'Anand Mohan Verma',
        timestamp: '14 min ago',
        metric: 'TEMPERATURE',
        severity: 'HIGH',
        currentVal: '38.3 °C (HR 102, SpO2 91%)',
        baselineVal: '36.7 °C (±0.3)',
        zScore: 5.33,
        message: 'Elevated temperature with respiratory desaturation (COPD infective flare suspicion)',
        clinicalAdvice: 'Schedule teleconsultation. Review sputum purulence, evaluate need for bronchodilator nebulization and oral antibiotics.',
        status: 'ACTIVE'
      }
    ],
    prescriptions: [
      {
        id: 'rx-905',
        patientId: 'pat-005',
        doctorName: 'Dr. Rajiv Nambiar',
        doctorRegistration: 'MCI-29184',
        hospitalName: 'AIIMS Patna Telemedicine Center',
        date: '01 Nov 2026',
        diagnosis: 'COPD GOLD Stage II with Frequent Winter Exacerbations',
        vitalsSnapshot: { bp: '128/84', hr: 82, spo2: 93, glucose: 110, temp: 36.8 },
        medications: [
          { id: 'm13', name: 'Formoterol + Budesonide Inhaler (200/6)', dosage: '2 puffs', frequency: '1-0-1 (Morning & Night)', duration: '60 Days', instructions: 'Rinse mouth with water after inhalation' },
          { id: 'm14', name: 'Tiotropium 18mcg Rotacap', dosage: '1 cap', frequency: '1-0-0 (Morning with DPI)', duration: '60 Days', instructions: 'Inhale through Revolizer device' },
          { id: 'm15', name: 'N-Acetylcysteine 600mg', dosage: '600 mg', frequency: '1-0-0 (Effervescent tablet)', duration: '30 Days', instructions: 'Dissolve in 100ml water' }
        ],
        dietaryAdvice: 'High-protein warm meals. Avoid icy drinks or foods causing abdominal bloating.',
        lifestyleAdvice: 'Avoid morning outdoor walk during high PM2.5 smog hours. Keep portable room air filter active.',
        nextReviewDate: '01 Dec 2026',
        signedDigitalHash: '3a88c012b8491aee991048ba871'
      }
    ]
  },
  {
    id: 'pat-006',
    name: 'Fatima Begum',
    age: 49,
    gender: 'Female',
    phone: '+91 98490 22194',
    email: 'fatima.b@example.com',
    abhaId: '91-7712-4019-3382',
    address: 'Moghulpura, Near Charminar',
    district: 'Hyderabad',
    state: 'Telangana',
    pinCode: '500002',
    primaryDiagnosis: 'Type 2 Diabetes (Brittle / Fluctuating)',
    secondaryConditions: ['Hypoglycemia Unawareness', 'Mild Hypertension'],
    allergies: ['Codeine'],
    bloodGroup: 'O-',
    primaryDoctor: 'Dr. Ananya Sen (Endocrinologist)',
    monitoringSince: '10 Sep 2025',
    riskScore: 76,
    riskTier: 'HIGH',
    riskTrend: 'IMPROVING',
    riskExplanation: 'Nocturnal glucose dip detected at 58 mg/dL (-3.8σ below personal fasting mean). Auto-alert sent to patient and caregiver.',
    baseline: {
      heartRate: { mean: 75, std: 6, minSafe: 60, maxSafe: 90, unit: 'bpm' },
      systolic: { mean: 122, std: 6, minSafe: 105, maxSafe: 135, unit: 'mmHg' },
      diastolic: { mean: 78, std: 5, minSafe: 65, maxSafe: 85, unit: 'mmHg' },
      spO2: { mean: 98.0, std: 0.8, minSafe: 95, maxSafe: 100, unit: '%' },
      glucose: { mean: 125, std: 14, minSafe: 70, maxSafe: 160, unit: 'mg/dL' },
      temperature: { mean: 36.6, std: 0.2, minSafe: 36.1, maxSafe: 37.3, unit: '°C' }
    },
    currentVitals: {
      timestamp: 'Just now',
      heartRate: 86,
      spO2: 98,
      systolic: 124,
      diastolic: 80,
      glucose: 62,
      temperature: 36.6,
      source: 'CGM Sensor',
      batteryLevel: 89,
      signalStrength: 'STRONG'
    },
    vitalsHistory: generateHistoricalVitals(122, 78, 75, 98, 125, 36.6, 'HYPOGLYCEMIA'),
    devices: [
      { id: 'dev-11', type: 'CGM', name: 'Dexcom G7 Continuous Glucose Sensor', serialNo: 'DXG7-TEL-8891', battery: 89, isConnected: true, lastSync: '1 min ago', firmware: 'v1.9.4' },
      { id: 'dev-12', type: 'SMART_BAND', name: 'HealthPulse Smart Band 5', serialNo: 'HPB-6612', battery: 84, isConnected: true, lastSync: '3 min ago', firmware: 'v1.8.0' }
    ],
    consent: {
      consentId: 'ABDM-CONSENT-2025-5512',
      abhaAddress: 'fatima.begum@abdm',
      status: 'ACTIVE',
      grantedDate: '10 Sep 2025',
      expiryDate: '10 Sep 2027',
      dataTypesConsented: ['Continuous Glucose Stream', 'Nocturnal Hypoglycemia Alert Dispatch', 'Caregiver Notifications'],
      purpose: 'Hypoglycemia Prevention & Remote Titration',
      hospitalPartner: 'Nizam Institute of Medical Sciences (NIMS)',
      dataEncrypted: true,
      encryptionProtocol: 'AES-256-GCM / TLS 1.3',
      auditLedgerHash: '5e19d880b4317a02c918bb12a90014d'
    },
    emergencyContact: {
      name: 'Mohammed Tariq',
      relation: 'Son',
      phone: '+91 98490 55102'
    },
    activeAlerts: [
      {
        id: 'alt-006',
        patientId: 'pat-006',
        patientName: 'Fatima Begum',
        timestamp: '25 min ago',
        metric: 'GLUCOSE',
        severity: 'HIGH',
        currentVal: '62 mg/dL',
        baselineVal: '125 mg/dL (±14)',
        zScore: -4.5,
        message: 'Acute Hypoglycemia episode (62 mg/dL) with mild tachycardia (86 bpm)',
        clinicalAdvice: 'Rule of 15 intervention: 15g fast sugar (3 tsp sugar or 150ml fruit juice). Retest in 15 mins.',
        status: 'ACTIVE'
      }
    ],
    prescriptions: [
      {
        id: 'rx-906',
        patientId: 'pat-006',
        doctorName: 'Dr. Ananya Sen',
        doctorRegistration: 'MCI-44109',
        hospitalName: 'NIMS Telemedicine Care, Hyderabad',
        date: '05 Nov 2026',
        diagnosis: 'Brittle Type 2 Diabetes with Hypoglycemia Tendency',
        vitalsSnapshot: { bp: '124/80', hr: 76, spo2: 98, glucose: 130, temp: 36.6 },
        medications: [
          { id: 'm16', name: 'Glimepiride 1mg', dosage: '1 mg', frequency: '1-0-0 (Before breakfast)', duration: '30 Days', instructions: 'Reduced dosage from 2mg to avert hypoglycemia' },
          { id: 'm17', name: 'Metformin 500mg SR', dosage: '500 mg', frequency: '0-0-1 (After dinner)', duration: '30 Days', instructions: 'Take with food' }
        ],
        dietaryAdvice: 'Include bedtime complex carbohydrate snack (1 glass warm milk with almonds or small multigrain roti) to prevent 3 AM nocturnal dip.',
        lifestyleAdvice: 'Keep glucose tablets or candy packet on bedside table at all times.',
        nextReviewDate: '05 Dec 2026',
        signedDigitalHash: '1a9048cb123e449910fe87123aa'
      }
    ]
  }
];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'log-001',
    timestamp: '2026-11-17 22:15:02',
    userRole: 'SYSTEM_AI',
    actorName: 'TELMED Adaptive Baseline Engine',
    action: 'ANOMALY_FLAGGED',
    targetPatientId: 'pat-001',
    details: 'Systolic BP 168 mmHg (+3.8σ) flagged; composite risk score escalated to 84 (CRITICAL)',
    hash: '0x8f19...d421'
  },
  {
    id: 'log-002',
    timestamp: '2026-11-17 22:10:45',
    userRole: 'DOCTOR',
    actorName: 'Dr. Vikram Malhotra',
    action: 'PATIENT_RECORD_VIEW',
    targetPatientId: 'pat-003',
    details: 'Accessed cardiopulmonary telemetry stream under ABDM Consent #ABDM-CONSENT-2025-1102',
    hash: '0x3c22...aa19'
  },
  {
    id: 'log-003',
    timestamp: '2026-11-17 22:04:19',
    userRole: 'SYSTEM_AI',
    actorName: 'IoT Cloud Gateway (MQTT/TLS)',
    action: 'TELEMETRY_INGESTION',
    targetPatientId: 'pat-002',
    details: 'FreeStyle Libre 3 CGM sensor pushed packet: Glucose 286 mg/dL [AES-256 Verified]',
    hash: '0x992a...01f2'
  },
  {
    id: 'log-004',
    timestamp: '2026-11-17 21:55:00',
    userRole: 'PATIENT',
    actorName: 'Meenakshi Sundaram',
    action: 'CONSENT_VERIFIED',
    targetPatientId: 'pat-004',
    details: 'Active ABHA consent renewed for Apollo Speciality Hospitals Madurai',
    hash: '0x551a...99e1'
  }
];
