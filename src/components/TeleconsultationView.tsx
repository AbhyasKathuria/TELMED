import React, { useState, useEffect, useRef } from 'react';
import type {
  Patient,
  VitalReading,
  MedicationItem,
  Prescription
} from '../types';
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  Heart,
  Wind,
  Droplets,
  Activity,
  Send,
  FilePlus,
  Trash2,
  ShieldCheck,
  Radio,
  Wifi,
  AlertTriangle
} from 'lucide-react';

interface TeleconsultationViewProps {
  patient: Patient;
  onEndCall: () => void;
  onIssuePrescription: (prescription: Prescription) => void;
  lowBandwidthMode: boolean;
  setLowBandwidthMode: (mode: boolean) => void;
}

interface ChatMessage {
  id: string;
  sender: 'DOCTOR' | 'PATIENT' | 'SYSTEM';
  text: string;
  time: string;
  vitalSnapshot?: VitalReading;
}

export const TeleconsultationView: React.FC<TeleconsultationViewProps> = ({
  patient,
  onEndCall,
  onIssuePrescription,
  lowBandwidthMode,
  setLowBandwidthMode
}) => {
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [callDuration, setCallDuration] = useState(145);
  const [activeTab, setActiveTab] = useState<'rx' | 'chat' | 'history'>('rx');
  const [useRealWebcam, setUseRealWebcam] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'SYSTEM',
      text: `Encrypted teleconsultation session established with ${patient.name} (${patient.district}, ${patient.state}) under ABDM consent ID: ${patient.consent.consentId}.`,
      time: '10:30 PM'
    },
    {
      id: 'msg-2',
      sender: 'DOCTOR',
      text: `Namaste ${patient.name} ji, I observed your blood pressure spiked to ${patient.currentVitals.systolic}/${patient.currentVitals.diastolic} mmHg on your smart cuff. How are you feeling right now? Any headache or dizziness?`,
      time: '10:31 PM'
    },
    {
      id: 'msg-3',
      sender: 'PATIENT',
      text: `Namaste Doctor sahab. Yes, I had some mild heaviness in the back of my head after dinner. I checked my BP twice and both times it was showing high.`,
      time: '10:32 PM'
    }
  ]);
  const [inputText, setInputText] = useState('');

  // Prescription Form State
  const [diagnosis, setDiagnosis] = useState(patient.primaryDiagnosis + ' - Acute Episode');
  const [medications, setMedications] = useState<MedicationItem[]>([
    {
      id: 'rx-m1',
      name: 'Amlodipine 5mg',
      dosage: '5 mg',
      frequency: '0-0-1 (Night, after food)',
      duration: '30 Days',
      instructions: 'Take immediately tonight to assist with blood pressure stabilization.'
    },
    {
      id: 'rx-m2',
      name: 'Telmisartan 40mg',
      dosage: '40 mg',
      frequency: '1-0-0 (Morning)',
      duration: '30 Days',
      instructions: 'Continue morning regimen strictly.'
    }
  ]);
  const [newMedName, setNewMedName] = useState('');
  const [newMedDosage, setNewMedDosage] = useState('');
  const [newMedFreq, setNewMedFreq] = useState('1-0-1 (After food)');
  const [dietAdvice, setDietAdvice] = useState('Strict low-sodium diet (<2g/day). Avoid salt in cooking tonight. Drink water.');
  const [lifestyleAdvice, setLifestyleAdvice] = useState('Rest in seated/semi-reclined position. Retest BP in 45 minutes.');
  const [prescriptionSuccess, setPrescriptionSuccess] = useState(false);

  // Call duration counter
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (useRealWebcam && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(err => {
          console.warn('Webcam permission not granted, defaulting to simulation:', err);
          setUseRealWebcam(false);
        });
    } else if (!useRealWebcam && videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  }, [useRealWebcam]);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    const newMsg: ChatMessage = {
      id: `chat-${Date.now()}`,
      sender: 'DOCTOR',
      text: inputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, newMsg]);
    setInputText('');

    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: `chat-reply-${Date.now()}`,
          sender: 'PATIENT',
          text: `Understood, Doctor sahab. I will follow this advice and take the tablet now.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 2000);
  };

  const handleAttachVitals = () => {
    const newMsg: ChatMessage = {
      id: `vitals-stamp-${Date.now()}`,
      sender: 'DOCTOR',
      text: `[Clinical Vitals Snapshot Attached to Session Record]`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      vitalSnapshot: { ...patient.currentVitals }
    };
    setMessages(prev => [...prev, newMsg]);
  };

  const handleAddMedication = () => {
    if (!newMedName.trim()) return;
    const item: MedicationItem = {
      id: `med-${Date.now()}`,
      name: newMedName.trim(),
      dosage: newMedDosage || 'Standard',
      frequency: newMedFreq,
      duration: '30 Days',
      instructions: 'Take as instructed'
    };
    setMedications([...medications, item]);
    setNewMedName('');
    setNewMedDosage('');
  };

  const handleRemoveMedication = (id: string) => {
    setMedications(medications.filter(m => m.id !== id));
  };

  const handleGeneratePrescription = () => {
    const newPrescription: Prescription = {
      id: `RX-IN-${Date.now()}`,
      patientId: patient.id,
      doctorName: 'Dr. Vikram Malhotra (MBBS, MD Cardiology)',
      doctorRegistration: 'MCI-38291',
      hospitalName: 'Apollo Telehealth Network, National Hub',
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      diagnosis,
      vitalsSnapshot: {
        bp: `${patient.currentVitals.systolic}/${patient.currentVitals.diastolic}`,
        hr: patient.currentVitals.heartRate,
        spo2: patient.currentVitals.spO2,
        glucose: patient.currentVitals.glucose,
        temp: patient.currentVitals.temperature
      },
      medications,
      dietaryAdvice: dietAdvice,
      lifestyleAdvice,
      nextReviewDate: 'In 7 Days',
      signedDigitalHash: 'SHA256-' + Math.random().toString(36).substring(2, 15)
    };

    onIssuePrescription(newPrescription);
    setPrescriptionSuccess(true);
    setTimeout(() => setPrescriptionSuccess(false), 4000);
  };

  return (
    <div className="space-y-4 pb-12">
      
      {/* Top Banner: Patient Context & Call Timer */}
      <div className="bg-[#6E1A37] text-white px-5 py-3 rounded-2xl shadow-card flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-[#AE2448] flex items-center justify-center font-black text-white text-sm border-2 border-white/20">
            {patient.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-black text-white">{patient.name}</h2>
              <span className="text-xs bg-[#D5E7B5] text-[#6E1A37] font-bold px-2 py-0.5 rounded-full">
                ABDM Verified
              </span>
            </div>
            <p className="text-xs text-white/80">
              {patient.primaryDiagnosis} • {patient.district}, {patient.state}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-black/30 px-3 py-1.5 rounded-xl border border-white/10">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-mono text-xs font-bold text-white tracking-widest">
              {formatTime(callDuration)}
            </span>
          </div>

          <button
            onClick={() => setLowBandwidthMode(!lowBandwidthMode)}
            className={`text-xs px-2.5 py-1.5 rounded-xl font-semibold border transition-all flex items-center space-x-1.5 ${
              lowBandwidthMode
                ? 'bg-[#72BAA9] text-[#6E1A37] border-white'
                : 'bg-white/10 text-white/80 border-white/20 hover:bg-white/20'
            }`}
          >
            <Wifi className="w-3.5 h-3.5" />
            <span>{lowBandwidthMode ? 'Rural 2G/3G Mode' : 'HD Mode'}</span>
          </button>

          <button
            onClick={onEndCall}
            className="bg-[#AE2448] hover:bg-[#8b2447] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center space-x-1.5 shadow-md"
          >
            <PhoneOff className="w-4 h-4" />
            <span>End Call</span>
          </button>
        </div>
      </div>

      {/* Main Split: Left = Video Stream & Live Vitals HUD | Right = Clinical E-Prescription & Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left Column: Video Feeds & Vitals HUD (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Main Video Screen Container */}
          <div className="relative bg-slate-950 rounded-3xl overflow-hidden aspect-video shadow-2xl border-2 border-slate-800 flex items-center justify-center">
            
            {/* Patient Video Simulation / Stream */}
            <div className="absolute inset-0 w-full h-full">
              {useRealWebcam ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 flex flex-col items-center justify-center relative">
                  <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-[#6E1A37] to-[#72BAA9] p-1 shadow-2xl animate-pulse">
                    <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-white font-black text-3xl">
                      {patient.name.split(' ').map(n => n[0]).join('')}
                    </div>
                  </div>
                  <p className="mt-4 text-white font-bold text-sm tracking-wide">{patient.name}</p>
                  <p className="text-slate-400 text-xs mt-0.5">Connected via Smart Gateway ({patient.state})</p>
                  <div className="flex items-center space-x-2 mt-2 bg-black/40 px-3 py-1 rounded-full text-[11px] text-[#72BAA9]">
                    <span className="w-2 h-2 rounded-full bg-[#72BAA9] animate-ping"></span>
                    <span>HD Telehealth Audio/Video Feed Active</span>
                  </div>
                </div>
              )}
            </div>

            {/* Doctor PIP Inset */}
            <div className="absolute top-4 right-4 w-36 h-24 rounded-2xl bg-slate-900 border-2 border-white/30 overflow-hidden shadow-2xl flex flex-col items-center justify-center text-white z-20">
              <div className="w-10 h-10 rounded-full bg-[#6E1A37] flex items-center justify-center font-bold text-xs text-[#D5E7B5] mb-1">
                DR
              </div>
              <p className="text-[10px] font-bold">Dr. Vikram Malhotra</p>
              <span className="text-[8px] text-emerald-400 font-mono">You (Cardiologist)</span>
            </div>

            {/* FLOATING REAL-TIME VITALS HUD */}
            <div className="absolute top-4 left-4 z-20 bg-slate-900/85 backdrop-blur-md rounded-2xl p-3 border border-white/20 text-white shadow-xl max-w-xs">
              <div className="flex items-center justify-between space-x-2 mb-2 pb-1.5 border-b border-white/10">
                <span className="text-[10px] uppercase font-bold text-[#D5E7B5] flex items-center">
                  <Radio className="w-2.5 h-2.5 mr-1 text-[#72BAA9] animate-pulse" />
                  Live Vitals HUD
                </span>
                <span className="text-[9px] text-slate-400 font-mono">Updated just now</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {/* BP */}
                <div className="bg-black/40 p-1.5 rounded-lg border border-white/10">
                  <span className="text-[9px] text-slate-400 block font-semibold">BP (mmHg)</span>
                  <span className={`text-sm font-black ${
                    patient.currentVitals.systolic >= 160 ? 'text-[#AE2448]' : 'text-white'
                  }`}>
                    {patient.currentVitals.systolic}/{patient.currentVitals.diastolic}
                  </span>
                </div>

                {/* Pulse */}
                <div className="bg-black/40 p-1.5 rounded-lg border border-white/10">
                  <span className="text-[9px] text-slate-400 block font-semibold flex items-center">
                    <Heart className="w-2 h-2 mr-0.5 text-[#AE2448] animate-heart-pulse" /> Pulse
                  </span>
                  <span className="text-sm font-black text-white">{patient.currentVitals.heartRate} bpm</span>
                </div>

                {/* SpO2 */}
                <div className="bg-black/40 p-1.5 rounded-lg border border-white/10">
                  <span className="text-[9px] text-slate-400 block font-semibold flex items-center">
                    <Wind className="w-2 h-2 mr-0.5 text-[#72BAA9]" /> SpO2
                  </span>
                  <span className={`text-sm font-black ${
                    patient.currentVitals.spO2 < 93 ? 'text-[#AE2448]' : 'text-[#72BAA9]'
                  }`}>
                    {patient.currentVitals.spO2}%
                  </span>
                </div>

                {/* Glucose */}
                <div className="bg-black/40 p-1.5 rounded-lg border border-white/10">
                  <span className="text-[9px] text-slate-400 block font-semibold flex items-center">
                    <Droplets className="w-2 h-2 mr-0.5 text-[#D5E7B5]" /> Glucose
                  </span>
                  <span className="text-sm font-black text-white">{patient.currentVitals.glucose} mg/dL</span>
                </div>
              </div>
            </div>

            {/* Bottom Controls Bar */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center space-x-3 bg-black/60 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/20">
              <button
                onClick={() => setIsMicOn(!isMicOn)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  isMicOn ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-red-600 text-white'
                }`}
                title={isMicOn ? 'Mute Mic' : 'Unmute Mic'}
              >
                {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setIsVideoOn(!isVideoOn)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  isVideoOn ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-red-600 text-white'
                }`}
                title={isVideoOn ? 'Turn Off Camera' : 'Turn On Camera'}
              >
                {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setUseRealWebcam(!useRealWebcam)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  useRealWebcam ? 'bg-[#72BAA9] text-[#6E1A37]' : 'bg-white/20 text-white hover:bg-white/30'
                }`}
                title="Toggle Physical Webcam feed"
              >
                {useRealWebcam ? 'Webcam Active' : 'Switch to Webcam'}
              </button>

              <button
                onClick={handleAttachVitals}
                className="bg-[#6E1A37] hover:bg-[#8b2447] text-white text-xs font-bold px-3 py-2 rounded-xl transition-all flex items-center space-x-1 shadow-md"
                title="Stamp current vitals into consultation transcript"
              >
                <Activity className="w-3.5 h-3.5 text-[#D5E7B5]" />
                <span>Stamp Vitals</span>
              </button>

              <button
                onClick={onEndCall}
                className="w-10 h-10 rounded-xl bg-[#AE2448] hover:bg-[#8b2447] text-white flex items-center justify-center shadow-md transition-all"
                title="End Consultation"
              >
                <PhoneOff className="w-5 h-5" />
              </button>
            </div>

          </div>

          {/* Alert Context Notice */}
          <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-200 text-xs flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-[#AE2448]/10 text-[#AE2448] flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-slate-800">Triggering Event: {patient.activeAlerts[0]?.message || 'Routine Tele-checkup'}</p>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Real-time baseline deviation of {patient.activeAlerts[0]?.zScore ? `+${patient.activeAlerts[0].zScore}σ` : 'within bounds'} from {patient.name}'s calibrated norm.
                </p>
              </div>
            </div>

            <span className="text-[10px] font-bold uppercase tracking-wider bg-[#D5E7B5] text-[#6E1A37] px-2.5 py-1 rounded-md shrink-0">
              Encrypted TLS 1.3
            </span>
          </div>

        </div>

        {/* Right Column: In-Call Clinical Tabs (Prescription, Chat, History) (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-5 shadow-card border border-slate-200 space-y-4">
          
          {/* Tabs Switcher */}
          <div className="flex items-center space-x-1 bg-[#ECECEC] p-1 rounded-2xl">
            <button
              onClick={() => setActiveTab('rx')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'rx' ? 'bg-[#6E1A37] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              E-Prescription Pad
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'chat' ? 'bg-[#6E1A37] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Consult Chat ({messages.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'history' ? 'bg-[#6E1A37] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Medical Profile
            </button>
          </div>

          {/* TAB 1: E-Prescription Pad */}
          {activeTab === 'rx' && (
            <div className="space-y-4 text-xs">
              
              {prescriptionSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold flex items-center space-x-2 animate-fade-in">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>ABDM E-Prescription digitally signed & synced to patient portal!</span>
                </div>
              )}

              {/* Diagnosis Field */}
              <div>
                <label className="block text-slate-700 font-bold text-xs mb-1">Clinical Diagnosis</label>
                <input
                  type="text"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="w-full bg-[#ECECEC]/70 rounded-xl px-3 py-2 text-xs font-medium border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#72BAA9]"
                />
              </div>

              {/* Prescribed Medications Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-slate-700 font-bold text-xs">Rx Medications</label>
                  <span className="text-[10px] text-slate-400 font-mono">India NMC Format</span>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {medications.map(med => (
                    <div key={med.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between">
                      <div>
                        <p className="font-extrabold text-slate-900 text-xs">{med.name} ({med.dosage})</p>
                        <p className="text-[11px] text-[#6E1A37] font-semibold mt-0.5">{med.frequency} • {med.duration}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{med.instructions}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveMedication(med.id)}
                        className="text-red-400 hover:text-red-600 p-1"
                        title="Remove medication"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Quick Add Medication Form */}
                <div className="mt-3 p-3 rounded-2xl bg-[#ECECEC]/60 border border-slate-200 space-y-2">
                  <p className="text-[11px] font-bold text-[#6E1A37] uppercase">Add New Medicine</p>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Medicine Name (e.g. Metformin)"
                      value={newMedName}
                      onChange={(e) => setNewMedName(e.target.value)}
                      className="bg-white rounded-lg px-2.5 py-1.5 text-xs border border-slate-200"
                    />
                    <input
                      type="text"
                      placeholder="Dosage (e.g. 500mg)"
                      value={newMedDosage}
                      onChange={(e) => setNewMedDosage(e.target.value)}
                      className="bg-white rounded-lg px-2.5 py-1.5 text-xs border border-slate-200"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <select
                      value={newMedFreq}
                      onChange={(e) => setNewMedFreq(e.target.value)}
                      className="bg-white rounded-lg px-2 py-1.5 text-xs border border-slate-200 flex-1"
                    >
                      <option value="1-0-1 (After food)">1-0-1 (Morning & Night, After food)</option>
                      <option value="1-0-0 (Morning on empty stomach)">1-0-0 (Morning Empty Stomach)</option>
                      <option value="0-0-1 (Night before bed)">0-0-1 (Night Before Bed)</option>
                      <option value="0-1-0 (After lunch)">0-1-0 (After Lunch)</option>
                      <option value="1-1-1 (Thrice daily)">1-1-1 (Thrice Daily)</option>
                      <option value="SOS (As needed for emergency)">SOS (As Needed for Emergency)</option>
                    </select>
                    <button
                      onClick={handleAddMedication}
                      className="bg-[#6E1A37] hover:bg-[#8b2447] text-white px-3 py-1.5 rounded-lg font-bold text-xs flex items-center space-x-1 shrink-0"
                    >
                      <FilePlus className="w-3 h-3" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Diet & Lifestyle Advice */}
              <div className="space-y-2">
                <div>
                  <label className="block text-slate-700 font-bold text-[11px] mb-0.5">Dietary Advisory</label>
                  <textarea
                    rows={2}
                    value={dietAdvice}
                    onChange={(e) => setDietAdvice(e.target.value)}
                    className="w-full bg-[#ECECEC]/70 rounded-xl px-3 py-1.5 text-xs border border-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold text-[11px] mb-0.5">Lifestyle / Monitoring Instructions</label>
                  <textarea
                    rows={2}
                    value={lifestyleAdvice}
                    onChange={(e) => setLifestyleAdvice(e.target.value)}
                    className="w-full bg-[#ECECEC]/70 rounded-xl px-3 py-1.5 text-xs border border-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              {/* Submit & Sign Prescription Button */}
              <button
                onClick={handleGeneratePrescription}
                className="w-full bg-gradient-to-r from-[#6E1A37] to-[#AE2448] hover:opacity-95 text-white font-extrabold py-2.5 rounded-xl text-xs shadow-md transition-all flex items-center justify-center space-x-2"
              >
                <ShieldCheck className="w-4 h-4 text-[#D5E7B5]" />
                <span>Sign & Issue ABDM E-Prescription</span>
              </button>

            </div>
          )}

          {/* TAB 2: In-Call Consultation Chat */}
          {activeTab === 'chat' && (
            <div className="space-y-3">
              <div className="h-72 overflow-y-auto space-y-2.5 p-2 bg-slate-50 rounded-2xl border border-slate-200">
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex flex-col text-xs ${
                      msg.sender === 'DOCTOR'
                        ? 'items-end'
                        : msg.sender === 'PATIENT'
                        ? 'items-start'
                        : 'items-center'
                    }`}
                  >
                    {msg.sender === 'SYSTEM' ? (
                      <div className="bg-slate-200 text-slate-700 text-[10px] px-3 py-1 rounded-full font-mono max-w-xs text-center my-1">
                        {msg.text}
                      </div>
                    ) : (
                      <div
                        className={`max-w-[85%] rounded-2xl p-3 shadow-sm ${
                          msg.sender === 'DOCTOR'
                            ? 'bg-[#6E1A37] text-white rounded-br-none'
                            : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                        }`}
                      >
                        <p className="text-[10px] opacity-70 mb-0.5 font-bold">
                          {msg.sender === 'DOCTOR' ? 'Dr. Vikram Malhotra' : patient.name} • {msg.time}
                        </p>
                        <p className="leading-relaxed">{msg.text}</p>

                        {msg.vitalSnapshot && (
                          <div className="mt-2 pt-2 border-t border-white/20 bg-black/20 p-2 rounded-xl text-[11px] font-mono space-y-0.5">
                            <p className="font-bold text-[#D5E7B5]">Captured Vitals Record:</p>
                            <p>BP: {msg.vitalSnapshot.systolic}/{msg.vitalSnapshot.diastolic} mmHg</p>
                            <p>Heart Rate: {msg.vitalSnapshot.heartRate} bpm | SpO2: {msg.vitalSnapshot.spO2}%</p>
                            <p>Glucose: {msg.vitalSnapshot.glucose} mg/dL</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Chat Input Bar */}
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Type advice or message..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 bg-[#ECECEC] rounded-xl px-3 py-2 text-xs border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#72BAA9]"
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-[#AE2448] text-white p-2 rounded-xl hover:bg-[#8b2447] transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: Patient Profile & Baseline */}
          {activeTab === 'history' && (
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <p className="font-bold text-slate-800">Primary Diagnosis</p>
                <p className="text-slate-600">{patient.primaryDiagnosis}</p>
                <p className="font-bold text-slate-800 mt-2">Secondary Conditions</p>
                <p className="text-slate-600">{patient.secondaryConditions.join(', ')}</p>
                <p className="font-bold text-slate-800 mt-2">Known Allergies</p>
                <p className="text-[#AE2448] font-bold">{patient.allergies.join(', ')}</p>
                <p className="font-bold text-slate-800 mt-2">Blood Group</p>
                <p className="text-slate-600">{patient.bloodGroup}</p>
              </div>

              <div className="p-3 rounded-xl bg-[#ECECEC] border border-slate-200 space-y-1">
                <p className="font-bold text-[#6E1A37]">Emergency Caregiver Contact</p>
                <p className="text-slate-700">{patient.emergencyContact.name} ({patient.emergencyContact.relation}): {patient.emergencyContact.phone}</p>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
