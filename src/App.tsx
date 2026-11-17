import React, { useState, useEffect } from 'react';
import type { Patient, UserRole, AuditLogEntry, Prescription, VitalReading } from './types';
import { INITIAL_PATIENTS, INITIAL_AUDIT_LOGS } from './services/mockData';
import { generateNextReading, processIncomingReading } from './services/telemetrySimulator';
import type { SimulationScenario } from './services/telemetrySimulator';
import { Navbar } from './components/Navbar';
import { DoctorDashboard } from './components/DoctorDashboard';
import { TeleconsultationView } from './components/TeleconsultationView';
import { PatientPortal } from './components/PatientPortal';
import { SecurityView } from './components/SecurityView';
import { PrescriptionModal } from './components/PrescriptionModal';

export const App: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [selectedPatient, setSelectedPatient] = useState<Patient>(INITIAL_PATIENTS[0]);
  const [activeTab, setActiveTab] = useState<'doctor' | 'teleconsult' | 'patient' | 'security' | 'prescriptions'>('doctor');
  const [userRole, setUserRole] = useState<UserRole>('DOCTOR');
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [lowBandwidthMode, setLowBandwidthMode] = useState<boolean>(false);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [viewingPrescription, setViewingPrescription] = useState<{ rx: Prescription; pat: Patient } | null>(null);

  // Active scenario per patient
  const [activeScenarios, setActiveScenarios] = useState<Record<string, SimulationScenario>>({
    'pat-001': 'NORMAL_CIRCADIAN',
    'pat-002': 'NORMAL_CIRCADIAN',
    'pat-003': 'NORMAL_CIRCADIAN',
    'pat-004': 'NORMAL_CIRCADIAN',
    'pat-005': 'NORMAL_CIRCADIAN',
    'pat-006': 'NORMAL_CIRCADIAN'
  });

  // Simulated live telemetry stream (Interval: 4.5 seconds)
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      setPatients(prevPatients => {
        return prevPatients.map(patient => {
          const scenario = activeScenarios[patient.id] || 'NORMAL_CIRCADIAN';
          const nextReading = generateNextReading(patient, scenario);
          const updatedPatient = processIncomingReading(patient, nextReading);

          // If a new critical alert was generated, add an audit log
          if (updatedPatient.activeAlerts.length > patient.activeAlerts.length) {
            const newest = updatedPatient.activeAlerts[0];
            const newAudit: AuditLogEntry = {
              id: `log-${Date.now()}-${patient.id}`,
              timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
              userRole: 'SYSTEM_AI',
              actorName: 'TELMED Adaptive Baseline Engine',
              action: 'ANOMALY_TRIGGERED',
              targetPatientId: patient.id,
              details: `${patient.name}: ${newest.message} (z-score: +${newest.zScore}σ)`,
              hash: '0x' + Math.random().toString(16).substring(2, 10) + '...sha256'
            };
            setAuditLogs(prevLogs => [newAudit, ...prevLogs.slice(0, 40)]);
          }

          // Keep selected patient state synced
          if (patient.id === selectedPatient.id) {
            setSelectedPatient(updatedPatient);
          }

          return updatedPatient;
        });
      });
    }, 4500);

    return () => clearInterval(interval);
  }, [isStreaming, activeScenarios, selectedPatient.id]);

  // Handle Scenario Injection
  const handleTriggerScenario = (patientId: string, scenario: SimulationScenario) => {
    setActiveScenarios(prev => ({
      ...prev,
      [patientId]: scenario
    }));

    // Immediately push one reading with the scenario
    setPatients(prevPatients => {
      return prevPatients.map(patient => {
        if (patient.id === patientId) {
          const nextReading = generateNextReading(patient, scenario);
          const updated = processIncomingReading(patient, nextReading);
          if (patient.id === selectedPatient.id) {
            setSelectedPatient(updated);
          }
          return updated;
        }
        return patient;
      });
    });

    // Log the scenario simulation in audit ledger
    const targetPatient = patients.find(p => p.id === patientId);
    if (targetPatient) {
      const newAudit: AuditLogEntry = {
        id: `sim-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        userRole: 'SYSTEM_AI',
        actorName: 'Clinical Simulation Injector',
        action: 'SCENARIO_INJECTED',
        targetPatientId: patientId,
        details: `Simulated: ${scenario} on ${targetPatient.name}`,
        hash: '0x' + Math.random().toString(16).substring(2, 10) + '...sha256'
      };
      setAuditLogs(prev => [newAudit, ...prev]);
    }
  };

  // Start Teleconsultation
  const handleStartTeleconsult = (patient: Patient) => {
    setSelectedPatient(patient);
    setActiveTab('teleconsult');

    const newAudit: AuditLogEntry = {
      id: `call-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      userRole: 'DOCTOR',
      actorName: 'Dr. Vikram Malhotra',
      action: 'TELECONSULT_INITIATED',
      targetPatientId: patient.id,
      details: `Started encrypted teleconsultation session with ${patient.name} (${patient.district})`,
      hash: '0x' + Math.random().toString(16).substring(2, 10) + '...sha256'
    };
    setAuditLogs(prev => [newAudit, ...prev]);
  };

  // Acknowledge Alert
  const handleAcknowledgeAlert = (alertId: string) => {
    setPatients(prev => {
      return prev.map(p => ({
        ...p,
        activeAlerts: p.activeAlerts.filter(a => a.id !== alertId)
      }));
    });

    if (selectedPatient) {
      setSelectedPatient(prev => ({
        ...prev,
        activeAlerts: prev.activeAlerts.filter(a => a.id !== alertId)
      }));
    }

    const newAudit: AuditLogEntry = {
      id: `ack-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      userRole: 'DOCTOR',
      actorName: 'Dr. Vikram Malhotra',
      action: 'ALERT_ACKNOWLEDGED',
      targetPatientId: selectedPatient.id,
      details: `Doctor acknowledged and triaged clinical alert #${alertId}`,
      hash: '0x' + Math.random().toString(16).substring(2, 10) + '...sha256'
    };
    setAuditLogs(prev => [newAudit, ...prev]);
  };

  // Issue & Sign Prescription
  const handleIssuePrescription = (prescription: Prescription) => {
    setPatients(prev => {
      return prev.map(p => {
        if (p.id === prescription.patientId) {
          return {
            ...p,
            prescriptions: [prescription, ...p.prescriptions]
          };
        }
        return p;
      });
    });

    if (selectedPatient.id === prescription.patientId) {
      setSelectedPatient(prev => ({
        ...prev,
        prescriptions: [prescription, ...prev.prescriptions]
      }));
    }

    const newAudit: AuditLogEntry = {
      id: `rx-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      userRole: 'DOCTOR',
      actorName: 'Dr. Vikram Malhotra',
      action: 'PRESCRIPTION_ISSUED',
      targetPatientId: prescription.patientId,
      details: `Issued ABDM signed digital prescription #${prescription.id} for ${prescription.diagnosis}`,
      hash: prescription.signedDigitalHash
    };
    setAuditLogs(prev => [newAudit, ...prev]);
  };

  // Manual Log Vitals from Patient Portal
  const handleLogManualVitals = (reading: VitalReading) => {
    const updated = processIncomingReading(selectedPatient, reading);
    setSelectedPatient(updated);

    setPatients(prev => prev.map(p => p.id === selectedPatient.id ? updated : p));

    const newAudit: AuditLogEntry = {
      id: `manual-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      userRole: 'PATIENT',
      actorName: selectedPatient.name,
      action: 'MANUAL_VITALS_INGESTION',
      targetPatientId: selectedPatient.id,
      details: `Manual log: BP ${reading.systolic}/${reading.diastolic} mmHg, Glucose ${reading.glucose} mg/dL`,
      hash: '0x' + Math.random().toString(16).substring(2, 10) + '...sha256'
    };
    setAuditLogs(prev => [newAudit, ...prev]);
  };

  const criticalAlertCount = patients.reduce(
    (acc, p) => acc + p.activeAlerts.filter(a => a.severity === 'CRITICAL').length,
    0
  );

  return (
    <div className="min-h-screen bg-[#ECECEC] flex flex-col text-slate-800 font-sans selection:bg-[#72BAA9] selection:text-white">
      
      {/* Universal Top Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userRole={userRole}
        setUserRole={setUserRole}
        isStreaming={isStreaming}
        setIsStreaming={setIsStreaming}
        criticalAlertCount={criticalAlertCount}
        lowBandwidthMode={lowBandwidthMode}
        setLowBandwidthMode={setLowBandwidthMode}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {activeTab === 'doctor' && (
          <DoctorDashboard
            patients={patients}
            selectedPatient={selectedPatient}
            setSelectedPatient={setSelectedPatient}
            onStartTeleconsult={handleStartTeleconsult}
            onAcknowledgeAlert={handleAcknowledgeAlert}
            onTriggerScenario={handleTriggerScenario}
            onViewPrescription={(p) => {
              if (p.prescriptions[0]) {
                setViewingPrescription({ rx: p.prescriptions[0], pat: p });
              }
            }}
          />
        )}

        {activeTab === 'teleconsult' && (
          <TeleconsultationView
            patient={selectedPatient}
            onEndCall={() => setActiveTab('doctor')}
            onIssuePrescription={handleIssuePrescription}
            lowBandwidthMode={lowBandwidthMode}
            setLowBandwidthMode={setLowBandwidthMode}
          />
        )}

        {activeTab === 'patient' && (
          <PatientPortal
            patient={selectedPatient}
            onLogManualVitals={handleLogManualVitals}
            onOpenConsult={() => handleStartTeleconsult(selectedPatient)}
            onViewPrescription={(rx) => setViewingPrescription({ rx, pat: selectedPatient })}
          />
        )}

        {activeTab === 'security' && (
          <SecurityView
            patients={patients}
            selectedPatient={selectedPatient}
            auditLogs={auditLogs}
          />
        )}

      </main>

      {/* Full-Page Official Prescription Modal */}
      {viewingPrescription && (
        <PrescriptionModal
          prescription={viewingPrescription.rx}
          patient={viewingPrescription.pat}
          onClose={() => setViewingPrescription(null)}
        />
      )}

      {/* Persistent Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-[#6E1A37]">TELMED</span>
            <span>• Integrated Remote Patient Monitoring & Telemedicine Platform</span>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <span>Color Palette: #6E1A37, #AE2448, #72BAA9, #D5E7B5, #ECECEC</span>
            <span className="text-[#AE2448] font-bold">ABDM / NMC Compliant</span>
            <span className="font-mono text-slate-400">GitHub: AbhyasKathuria/TELMED</span>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default App;
