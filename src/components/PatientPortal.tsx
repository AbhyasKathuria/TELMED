import React, { useState } from 'react';
import type {
  Patient,
  VitalReading,
  Prescription
} from '../types';
import {
  Heart,
  Activity,
  Droplets,
  Wind,
  PhoneCall,
  PlusCircle,
  FileText,
  Battery,
  CheckCircle2,
  Lock,
  Video
} from 'lucide-react';

interface PatientPortalProps {
  patient: Patient;
  onLogManualVitals: (reading: VitalReading) => void;
  onOpenConsult: () => void;
  onViewPrescription: (prescription: Prescription) => void;
}

export const PatientPortal: React.FC<PatientPortalProps> = ({
  patient,
  onLogManualVitals,
  onOpenConsult,
  onViewPrescription
}) => {
  const [showLogModal, setShowLogModal] = useState(false);
  const [showSosModal, setShowSosModal] = useState(false);
  const [sosDispatched, setSosDispatched] = useState(false);

  // Manual log inputs
  const [manualSys, setManualSys] = useState('130');
  const [manualDia, setManualDia] = useState('82');
  const [manualHr, setManualHr] = useState('74');
  const [manualGlu, setManualGlu] = useState('118');
  const [manualSpo2, setManualSpo2] = useState('98');
  const [manualTemp, setManualTemp] = useState('36.6');

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const reading: VitalReading = {
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
      systolic: parseInt(manualSys) || 120,
      diastolic: parseInt(manualDia) || 80,
      heartRate: parseInt(manualHr) || 72,
      glucose: parseInt(manualGlu) || 110,
      spO2: parseFloat(manualSpo2) || 98,
      temperature: parseFloat(manualTemp) || 36.6,
      source: 'Manual Log'
    };

    onLogManualVitals(reading);
    setShowLogModal(false);
  };

  const handleTriggerSos = () => {
    setSosDispatched(true);
    setTimeout(() => {
      setShowSosModal(false);
      setSosDispatched(false);
    }, 4000);
  };

  const isAtRisk = patient.riskTier === 'CRITICAL' || patient.riskTier === 'HIGH';

  return (
    <div className="space-y-6 pb-12">
      
      {/* Patient Welcome & 24/7 Monitoring Status */}
      <div className={`p-6 rounded-3xl shadow-card text-white relative overflow-hidden ${
        isAtRisk
          ? 'bg-gradient-to-r from-[#6E1A37] via-[#AE2448] to-[#6E1A37]'
          : 'bg-gradient-to-r from-[#6E1A37] to-[#72BAA9]'
      }`}>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs bg-[#D5E7B5] text-[#6E1A37] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                Patient Portal
              </span>
              <span className="text-xs text-white/80 font-mono">
                ABHA ID: {patient.abhaId}
              </span>
            </div>
            <h1 className="text-2xl font-black mt-2">Namaste, {patient.name}</h1>
            <p className="text-sm text-white/90 mt-1 max-w-xl">
              Your chronic condition (<span className="font-semibold">{patient.primaryDiagnosis}</span>) is under continuous 24/7 monitoring by {patient.primaryDoctor}.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowLogModal(true)}
              className="bg-white text-[#6E1A37] hover:bg-slate-100 px-4 py-2.5 rounded-2xl font-bold text-xs shadow-md transition-all flex items-center space-x-2"
            >
              <PlusCircle className="w-4 h-4 text-[#AE2448]" />
              <span>Log Manual Reading</span>
            </button>

            <button
              onClick={() => setShowSosModal(true)}
              className="bg-[#AE2448] hover:bg-[#8b2447] text-white border-2 border-white/30 px-4 py-2.5 rounded-2xl font-black text-xs shadow-xl transition-all flex items-center space-x-2 animate-radar"
            >
              <PhoneCall className="w-4 h-4 text-white" />
              <span>EMERGENCY SOS (108)</span>
            </button>
          </div>
        </div>

        {/* Health Traffic Light Indicator */}
        <div className="mt-5 pt-4 border-t border-white/20 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <span className={`w-3.5 h-3.5 rounded-full ${isAtRisk ? 'bg-[#AE2448] animate-ping' : 'bg-[#D5E7B5]'}`}></span>
            <span className="font-bold">
              Current Health Status: {isAtRisk ? 'Clinical Alert Active - Doctor Reviewing' : 'All Vitals in Safe Range'}
            </span>
          </div>
          <span className="text-white/80">
            Last Reading: {patient.currentVitals.timestamp} ({patient.currentVitals.source})
          </span>
        </div>
      </div>

      {/* Main Grid: Live Vitals Cards & Prescribed Medicines */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Current Readings & Devices (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          
          <div className="bg-white rounded-3xl p-5 shadow-card border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-slate-900 text-sm flex items-center space-x-2">
                <Activity className="w-4 h-4 text-[#AE2448]" />
                <span>My Live Vitals Today</span>
              </h3>
              <span className="text-xs text-[#72BAA9] font-bold flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-[#72BAA9] animate-pulse"></span>
                <span>Live Cloud Sync</span>
              </span>
            </div>

            {/* 4 Big Vitals Display Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              
              {/* BP */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                <p className="text-[11px] font-bold text-slate-400 uppercase">Blood Pressure</p>
                <p className={`text-xl font-black mt-1 ${
                  patient.currentVitals.systolic >= 150 ? 'text-[#AE2448]' : 'text-slate-900'
                }`}>
                  {patient.currentVitals.systolic}/{patient.currentVitals.diastolic}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">mmHg</p>
                <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#D5E7B5] text-[#6E1A37]">
                  Target: {patient.baseline.systolic.mean}/{patient.baseline.diastolic.mean}
                </span>
              </div>

              {/* Heart Rate */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                <p className="text-[11px] font-bold text-slate-400 uppercase flex items-center justify-center space-x-1">
                  <Heart className="w-3 h-3 text-[#AE2448] animate-heart-pulse" />
                  <span>Pulse</span>
                </p>
                <p className="text-xl font-black text-slate-900 mt-1">
                  {patient.currentVitals.heartRate}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">bpm</p>
                <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#D5E7B5] text-[#6E1A37]">
                  Baseline: {patient.baseline.heartRate.mean}
                </span>
              </div>

              {/* SpO2 */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                <p className="text-[11px] font-bold text-slate-400 uppercase flex items-center justify-center space-x-1">
                  <Wind className="w-3 h-3 text-[#72BAA9]" />
                  <span>Oxygen</span>
                </p>
                <p className={`text-xl font-black mt-1 ${
                  patient.currentVitals.spO2 < 93 ? 'text-[#AE2448]' : 'text-slate-900'
                }`}>
                  {patient.currentVitals.spO2}%
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">SpO2</p>
                <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#D5E7B5] text-[#6E1A37]">
                  Safe: &gt;94%
                </span>
              </div>

              {/* Glucose */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                <p className="text-[11px] font-bold text-slate-400 uppercase flex items-center justify-center space-x-1">
                  <Droplets className="w-3 h-3 text-[#6E1A37]" />
                  <span>Sugar</span>
                </p>
                <p className={`text-xl font-black mt-1 ${
                  patient.currentVitals.glucose > 200 || patient.currentVitals.glucose < 65
                    ? 'text-[#AE2448]'
                    : 'text-slate-900'
                }`}>
                  {patient.currentVitals.glucose}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">mg/dL</p>
                <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#D5E7B5] text-[#6E1A37]">
                  Target: &lt;160
                </span>
              </div>

            </div>

            {/* Health Tip / Clinical Guidance Banner */}
            <div className="p-3.5 rounded-2xl bg-[#ECECEC] border border-slate-200 text-xs text-slate-700 flex items-start space-x-3">
              <CheckCircle2 className="w-5 h-5 text-[#72BAA9] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-[#6E1A37]">Doctor's Instructions For Today:</p>
                <p className="mt-0.5 leading-relaxed">
                  "Please ensure you take your morning tablet with lukewarm water after breakfast.
                  Avoid excess salt and pickles in food. If you experience headache or chest heaviness, press the Emergency SOS or call clinic immediately."
                </p>
              </div>
            </div>

          </div>

          {/* Connected Home & Wearable Devices */}
          <div className="bg-white rounded-3xl p-5 shadow-card border border-slate-200 space-y-3">
            <h3 className="font-black text-slate-900 text-sm">My Connected Monitoring Devices</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {patient.devices.map(dev => (
                <div key={dev.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-extrabold text-slate-800">{dev.name}</p>
                    <p className="text-[11px] text-[#72BAA9] font-semibold mt-0.5">Connected • Synced {dev.lastSync}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {dev.serialNo}</p>
                  </div>
                  <div className="flex items-center space-x-1 text-slate-600 bg-white px-2 py-1 rounded-lg border border-slate-200 text-[11px] font-bold">
                    <Battery className="w-3.5 h-3.5 text-[#72BAA9]" />
                    <span>{dev.battery}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right: Prescriptions & Caregiver Hub (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Active Medicines Timetable Card */}
          <div className="bg-white rounded-3xl p-5 shadow-card border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-slate-900 text-sm flex items-center space-x-2">
                <FileText className="w-4 h-4 text-[#6E1A37]" />
                <span>My Active Prescription & Timetable</span>
              </h3>
              {patient.prescriptions[0] && (
                <button
                  onClick={() => onViewPrescription(patient.prescriptions[0])}
                  className="text-xs text-[#AE2448] font-bold hover:underline flex items-center space-x-1"
                >
                  <span>View Full Rx</span>
                </button>
              )}
            </div>

            {patient.prescriptions[0] ? (
              <div className="space-y-3">
                <div className="space-y-2">
                  {patient.prescriptions[0].medications.map(med => (
                    <div key={med.id} className="p-3 rounded-2xl bg-[#ECECEC]/60 border border-slate-200 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-[#6E1A37] text-xs">{med.name}</span>
                        <span className="text-[10px] font-bold bg-[#D5E7B5] text-[#6E1A37] px-2 py-0.5 rounded-full">
                          {med.duration}
                        </span>
                      </div>
                      <p className="font-bold text-slate-800 mt-1">Dosage: {med.dosage} • {med.frequency}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{med.instructions}</p>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <p className="font-bold text-slate-800">Dietary Advice:</p>
                  <p className="text-slate-600 text-[11px]">{patient.prescriptions[0].dietaryAdvice}</p>
                  <p className="font-bold text-slate-800 pt-1">Next Follow-Up Date:</p>
                  <p className="text-[#AE2448] font-bold text-xs">{patient.prescriptions[0].nextReviewDate}</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">No active prescriptions available.</p>
            )}

            <button
              onClick={onOpenConsult}
              className="w-full bg-[#6E1A37] hover:bg-[#8b2447] text-white text-xs font-bold py-2.5 rounded-2xl transition-all shadow-md flex items-center justify-center space-x-2"
            >
              <Video className="w-4 h-4 text-[#D5E7B5]" />
              <span>Connect with Doctor Now</span>
            </button>
          </div>

          {/* Privacy & ABDM Consent Status Card */}
          <div className="bg-white rounded-3xl p-5 shadow-card border border-slate-200 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 flex items-center space-x-1.5">
                <Lock className="w-4 h-4 text-[#72BAA9]" />
                <span>Your Data Privacy & Consent (ABDM)</span>
              </h4>
              <span className="bg-[#D5E7B5] text-[#6E1A37] font-extrabold text-[10px] px-2 py-0.5 rounded-full">
                Protected
              </span>
            </div>

            <p className="text-slate-600 text-[11px]">
              You have complete ownership of your health telemetry. Only your assigned doctor at {patient.consent.hospitalPartner} has authorization to view your vitals.
            </p>

            <div className="bg-[#ECECEC] p-3 rounded-xl font-mono text-[10px] text-slate-600 space-y-0.5">
              <p>Consent ID: {patient.consent.consentId}</p>
              <p>Valid Through: {patient.consent.expiryDate}</p>
              <p>Encryption: AES-256-GCM / TLS 1.3</p>
            </div>
          </div>

        </div>

      </div>

      {/* Manual Reading Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 animate-scale-in">
            <h3 className="text-lg font-black text-[#6E1A37] mb-1">Log Today's Vitals Manually</h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter readings taken via your home blood pressure machine, glucometer, or thermometer:
            </p>

            <form onSubmit={handleManualSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Systolic BP (mmHg)</label>
                  <input
                    type="number"
                    value={manualSys}
                    onChange={(e) => setManualSys(e.target.value)}
                    className="w-full bg-[#ECECEC] rounded-xl px-3 py-2 font-bold text-slate-800 border border-slate-200"
                    placeholder="e.g. 130"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Diastolic BP (mmHg)</label>
                  <input
                    type="number"
                    value={manualDia}
                    onChange={(e) => setManualDia(e.target.value)}
                    className="w-full bg-[#ECECEC] rounded-xl px-3 py-2 font-bold text-slate-800 border border-slate-200"
                    placeholder="e.g. 82"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Heart Rate (bpm)</label>
                  <input
                    type="number"
                    value={manualHr}
                    onChange={(e) => setManualHr(e.target.value)}
                    className="w-full bg-[#ECECEC] rounded-xl px-3 py-2 font-bold text-slate-800 border border-slate-200"
                    placeholder="e.g. 74"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Blood Glucose (mg/dL)</label>
                  <input
                    type="number"
                    value={manualGlu}
                    onChange={(e) => setManualGlu(e.target.value)}
                    className="w-full bg-[#ECECEC] rounded-xl px-3 py-2 font-bold text-slate-800 border border-slate-200"
                    placeholder="e.g. 120"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Oxygen SpO2 (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={manualSpo2}
                    onChange={(e) => setManualSpo2(e.target.value)}
                    className="w-full bg-[#ECECEC] rounded-xl px-3 py-2 font-bold text-slate-800 border border-slate-200"
                    placeholder="e.g. 98"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Body Temp (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={manualTemp}
                    onChange={(e) => setManualTemp(e.target.value)}
                    className="w-full bg-[#ECECEC] rounded-xl px-3 py-2 font-bold text-slate-800 border border-slate-200"
                    placeholder="e.g. 36.6"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#6E1A37] hover:bg-[#8b2447] font-bold text-white shadow-md"
                >
                  Save & Sync Vitals
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Emergency SOS Modal */}
      {showSosModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border-2 border-[#AE2448] text-center">
            
            {sosDispatched ? (
              <div className="space-y-4 py-4 animate-scale-in">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-black text-slate-900">Emergency Dispatched!</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  108 Ambulance service and Dr. Vikram Malhotra have been alerted with your live GPS location ({patient.district}, {patient.state}) and latest vitals.
                  Emergency Contact ({patient.emergencyContact.name}) is notified via SMS.
                </p>
                <p className="text-[11px] font-bold text-[#AE2448]">Keep phone line clear. Stay calm.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-full bg-red-100 text-[#AE2448] flex items-center justify-center mx-auto animate-bounce">
                  <PhoneCall className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-[#AE2448]">Confirm Emergency SOS Trigger</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Are you or the patient experiencing acute symptoms (severe chest pain, shortness of breath, loss of consciousness)?
                  Pressing confirm will immediately alert the nearest hospital triage center and dispatch 108 emergency services.
                </p>
                <div className="flex items-center space-x-3 pt-2">
                  <button
                    onClick={() => setShowSosModal(false)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-xs text-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleTriggerSos}
                    className="flex-1 py-2.5 rounded-xl bg-[#AE2448] hover:bg-[#8b2447] font-bold text-xs text-white shadow-xl"
                  >
                    Yes, Dispatch SOS
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
