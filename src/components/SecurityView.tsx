import React, { useState } from 'react';
import type { Patient, AuditLogEntry } from '../types';
import {
  ShieldCheck,
  FileCheck2,
  Database,
  CheckCircle2
} from 'lucide-react';

interface SecurityViewProps {
  patients: Patient[];
  selectedPatient: Patient;
  auditLogs: AuditLogEntry[];
  onToggleConsent?: (patientId: string, dataType: string) => void;
}

export const SecurityView: React.FC<SecurityViewProps> = ({
  patients,
  selectedPatient,
  auditLogs
}) => {
  const [selectedPatId, setSelectedPatId] = useState(selectedPatient.id);
  const activePatient = patients.find(p => p.id === selectedPatId) || selectedPatient;

  const [activeConsentTypes, setActiveConsentTypes] = useState<string[]>([
    'Vital Signs Stream',
    'Diagnostic Reports',
    'Prescription History',
    'Emergency Dispatch Access'
  ]);

  const toggleType = (type: string) => {
    if (activeConsentTypes.includes(type)) {
      setActiveConsentTypes(activeConsentTypes.filter(t => t !== type));
    } else {
      setActiveConsentTypes([...activeConsentTypes, type]);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Banner: ABDM & Privacy Architecture */}
      <div className="bg-gradient-to-r from-[#6E1A37] via-[#AE2448] to-[#6E1A37] rounded-3xl p-6 text-white shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs bg-[#D5E7B5] text-[#6E1A37] font-black px-3 py-1 rounded-full uppercase tracking-wider">
              ABDM Compliant
            </span>
            <span className="text-xs text-white/80 font-mono">
              DISHA / Healthcare Data Protection Act
            </span>
          </div>
          <h2 className="text-2xl font-black mt-2">Security, Consent & Cryptographic Audit</h2>
          <p className="text-sm text-white/90 mt-1 max-w-2xl">
            Patient-centric consent architecture ensuring end-to-end encrypted telemetry transmission,
            role-based access control (RBAC), and immutable audit logs.
          </p>
        </div>

        <div className="bg-black/30 p-3 rounded-2xl border border-white/20 text-xs space-y-1 font-mono">
          <p className="text-[#D5E7B5] font-bold">Security Stack Status:</p>
          <p className="flex items-center space-x-1.5 text-white/90">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#72BAA9]" />
            <span>At-Rest: AES-256-GCM Encrypted</span>
          </p>
          <p className="flex items-center space-x-1.5 text-white/90">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#72BAA9]" />
            <span>In-Transit: TLS 1.3 Perfect Forward Secrecy</span>
          </p>
        </div>
      </div>

      {/* Main Grid: Consent Manager & Cryptographic Audit Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Patient Consent Manager (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          
          <div className="bg-white rounded-3xl p-5 shadow-card border border-slate-200 space-y-4">
            
            <div className="flex items-center justify-between">
              <h3 className="font-black text-slate-900 text-sm flex items-center space-x-2">
                <FileCheck2 className="w-4 h-4 text-[#6E1A37]" />
                <span>ABDM Consent Artifact Manager</span>
              </h3>
              
              {/* Patient Selector */}
              <select
                value={selectedPatId}
                onChange={(e) => setSelectedPatId(e.target.value)}
                className="bg-[#ECECEC] text-slate-800 text-xs font-bold px-2.5 py-1.5 rounded-xl border border-slate-200 focus:outline-none cursor-pointer"
              >
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Consent Details Card */}
            <div className="p-4 rounded-2xl bg-[#ECECEC]/70 border border-slate-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-500 text-[10px] uppercase">Consent Artifact ID</span>
                <span className="font-mono text-[11px] font-bold text-[#6E1A37]">{activePatient.consent.consentId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-500 text-[10px] uppercase">Linked ABHA Address</span>
                <span className="font-mono text-[11px] text-slate-800">{activePatient.consent.abhaAddress}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-500 text-[10px] uppercase">Authorized Hospital Partner</span>
                <span className="font-semibold text-slate-800">{activePatient.consent.hospitalPartner}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-500 text-[10px] uppercase">Validity Window</span>
                <span className="text-slate-700">{activePatient.consent.grantedDate} to {activePatient.consent.expiryDate}</span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                <span className="font-bold text-slate-500 text-[10px] uppercase">Integrity Ledger Hash</span>
                <span className="font-mono text-[10px] text-[#72BAA9] truncate max-w-[180px]">{activePatient.consent.auditLedgerHash}</span>
              </div>
            </div>

            {/* Granular Data Type Consent Toggles */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-800">Granular Telehealth Permissions:</p>
              
              {[
                { type: 'Vital Signs Stream', desc: 'Real-time blood pressure, heart rate, and glucose sensor telemetry' },
                { type: 'Diagnostic Reports', desc: 'Blood lab panels, ECG traces, and diagnostic summaries' },
                { type: 'Prescription History', desc: 'Access to active and historical medication regimens' },
                { type: 'Emergency Dispatch Access', desc: 'Authorization for 108 ambulance dispatch and triage handover' }
              ].map(item => {
                const isEnabled = activeConsentTypes.includes(item.type);
                return (
                  <div
                    key={item.type}
                    onClick={() => toggleType(item.type)}
                    className="p-3 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100/80 cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-800">{item.type}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{item.desc}</p>
                    </div>
                    <div className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                      isEnabled ? 'bg-[#72BAA9]' : 'bg-slate-300'
                    }`}>
                      <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${
                        isEnabled ? 'translate-x-4' : 'translate-x-0'
                      }`} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-3 rounded-2xl bg-[#D5E7B5]/30 border border-[#72BAA9]/30 text-xs text-slate-700 flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-[#6E1A37] shrink-0" />
              <p className="text-[11px] leading-relaxed">
                Patients can revoke consent anytime via ABHA PHR app with immediate zero-knowledge session teardown.
              </p>
            </div>

          </div>

        </div>

        {/* Right Column: Cryptographic Audit Ledger (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          
          <div className="bg-white rounded-3xl p-5 shadow-card border border-slate-200 space-y-4">
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-slate-900 text-sm flex items-center space-x-2">
                  <Database className="w-4 h-4 text-[#AE2448]" />
                  <span>Immutable Access & Ingestion Audit Ledger</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Cryptographically hashed trail tracking every clinical view, IoT packet, and consent update
                </p>
              </div>

              <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg border border-slate-200">
                SHA-256 Verified
              </span>
            </div>

            {/* Audit Logs Table */}
            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {auditLogs.map((log) => {
                const isAI = log.userRole === 'SYSTEM_AI';
                const isDoctor = log.userRole === 'DOCTOR';

                return (
                  <div
                    key={log.id}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5 transition-all hover:bg-white hover:shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          isAI
                            ? 'bg-[#D5E7B5] text-[#6E1A37]'
                            : isDoctor
                            ? 'bg-[#6E1A37] text-white'
                            : 'bg-[#72BAA9] text-white'
                        }`}>
                          {log.userRole}
                        </span>
                        <span className="font-bold text-slate-800">{log.actorName}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">{log.timestamp}</span>
                    </div>

                    <p className="text-slate-700 text-xs font-medium pl-1 border-l-2 border-[#AE2448]/40">
                      {log.details}
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[10px] text-slate-400 font-mono">
                      <span>Action: {log.action}</span>
                      <span>Hash: {log.hash}</span>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
