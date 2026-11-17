import React, { useState } from 'react';
import type {
  Patient,
  RiskTier
} from '../types';
import type { SimulationScenario } from '../services/telemetrySimulator';
import { VitalsChart } from './VitalsChart';
import {
  Activity,
  AlertCircle,
  Video,
  Search,
  Filter,
  Heart,
  Droplets,
  Wind,
  Thermometer,
  CheckCircle2,
  Phone,
  Radio,
  Sparkles,
  ChevronRight,
  TrendingUp,
  MapPin,
  Cpu,
  FileCheck
} from 'lucide-react';

interface DoctorDashboardProps {
  patients: Patient[];
  selectedPatient: Patient;
  setSelectedPatient: (patient: Patient) => void;
  onStartTeleconsult: (patient: Patient) => void;
  onAcknowledgeAlert: (alertId: string) => void;
  onTriggerScenario: (patientId: string, scenario: SimulationScenario) => void;
  onViewPrescription: (patient: Patient) => void;
}

export const DoctorDashboard: React.FC<DoctorDashboardProps> = ({
  patients,
  selectedPatient,
  setSelectedPatient,
  onStartTeleconsult,
  onAcknowledgeAlert,
  onTriggerScenario,
  onViewPrescription
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState<'ALL' | RiskTier>('ALL');
  const [conditionFilter, setConditionFilter] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'trends' | 'baseline' | 'devices' | 'alerts'>('trends');
  const [scenarioNotification, setScenarioNotification] = useState<string | null>(null);

  // Filter and sort patients: Highest Risk First
  const filteredPatients = patients
    .filter(p => {
      const matchSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.abhaId.includes(searchTerm) ||
        p.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.primaryDiagnosis.toLowerCase().includes(searchTerm.toLowerCase());

      const matchTier = tierFilter === 'ALL' || p.riskTier === tierFilter;
      const matchCondition =
        conditionFilter === 'ALL' ||
        p.primaryDiagnosis.toLowerCase().includes(conditionFilter.toLowerCase());

      return matchSearch && matchTier && matchCondition;
    })
    .sort((a, b) => b.riskScore - a.riskScore);

  // Statistics
  const totalPatients = patients.length;
  const criticalCount = patients.filter(p => p.riskTier === 'CRITICAL').length;
  const highRiskCount = patients.filter(p => p.riskTier === 'HIGH').length;
  const activeAlertsCount = patients.reduce((acc, p) => acc + p.activeAlerts.length, 0);

  const handleScenarioClick = (patientId: string, scenario: SimulationScenario, name: string) => {
    onTriggerScenario(patientId, scenario);
    setScenarioNotification(`Simulation triggered: ${scenario.replace('_', ' ')} on ${name}. Real-time baseline model updating.`);
    setTimeout(() => setScenarioNotification(null), 4000);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Simulation Feedback Alert */}
      {scenarioNotification && (
        <div className="bg-[#AE2448] text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between shadow-lg animate-fade-in border border-white/20">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-[#D5E7B5] animate-spin" />
            <span>{scenarioNotification}</span>
          </div>
          <button onClick={() => setScenarioNotification(null)} className="text-white/80 hover:text-white">✕</button>
        </div>
      )}

      {/* Top Clinical Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Monitored Card */}
        <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-200/80 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Monitored</p>
            <h3 className="text-2xl font-black text-[#6E1A37] mt-0.5">{totalPatients} Patients</h3>
            <p className="text-xs text-slate-500 mt-1 flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-[#72BAA9]"></span>
              <span>Across 6 Indian States</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#6E1A37]/10 flex items-center justify-center text-[#6E1A37]">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        {/* Critical & High Risk Triage Card */}
        <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-200/80 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Triage Priority</p>
            <div className="flex items-baseline space-x-2 mt-0.5">
              <span className="text-2xl font-black text-[#AE2448]">{criticalCount} Critical</span>
              <span className="text-xs font-semibold text-slate-500">/ {highRiskCount} High</span>
            </div>
            <p className="text-xs text-[#AE2448] font-medium mt-1 flex items-center space-x-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Requires clinical action</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#AE2448]/10 flex items-center justify-center text-[#AE2448]">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Active Smart Alerts Card */}
        <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-200/80 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Smart Alerts Active</p>
            <h3 className="text-2xl font-black text-[#AE2448] mt-0.5">{activeAlertsCount} Anomalies</h3>
            <p className="text-xs text-slate-500 mt-1 flex items-center space-x-1">
              <span className="text-[#72BAA9] font-bold">-68%</span>
              <span>false alarms vs static limits</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#D5E7B5]/30 flex items-center justify-center text-[#6E1A37]">
            <Cpu className="w-6 h-6" />
          </div>
        </div>

        {/* Telemetry Gateway Health Card */}
        <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-200/80 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">IoT Gateway (India)</p>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#72BAA9] animate-pulse"></span>
              <h3 className="text-lg font-bold text-slate-800">MQTT Live</h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              AES-256 • ABDM Encrypted
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#72BAA9]/10 flex items-center justify-center text-[#72BAA9]">
            <Radio className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Quick Test / Anomaly Injection Strip (For testing & demonstration) */}
      <div className="bg-gradient-to-r from-[#6E1A37] to-[#AE2448] rounded-2xl p-4 text-white shadow-card">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-[#D5E7B5]" />
              <h4 className="font-bold text-sm">Interactive Anomaly & Baseline Simulator</h4>
              <span className="text-[10px] bg-black/20 text-[#D5E7B5] px-2 py-0.5 rounded-full font-mono">
                Real-Time Testbed
              </span>
            </div>
            <p className="text-xs text-white/80 mt-0.5">
              Trigger clinical scenarios to test how the personalized baseline flags subtle trends vs sudden emergencies:
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleScenarioClick('pat-001', 'HYPERTENSIVE_CRISIS', 'Rameshwar')}
              className="bg-white/10 hover:bg-white/20 text-xs px-2.5 py-1.5 rounded-lg font-medium border border-white/20 transition-all flex items-center space-x-1"
            >
              <span>⚡ BP Surge (Rameshwar)</span>
            </button>
            <button
              onClick={() => handleScenarioClick('pat-002', 'HYPERGLYCEMIC_SPIKE', 'Sunita')}
              className="bg-white/10 hover:bg-white/20 text-xs px-2.5 py-1.5 rounded-lg font-medium border border-white/20 transition-all flex items-center space-x-1"
            >
              <span>🍬 Glucose Spike (Sunita)</span>
            </button>
            <button
              onClick={() => handleScenarioClick('pat-003', 'RESPIRATORY_DESATURATION', 'Gurpreet')}
              className="bg-white/10 hover:bg-white/20 text-xs px-2.5 py-1.5 rounded-lg font-medium border border-white/20 transition-all flex items-center space-x-1"
            >
              <span>🫁 Hypoxia Drop (Gurpreet)</span>
            </button>
            <button
              onClick={() => handleScenarioClick('pat-006', 'HYPOGLYCEMIC_CRASH', 'Fatima')}
              className="bg-white/10 hover:bg-white/20 text-xs px-2.5 py-1.5 rounded-lg font-medium border border-white/20 transition-all flex items-center space-x-1"
            >
              <span>📉 Hypo Crash (Fatima)</span>
            </button>
            <button
              onClick={() => handleScenarioClick(selectedPatient.id, 'NORMAL_CIRCADIAN', selectedPatient.name)}
              className="bg-[#72BAA9] text-[#6E1A37] hover:bg-[#8acbbe] text-xs px-2.5 py-1.5 rounded-lg font-bold border border-white/40 transition-all flex items-center space-x-1"
            >
              <span>✓ Reset to Baseline</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Split: Left = Patient Triage Queue | Right = Selected Patient Telemetry & Baseline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Patient Triage Queue (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Filters & Search Bar */}
          <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-200/80 space-y-3">
            
            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by patient name, ABHA ID, state or diagnosis..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#ECECEC]/70 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#72BAA9] border border-slate-200"
                />
              </div>

              {/* Triage Tier Filter Chips */}
              <div className="flex items-center space-x-1 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                {(['ALL', 'CRITICAL', 'HIGH', 'MODERATE', 'STABLE'] as const).map((tier) => (
                  <button
                    key={tier}
                    onClick={() => setTierFilter(tier)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap ${
                      tierFilter === tier
                        ? tier === 'CRITICAL'
                          ? 'bg-[#AE2448] text-white'
                          : tier === 'HIGH'
                          ? 'bg-[#6E1A37] text-white'
                          : tier === 'STABLE'
                          ? 'bg-[#72BAA9] text-white'
                          : 'bg-slate-800 text-white'
                        : 'bg-[#ECECEC] text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tier}
                  </button>
                ))}
              </div>
            </div>

            {/* Condition Filters */}
            <div className="flex items-center space-x-2 text-xs overflow-x-auto pt-1">
              <span className="text-slate-400 font-semibold text-[11px] uppercase flex items-center">
                <Filter className="w-3 h-3 mr-1" />
                Condition:
              </span>
              {[
                { label: 'All Conditions', val: 'ALL' },
                { label: 'Hypertension', val: 'Hypertension' },
                { label: 'Diabetes', val: 'Diabetes' },
                { label: 'Heart Failure', val: 'Heart Failure' },
                { label: 'COPD', val: 'COPD' }
              ].map(item => (
                <button
                  key={item.val}
                  onClick={() => setConditionFilter(item.val)}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors whitespace-nowrap ${
                    conditionFilter === item.val
                      ? 'bg-[#6E1A37] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

          </div>

          {/* Patient Cards List */}
          <div className="space-y-3">
            {filteredPatients.map((patient) => {
              const isSelected = selectedPatient.id === patient.id;
              const hasAlerts = patient.activeAlerts.length > 0;

              return (
                <div
                  key={patient.id}
                  onClick={() => setSelectedPatient(patient)}
                  className={`bg-white rounded-2xl p-4 shadow-card border transition-all cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? 'border-[#6E1A37] ring-2 ring-[#6E1A37]/20 bg-slate-50/50'
                      : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                  }`}
                >
                  {/* Left Border accent based on Risk Tier */}
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                      patient.riskTier === 'CRITICAL'
                        ? 'bg-[#AE2448]'
                        : patient.riskTier === 'HIGH'
                        ? 'bg-[#6E1A37]'
                        : patient.riskTier === 'MODERATE'
                        ? 'bg-amber-500'
                        : 'bg-[#72BAA9]'
                    }`}
                  />

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    
                    {/* Patient Core Info */}
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 rounded-full bg-[#6E1A37]/10 flex items-center justify-center font-bold text-[#6E1A37] text-sm shrink-0 border border-[#6E1A37]/20">
                        {patient.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-extrabold text-sm text-slate-900">{patient.name}</h4>
                          <span className="text-xs text-slate-500">({patient.age}y, {patient.gender})</span>
                          <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                            patient.riskTier === 'CRITICAL'
                              ? 'bg-[#AE2448] text-white animate-pulse'
                              : patient.riskTier === 'HIGH'
                              ? 'bg-[#6E1A37] text-white'
                              : patient.riskTier === 'MODERATE'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-[#D5E7B5] text-[#6E1A37]'
                          }`}>
                            {patient.riskTier} • Risk {patient.riskScore}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 font-medium mt-0.5 flex items-center space-x-2">
                          <span>{patient.primaryDiagnosis}</span>
                          <span className="text-slate-300">•</span>
                          <span className="flex items-center text-slate-400 text-[11px]">
                            <MapPin className="w-3 h-3 mr-0.5 text-slate-400" />
                            {patient.district}, {patient.state}
                          </span>
                        </p>

                        <div className="flex items-center space-x-2 mt-1 text-[11px] text-slate-400 font-mono">
                          <span>ABHA: {patient.abhaId}</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Launch Buttons */}
                    <div className="flex items-center space-x-2 self-end sm:self-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPatient(patient);
                          onStartTeleconsult(patient);
                        }}
                        className="bg-[#AE2448] hover:bg-[#8b2447] text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-sm transition-all flex items-center space-x-1.5"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Teleconsult</span>
                      </button>

                      <div className="text-slate-400 hover:text-[#6E1A37] p-1">
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    </div>

                  </div>

                  {/* Real-Time Live Vitals Badges */}
                  <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-5 gap-2">
                    
                    {/* Blood Pressure */}
                    <div className={`p-2 rounded-xl text-center border ${
                      patient.currentVitals.systolic >= 160
                        ? 'bg-[#AE2448]/10 border-[#AE2448]/40 text-[#AE2448]'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}>
                      <p className="text-[10px] uppercase font-bold text-slate-400">BP (mmHg)</p>
                      <p className="font-extrabold text-xs mt-0.5">
                        {patient.currentVitals.systolic}/{patient.currentVitals.diastolic}
                      </p>
                    </div>

                    {/* Heart Rate */}
                    <div className={`p-2 rounded-xl text-center border ${
                      patient.currentVitals.heartRate > 105
                        ? 'bg-[#AE2448]/10 border-[#AE2448]/40 text-[#AE2448]'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}>
                      <p className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-center space-x-1">
                        <Heart className="w-2.5 h-2.5 text-[#AE2448]" />
                        <span>Pulse</span>
                      </p>
                      <p className="font-extrabold text-xs mt-0.5">
                        {patient.currentVitals.heartRate} bpm
                      </p>
                    </div>

                    {/* SpO2 */}
                    <div className={`p-2 rounded-xl text-center border ${
                      patient.currentVitals.spO2 < 93
                        ? 'bg-[#AE2448]/10 border-[#AE2448]/40 text-[#AE2448]'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}>
                      <p className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-center space-x-1">
                        <Wind className="w-2.5 h-2.5 text-[#72BAA9]" />
                        <span>SpO2</span>
                      </p>
                      <p className="font-extrabold text-xs mt-0.5">
                        {patient.currentVitals.spO2}%
                      </p>
                    </div>

                    {/* Blood Glucose */}
                    <div className={`p-2 rounded-xl text-center border ${
                      patient.currentVitals.glucose > 240 || patient.currentVitals.glucose < 65
                        ? 'bg-[#AE2448]/10 border-[#AE2448]/40 text-[#AE2448]'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}>
                      <p className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-center space-x-1">
                        <Droplets className="w-2.5 h-2.5 text-[#6E1A37]" />
                        <span>Glucose</span>
                      </p>
                      <p className="font-extrabold text-xs mt-0.5">
                        {patient.currentVitals.glucose} mg/dL
                      </p>
                    </div>

                    {/* Body Temp */}
                    <div className={`p-2 rounded-xl text-center border ${
                      patient.currentVitals.temperature >= 38.0
                        ? 'bg-[#AE2448]/10 border-[#AE2448]/40 text-[#AE2448]'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}>
                      <p className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-center space-x-1">
                        <Thermometer className="w-2.5 h-2.5 text-orange-500" />
                        <span>Temp</span>
                      </p>
                      <p className="font-extrabold text-xs mt-0.5">
                        {patient.currentVitals.temperature} °C
                      </p>
                    </div>

                  </div>

                  {/* Active Alert Banner if triggered */}
                  {hasAlerts && (
                    <div className="mt-2.5 p-2.5 rounded-xl bg-[#AE2448]/10 border border-[#AE2448]/25 text-xs text-[#AE2448] flex items-start space-x-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-bold">{patient.activeAlerts[0].message}</p>
                        <p className="text-[11px] text-slate-600 mt-0.5">{patient.activeAlerts[0].clinicalAdvice}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAcknowledgeAlert(patient.activeAlerts[0].id);
                        }}
                        className="text-[10px] font-bold bg-[#AE2448] text-white px-2 py-1 rounded-md hover:bg-[#8b2447] shrink-0"
                      >
                        Acknowledge
                      </button>
                    </div>
                  )}

                </div>
              );
            })}
          </div>

        </div>

        {/* Right Column: Selected Patient Clinical Inspector & Detail Drawer (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Patient Overview Header Card */}
          <div className="bg-white rounded-2xl p-5 shadow-card border border-slate-200 space-y-4">
            
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Patient Detail</span>
                <h3 className="text-xl font-black text-[#6E1A37]">{selectedPatient.name}</h3>
                <p className="text-xs text-slate-500">{selectedPatient.primaryDiagnosis} • Age {selectedPatient.age}</p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onStartTeleconsult(selectedPatient)}
                  className="bg-[#6E1A37] hover:bg-[#8b2447] text-white text-xs font-bold px-3 py-2 rounded-xl shadow-md transition-all flex items-center space-x-1.5"
                >
                  <Video className="w-4 h-4 text-[#D5E7B5]" />
                  <span>Start Teleconsult</span>
                </button>
              </div>
            </div>

            {/* Sub-Tab Navigation for Selected Patient */}
            <div className="flex items-center space-x-1 border-b border-slate-200 pb-2">
              {[
                { id: 'trends', label: 'Telemetry Trends' },
                { id: 'baseline', label: 'Personal Baseline' },
                { id: 'devices', label: 'Connected Devices' },
                { id: 'alerts', label: `Alerts (${selectedPatient.activeAlerts.length})` }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-[#6E1A37] text-white'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content Based on Selected Sub-tab */}
            {activeTab === 'trends' && (
              <div className="space-y-4">
                <VitalsChart patient={selectedPatient} />
                <div className="bg-[#ECECEC]/60 p-3 rounded-xl border border-slate-200 text-xs">
                  <p className="font-bold text-[#6E1A37]">Composite Risk Assessment</p>
                  <p className="text-slate-600 mt-0.5">{selectedPatient.riskExplanation}</p>
                </div>
              </div>
            )}

            {activeTab === 'baseline' && (
              <div className="space-y-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <h4 className="text-xs font-bold text-[#6E1A37] mb-1">
                    How Personalized Baselines Protect Patients in India:
                  </h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Unlike standard hospital software that relies solely on fixed generic thresholds (e.g., 140 mmHg systolic for all adults),
                    TELMED continually models {selectedPatient.name}'s individual Gaussian distribution and circadian rhythm.
                    This flags statistically significant upward drifts (+2.5σ) before an emergency occurs, while avoiding false alarms for chronic states.
                  </p>
                </div>

                {/* Baseline Matrix */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl border border-slate-200 bg-white">
                    <p className="text-slate-400 font-bold text-[10px] uppercase">Systolic Baseline</p>
                    <p className="font-extrabold text-sm text-[#AE2448] mt-0.5">
                      {selectedPatient.baseline.systolic.mean} ± {selectedPatient.baseline.systolic.std} mmHg
                    </p>
                    <p className="text-[10px] text-slate-500">Safe: {selectedPatient.baseline.systolic.minSafe}-{selectedPatient.baseline.systolic.maxSafe} mmHg</p>
                  </div>

                  <div className="p-2.5 rounded-xl border border-slate-200 bg-white">
                    <p className="text-slate-400 font-bold text-[10px] uppercase">Diastolic Baseline</p>
                    <p className="font-extrabold text-sm text-[#72BAA9] mt-0.5">
                      {selectedPatient.baseline.diastolic.mean} ± {selectedPatient.baseline.diastolic.std} mmHg
                    </p>
                    <p className="text-[10px] text-slate-500">Safe: {selectedPatient.baseline.diastolic.minSafe}-{selectedPatient.baseline.diastolic.maxSafe} mmHg</p>
                  </div>

                  <div className="p-2.5 rounded-xl border border-slate-200 bg-white">
                    <p className="text-slate-400 font-bold text-[10px] uppercase">Resting Pulse</p>
                    <p className="font-extrabold text-sm text-slate-800 mt-0.5">
                      {selectedPatient.baseline.heartRate.mean} ± {selectedPatient.baseline.heartRate.std} bpm
                    </p>
                    <p className="text-[10px] text-slate-500">Safe: {selectedPatient.baseline.heartRate.minSafe}-{selectedPatient.baseline.heartRate.maxSafe} bpm</p>
                  </div>

                  <div className="p-2.5 rounded-xl border border-slate-200 bg-white">
                    <p className="text-slate-400 font-bold text-[10px] uppercase">Glucose Target</p>
                    <p className="font-extrabold text-sm text-[#6E1A37] mt-0.5">
                      {selectedPatient.baseline.glucose.mean} ± {selectedPatient.baseline.glucose.std} mg/dL
                    </p>
                    <p className="text-[10px] text-slate-500">Safe: {selectedPatient.baseline.glucose.minSafe}-{selectedPatient.baseline.glucose.maxSafe} mg/dL</p>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="bg-[#ECECEC] p-3 rounded-xl text-xs space-y-1">
                  <p className="font-bold text-slate-800 flex items-center space-x-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#AE2448]" />
                    <span>Emergency Contact ({selectedPatient.emergencyContact.relation})</span>
                  </p>
                  <p className="text-slate-700 font-medium">{selectedPatient.emergencyContact.name}: {selectedPatient.emergencyContact.phone}</p>
                </div>
              </div>
            )}

            {activeTab === 'devices' && (
              <div className="space-y-2">
                <p className="text-xs text-slate-500">Connected Wearable & Home IoT Devices:</p>
                {selectedPatient.devices.map(device => (
                  <div key={device.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-800">{device.name}</p>
                      <p className="text-[11px] text-slate-400 font-mono">SN: {device.serialNo} • FW: {device.firmware}</p>
                      <p className="text-[11px] text-[#72BAA9] font-medium mt-0.5">Last synced: {device.lastSync}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#D5E7B5] text-[#6E1A37]">
                        Battery {device.battery}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'alerts' && (
              <div className="space-y-2">
                {selectedPatient.activeAlerts.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-xs">
                    <CheckCircle2 className="w-8 h-8 text-[#72BAA9] mx-auto mb-2 opacity-80" />
                    No active unacknowledged alerts. Patient is stable.
                  </div>
                ) : (
                  selectedPatient.activeAlerts.map(alert => (
                    <div key={alert.id} className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-[#AE2448] uppercase tracking-wider text-[10px]">
                          {alert.severity} • {alert.metric}
                        </span>
                        <span className="text-[10px] text-slate-400">{alert.timestamp}</span>
                      </div>
                      <p className="font-bold text-slate-800">{alert.message}</p>
                      <p className="text-slate-600 text-[11px]">{alert.clinicalAdvice}</p>
                      <div className="pt-2 flex items-center justify-between border-t border-red-100">
                        <span className="text-[11px] font-mono text-slate-500">Z-Score: +{alert.zScore}σ</span>
                        <button
                          onClick={() => onAcknowledgeAlert(alert.id)}
                          className="text-[11px] font-bold bg-[#AE2448] text-white px-2.5 py-1 rounded-lg hover:bg-[#8b2447]"
                        >
                          Acknowledge
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Quick Actions Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => onViewPrescription(selectedPatient)}
                className="text-xs font-bold text-[#6E1A37] hover:underline flex items-center space-x-1"
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>View Latest E-Prescription</span>
              </button>

              <span className="text-[11px] text-slate-400 font-mono">
                Consent: {selectedPatient.consent.status}
              </span>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
