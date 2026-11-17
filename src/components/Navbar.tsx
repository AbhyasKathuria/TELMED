import React from 'react';
import { 
  Heart, 
  Activity, 
  Video, 
  User, 
  ShieldCheck, 
  Wifi, 
  Radio
} from 'lucide-react';
import type { UserRole } from '../types';

interface NavbarProps {
  activeTab: 'doctor' | 'teleconsult' | 'patient' | 'security' | 'prescriptions';
  setActiveTab: (tab: 'doctor' | 'teleconsult' | 'patient' | 'security' | 'prescriptions') => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  isStreaming: boolean;
  setIsStreaming: (streaming: boolean) => void;
  criticalAlertCount: number;
  lowBandwidthMode: boolean;
  setLowBandwidthMode: (low: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  userRole,
  setUserRole,
  isStreaming,
  setIsStreaming,
  criticalAlertCount,
  lowBandwidthMode,
  setLowBandwidthMode
}) => {
  return (
    <header className="sticky top-0 z-50 bg-[#6E1A37] text-white shadow-lg border-b border-[#AE2448]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('doctor')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#AE2448] to-[#72BAA9] flex items-center justify-center shadow-md border border-white/20">
              <Heart className="w-6 h-6 text-white animate-heart-pulse fill-white/20" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight text-white">TELMED</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-[#D5E7B5] text-[#6E1A37] px-2 py-0.5 rounded-full">
                  India Telehealth
                </span>
              </div>
              <p className="text-[11px] text-white/70 tracking-wide font-medium">
                Continuous Remote Monitoring & Clinical Telemedicine
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-black/20 p-1 rounded-xl backdrop-blur-sm border border-white/10">
            <button
              onClick={() => setActiveTab('doctor')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'doctor'
                  ? 'bg-[#AE2448] text-white shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-[#72BAA9]" />
              <span>Doctor Triage</span>
              {criticalAlertCount > 0 && (
                <span className="bg-[#AE2448] text-white border border-white/40 text-[10px] px-1.5 py-0.2 rounded-full font-bold animate-pulse">
                  {criticalAlertCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('teleconsult')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'teleconsult'
                  ? 'bg-[#AE2448] text-white shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Video className="w-3.5 h-3.5 text-[#D5E7B5]" />
              <span>Teleconsult Suite</span>
            </button>

            <button
              onClick={() => setActiveTab('patient')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'patient'
                  ? 'bg-[#AE2448] text-white shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <User className="w-3.5 h-3.5 text-[#72BAA9]" />
              <span>Patient Portal</span>
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'security'
                  ? 'bg-[#AE2448] text-white shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#D5E7B5]" />
              <span>ABDM & Security</span>
            </button>
          </nav>

          {/* Right Controls: Stream status, Low-Bandwidth Mode, Role Switcher */}
          <div className="flex items-center space-x-3">
            
            {/* Low Bandwidth Toggle for Rural India */}
            <button
              onClick={() => setLowBandwidthMode(!lowBandwidthMode)}
              title="Toggle Rural 2G/3G Packet Compression Mode"
              className={`hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors ${
                lowBandwidthMode
                  ? 'bg-[#72BAA9] text-[#6E1A37] border-white/40 font-semibold'
                  : 'bg-white/10 text-white/80 border-white/10 hover:bg-white/20'
              }`}
            >
              <Wifi className="w-3 h-3" />
              <span>{lowBandwidthMode ? 'Rural 2G/3G Mode: ON' : 'Standard Stream'}</span>
            </button>

            {/* Live Telemetry Streaming Status Toggle */}
            <button
              onClick={() => setIsStreaming(!isStreaming)}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                isStreaming
                  ? 'bg-[#72BAA9]/20 text-[#D5E7B5] border-[#72BAA9]/40'
                  : 'bg-white/5 text-white/50 border-white/10 hover:bg-white/10'
              }`}
              title="Toggle Simulated Sensor Stream"
            >
              <Radio className={`w-3 h-3 ${isStreaming ? 'text-[#72BAA9] animate-pulse' : 'text-gray-400'}`} />
              <span className="hidden sm:inline">{isStreaming ? 'IoT Feed Live' : 'Feed Paused'}</span>
            </button>

            {/* Role Switcher Pill */}
            <div className="flex items-center bg-black/30 rounded-lg p-0.5 border border-white/15">
              <span className="text-[10px] uppercase font-bold text-[#D5E7B5] px-2 hidden sm:inline">
                Role:
              </span>
              <select
                value={userRole}
                onChange={(e) => {
                  const role = e.target.value as UserRole;
                  setUserRole(role);
                  if (role === 'PATIENT') setActiveTab('patient');
                  else if (role === 'ADMIN') setActiveTab('security');
                  else setActiveTab('doctor');
                }}
                className="bg-transparent text-white text-xs font-semibold px-2 py-1 rounded focus:outline-none cursor-pointer"
              >
                <option value="DOCTOR" className="bg-[#6E1A37] text-white">Doctor (Cardiologist)</option>
                <option value="PATIENT" className="bg-[#6E1A37] text-white">Patient (Rameshwar)</option>
                <option value="ADMIN" className="bg-[#6E1A37] text-white">ABDM Officer / Admin</option>
              </select>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
