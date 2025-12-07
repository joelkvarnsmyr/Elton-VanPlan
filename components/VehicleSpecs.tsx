
import React, { useState } from 'react';
import { VEHICLE_TIPS, WORKSHOP_CONTACTS } from '../constants';
import { ServiceItem, Task, FuelLogItem, VehicleData } from '../types';
import { Scale, Settings, Activity, FileText, Users, AlertTriangle, Wrench, Zap, ShieldAlert, Plus, MapPin, Award, Fuel } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface VehicleSpecsProps {
    vehicleData: VehicleData;
    tasks?: Task[];
}

export const VehicleSpecs: React.FC<VehicleSpecsProps> = ({ vehicleData, tasks = [] }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'service' | 'fuel' | 'contacts'>('overview');
  
  // Service Log (Placeholder logic, should come from Project data)
  const [newService, setNewService] = useState({ description: '', date: '', mileage: '', performer: '' });
  const [newFuel, setNewFuel] = useState({ date: '', mileage: '', liters: '', price: '', full: true });

  // Note: Logs should be passed as props in a real implementation, keeping local state simple for demo
  const [serviceLog, setServiceLog] = useState<ServiceItem[]>([]);
  const [fuelLog, setFuelLog] = useState<FuelLogItem[]>([]);

  // Calculate Weights
  const totalTaskWeight = tasks.reduce((sum, task) => sum + (task.weightKg || 0), 0);
  const maxLoad = vehicleData.weights.load;
  const remainingLoad = maxLoad - totalTaskWeight;
  const loadPercentage = Math.min((totalTaskWeight / maxLoad) * 100, 100);

  const Card = ({ title, icon: Icon, children, warning }: any) => (
    <div className="bg-white dark:bg-nordic-dark-surface rounded-3xl p-6 border border-nordic-ice dark:border-nordic-dark-bg shadow-sm h-full transition-colors">
      <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-nordic-ice dark:bg-nordic-charcoal rounded-xl text-nordic-charcoal dark:text-nordic-ice">
            <Icon size={20} />
            </div>
            <h3 className="font-serif font-bold text-lg text-nordic-charcoal dark:text-nordic-ice">{title}</h3>
          </div>
          {warning && <AlertTriangle size={18} className="text-amber-500" />}
      </div>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );

  const Row = ({ label, value, highlight = false }: { label: string, value: string | number, highlight?: boolean }) => (
    <div className={`flex justify-between items-center py-2 border-b border-slate-50 dark:border-nordic-charcoal last:border-0 ${highlight ? 'bg-teal-50/50 dark:bg-teal-900/20 -mx-2 px-2 rounded-lg' : ''}`}>
      <span className="text-sm text-slate-500 dark:text-nordic-dark-muted font-medium">{label}</span>
      <span className={`text-sm font-bold text-right ${highlight ? 'text-teal-700 dark:text-teal-400' : 'text-nordic-charcoal dark:text-nordic-ice'}`}>{value}</span>
    </div>
  );

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
        
      {/* Navigation Tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide bg-white dark:bg-nordic-dark-surface p-2 rounded-2xl border border-nordic-ice dark:border-nordic-dark-bg sticky top-0 z-20">
          <button onClick={() => setActiveTab('overview')} className={`flex-1 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === 'overview' ? 'bg-nordic-charcoal text-white dark:bg-teal-600' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-nordic-charcoal'}`}>Garage & Data</button>
          <button onClick={() => setActiveTab('service')} className={`flex-1 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === 'service' ? 'bg-nordic-charcoal text-white dark:bg-teal-600' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-nordic-charcoal'}`}>Servicebok</button>
          <button onClick={() => setActiveTab('fuel')} className={`flex-1 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === 'fuel' ? 'bg-nordic-charcoal text-white dark:bg-teal-600' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-nordic-charcoal'}`}>Bränsle</button>
      </div>

      {activeTab === 'overview' && (
      <>
        {/* Weight Watcher */}
        <div className="bg-white dark:bg-nordic-dark-surface p-8 rounded-3xl border border-nordic-ice dark:border-nordic-dark-bg shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="font-serif font-bold text-2xl text-nordic-charcoal dark:text-nordic-ice flex items-center gap-2">
                        <Scale className="text-teal-600" /> Viktkalkylator
                    </h3>
                    <p className="text-slate-500 dark:text-nordic-dark-muted">Håll koll på lastvikten.</p>
                </div>
                <div className="text-right">
                    <p className="text-sm font-bold uppercase tracking-wider text-slate-400">Kvar att lasta</p>
                    <p className={`text-3xl font-mono font-bold ${remainingLoad < 100 ? 'text-rose-500' : 'text-teal-600'}`}>{remainingLoad} kg</p>
                </div>
            </div>
            <div className="relative h-6 bg-slate-100 dark:bg-nordic-dark-bg rounded-full overflow-hidden mb-2">
                <div className={`h-full transition-all duration-1000 ${loadPercentage > 90 ? 'bg-rose-500' : loadPercentage > 75 ? 'bg-amber-400' : 'bg-teal-500'}`} style={{ width: `${loadPercentage}%` }}></div>
            </div>
            <div className="flex justify-between text-xs font-mono text-slate-400">
                <span>0 kg</span>
                <span>Tjänstevikt: {vehicleData.weights.curb} kg</span>
                <span>Maxlast: {vehicleData.weights.load} kg</span>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <Card title="Last & Mått" icon={Scale}>
                <Row label="Max Lastvikt" value={`${vehicleData.weights.load} kg`} highlight />
                <Row label="Tjänstevikt" value={`${vehicleData.weights.curb} kg`} />
                <Row label="Totalvikt" value={`${vehicleData.weights.total} kg`} />
                <Row label="Max Släpvagn" value={`${vehicleData.weights.trailer} kg`} />
                <div className="pt-2"></div>
                <Row label="Längd" value={`${vehicleData.dimensions.length} mm`} />
                <Row label="Bredd" value={`${vehicleData.dimensions.width} mm`} />
            </Card>

            <Card title="Drivlina & Hjul" icon={Settings}>
                <Row label="Motor" value={vehicleData.engine.power} highlight />
                <Row label="Bränsle" value={vehicleData.engine.fuel} />
                <Row label="Växellåda" value={vehicleData.gearbox} />
                <Row label="Drivning" value={vehicleData.wheels.drive} />
                <div className="pt-2"></div>
                <Row label="Däck" value={vehicleData.wheels.tiresFront} />
                <Row label="Bultmönster" value={vehicleData.wheels.boltPattern} />
            </Card>

            <Card title="Historik & Status" icon={FileText} warning={true}>
                <Row label="Mätarställning" value={vehicleData.inspection.mileage} highlight />
                <Row label="Senast Besiktigad" value={vehicleData.inspection.last} />
                <Row label="Antal Ägare" value={vehicleData.history.owners} />
                <Row label="Första Trafik" value={vehicleData.regDate} />
            </Card>
        </div>
      </>
      )}

      {/* Service & Fuel tabs would map over props.project.serviceLog/fuelLog in real implementation */}
      {/* Keeping simplified placeholders to focus on architecture change */}
      {activeTab === 'service' && (
          <div className="bg-white dark:bg-nordic-dark-surface p-8 rounded-3xl border border-nordic-ice dark:border-nordic-dark-bg text-center">
              <Activity className="mx-auto text-slate-300 mb-4" size={48} />
              <p className="text-slate-500">Serviceboken är tom i detta projekt.</p>
          </div>
      )}
      {activeTab === 'fuel' && (
          <div className="bg-white dark:bg-nordic-dark-surface p-8 rounded-3xl border border-nordic-ice dark:border-nordic-dark-bg text-center">
              <Fuel className="mx-auto text-slate-300 mb-4" size={48} />
              <p className="text-slate-500">Inga tankningar registrerade.</p>
          </div>
      )}
    </div>
  );
};
