import React from 'react';
import type { Prescription, Patient } from '../types';
import {
  FileText,
  Printer,
  X,
  ShieldCheck
} from 'lucide-react';

interface PrescriptionModalProps {
  prescription: Prescription;
  patient: Patient;
  onClose: () => void;
}

export const PrescriptionModal: React.FC<PrescriptionModalProps> = ({
  prescription,
  patient,
  onClose
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-scale-in">
        
        {/* Modal Top Actions */}
        <div className="bg-[#6E1A37] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-[#D5E7B5]" />
            <h3 className="font-black text-sm tracking-wide">Official ABDM Telemedicine E-Prescription</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center space-x-1"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Prescription Body */}
        <div className="p-8 space-y-6 text-slate-800" id="printable-rx">
          
          {/* Clinic / Doctor Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b-2 border-[#6E1A37] pb-4">
            <div>
              <h2 className="text-xl font-black text-[#6E1A37]">{prescription.doctorName}</h2>
              <p className="text-xs font-bold text-slate-700">MBBS, MD (Medicine), DM (Cardiology)</p>
              <p className="text-xs text-slate-500 font-mono">Reg. No: {prescription.doctorRegistration} (NMC / State Council)</p>
              <p className="text-xs text-slate-500">{prescription.hospitalName}</p>
            </div>
            <div className="text-left sm:text-right text-xs">
              <span className="inline-block bg-[#D5E7B5] text-[#6E1A37] font-extrabold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-1">
                ABDM Teleconsult Verified
              </span>
              <p className="text-slate-500 font-mono">Date: {prescription.date}</p>
              <p className="text-slate-500 font-mono">Rx ID: {prescription.id}</p>
            </div>
          </div>

          {/* Patient Details Row */}
          <div className="bg-[#ECECEC]/60 p-4 rounded-2xl grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs border border-slate-200">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Patient Name</p>
              <p className="font-black text-slate-900 mt-0.5">{patient.name}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Age / Gender</p>
              <p className="font-bold text-slate-800 mt-0.5">{patient.age} Yrs / {patient.gender}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">ABHA Address</p>
              <p className="font-mono text-slate-800 mt-0.5">{patient.abhaId}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Location</p>
              <p className="font-medium text-slate-800 mt-0.5">{patient.district}, {patient.state}</p>
            </div>
          </div>

          {/* Telemetry Vitals Snapshot during Teleconsult */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
            <p className="font-extrabold text-[#6E1A37] uppercase text-[10px] tracking-wider mb-1.5">
              Live Sensor Vitals at Consultation Time:
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
              <span><strong>BP:</strong> {prescription.vitalsSnapshot.bp} mmHg</span>
              <span><strong>Pulse:</strong> {prescription.vitalsSnapshot.hr} bpm</span>
              <span><strong>SpO2:</strong> {prescription.vitalsSnapshot.spo2}%</span>
              <span><strong>Glucose:</strong> {prescription.vitalsSnapshot.glucose} mg/dL</span>
              <span><strong>Temp:</strong> {prescription.vitalsSnapshot.temp} °C</span>
            </div>
          </div>

          {/* Clinical Diagnosis */}
          <div className="text-xs">
            <span className="font-black text-slate-900 uppercase text-[10px] tracking-wider block text-slate-400">
              Provisional / Clinical Diagnosis:
            </span>
            <p className="text-sm font-bold text-[#6E1A37] mt-0.5">{prescription.diagnosis}</p>
          </div>

          {/* Rx Medications */}
          <div>
            <div className="flex items-center space-x-2 text-xl font-black text-[#6E1A37] mb-2">
              <span className="font-serif italic text-2xl font-black">℞</span>
              <span className="text-xs font-black uppercase tracking-wider text-slate-500">Medications</span>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#ECECEC] text-slate-700 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="px-4 py-2">Medicine & Dosage</th>
                    <th className="px-4 py-2">Frequency</th>
                    <th className="px-4 py-2">Duration</th>
                    <th className="px-4 py-2">Instructions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {prescription.medications.map(med => (
                    <tr key={med.id} className="hover:bg-slate-50">
                      <td className="px-4 py-2.5 font-bold text-slate-900">{med.name} ({med.dosage})</td>
                      <td className="px-4 py-2.5 font-semibold text-[#6E1A37]">{med.frequency}</td>
                      <td className="px-4 py-2.5 text-slate-600">{med.duration}</td>
                      <td className="px-4 py-2.5 text-slate-500 text-[11px]">{med.instructions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Dietary & Lifestyle Instructions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
            <div className="p-3.5 rounded-2xl bg-[#ECECEC]/60 border border-slate-200">
              <p className="font-bold text-[#6E1A37] mb-1">Dietary Advice</p>
              <p className="text-slate-600 leading-relaxed text-[11px]">{prescription.dietaryAdvice}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#ECECEC]/60 border border-slate-200">
              <p className="font-bold text-[#6E1A37] mb-1">Lifestyle & Follow-Up</p>
              <p className="text-slate-600 leading-relaxed text-[11px]">{prescription.lifestyleAdvice}</p>
              <p className="font-bold text-[#AE2448] mt-2 text-[11px]">Next Review: {prescription.nextReviewDate}</p>
            </div>
          </div>

          {/* Footer: Digital Signature Block & ABDM Hash */}
          <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Cryptographic Verification</p>
              <p className="font-mono text-[10px] text-slate-600 mt-0.5">Hash: {prescription.signedDigitalHash}</p>
              <div className="flex items-center space-x-1.5 text-[#72BAA9] text-[11px] font-bold mt-1">
                <ShieldCheck className="w-4 h-4" />
                <span>Digitally Signed under Indian IT Act 2000 & Telemedicine Guidelines</span>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <div className="font-signature text-base text-[#6E1A37] font-serif italic font-bold">
                Dr. Vikram Malhotra
              </div>
              <p className="text-[11px] font-bold text-slate-700">Authorized Medical Practitioner</p>
              <p className="text-[10px] text-slate-400 font-mono">Reg MCI-38291</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
