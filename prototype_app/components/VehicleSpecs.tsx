
import React, { useState, useMemo } from 'react';
import { VEHICLE_TIPS, WORKSHOP_CONTACTS } from '../constants';
import { ServiceItem, Task, FuelLogItem, VehicleData } from '../types';
import { enrichVehicleData } from '../services/geminiService';
import { Scale, Settings, Activity, FileText, Users, AlertTriangle, Wrench, Zap, ShieldAlert, Plus, MapPin, Award, Fuel, Save, Trash2, Phone, Search, RefreshCw, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from 'recharts';

interface VehicleSpecsProps {
    vehicleData: VehicleData;
    tasks?: Task[];
    serviceLog: ServiceItem[];
    fuelLog: FuelLogItem[];
    onUpdateServiceLog: (log: ServiceItem[]) => void;
    onUpdateFuelLog: (log: FuelLogItem[]) => void;
    onUpdateVehicleData?: (data: VehicleData) => void;
}

export const VehicleSpecs: React.FC<VehicleSpecsProps> = ({ 
    vehicleData, 
    tasks = [], 
    serviceLog = [], 
    fuelLog = [],
    onUpdateServiceLog,
    onUpdateFuelLog,
    onUpdateVehicleData
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'service' | 'fuel' | 'contacts'>('overview');
  const [isUpdating, setIsUpdating] = useState(false);
  
  // New Entry States
  const [newService, setNewService] = useState({ description: '', date: '', mileage: '', performer: '', type: 'Service' });
  const [newFuel, setNewFuel] = useState({ date: '', mileage: '', liters: '', price: '', full: true });

  // Calculate Weights
  const totalTaskWeight = tasks.reduce((sum, task) => sum + (task.weightKg || 0), 0);
  const maxLoad = vehicleData.weights.load;
  const remainingLoad = maxLoad - totalTaskWeight;
  const loadPercentage = Math.min((totalTaskWeight / maxLoad) * 100, 100);

  // Find Analysis Tips
  const analysisTips = VEHICLE_TIPS.find(c => c.category === 'Teknisk Analys & Status')?.items || [];

  // Fuel Stats Calculation
  const { avgConsumption, totalCost, avgPrice, chartData } = useMemo(() => {
      const sortedLog = [...fuelLog].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      let totalDist = 0;
      let totalLiters = 0;
      let totalCost = 0;
      const dataPoints: { date: string, consumption: number | null }[] = [];

      // Calculate totals and chart data
      for (let i = 0; i < sortedLog.length; i++) {
          totalCost += sortedLog[i].totalCost;

          if (i > 0) {
              const prev = sortedLog[i-1];
              const current = sortedLog[i];
              const distMil = current.mileage - prev.mileage;
              
              if (distMil > 0 && current.fullTank) {
                  const consumption = current.liters / distMil; // l/mil
                  totalDist += distMil;
                  totalLiters += current.liters;
                  
                  dataPoints.push({
                      date: current.date,
                      consumption: parseFloat(consumption.toFixed(2))
                  });
              } else {
                  // If not full tank or no distance, we can't calculate exact consumption for this leg
                  dataPoints.push({ date: current.date, consumption: null });
              }
          } else {
             dataPoints.push({ date: sortedLog[i].date, consumption: null });
          }
      }

      const avgConsumption = totalDist > 0 ? (totalLiters / totalDist) : 0; // l/mil
      const avgPrice = totalLiters > 0 ? totalCost / totalLiters : 0; // Rough estimate of historical avg price

      return { avgConsumption, totalCost, avgPrice, chartData: dataPoints.filter(d => d.consumption !== null) };
  }, [fuelLog]);

  const handleSmartUpdate = async () => {
      if (!onUpdateVehicleData) return;
      setIsUpdating(true);
      
      const newData = await enrichVehicleData(vehicleData.regNo);
      
      if (newData) {
          // Merge data intelligently
          const updated: VehicleData = {
              ...vehicleData,
              ...newData,
              engine: { ...vehicleData.engine, ...(newData.engine || {}) },
              weights: { ...vehicleData.weights, ...(newData.weights || {}) },
              dimensions: { ...vehicleData.dimensions, ...(newData.dimensions || {}) },
              wheels: { ...vehicleData.wheels, ...(newData.wheels || {}) },
              inspection: { ...vehicleData.inspection, ...(newData.inspection || {}) }
          };
          onUpdateVehicleData(updated);
      }
      setIsUpdating(false);
  };

  const handleAddService = () => {
      if (!newService.description || !newService.date) return;
      const item: ServiceItem = {
          id: Math.random().toString(36).substr(2, 9),
          date: newService.date,
          description: newService.description,
          mileage: newService.mileage + ' mil',
          performer: newService.performer,
          type: newService.type as any
      };
      onUpdateServiceLog([item, ...serviceLog]);
      setNewService({ description: '', date: '', mileage: '', performer: '', type: 'Service' });
  };

  const handleDeleteService = (id: string) => {
      onUpdateServiceLog(serviceLog.filter(s => s.id !== id));
  };

  const handleAddFuel = () => {
      if (!newFuel.date || !newFuel.liters || !newFuel.price) return;
      const liters = parseFloat(newFuel.liters);
      const price = parseFloat(newFuel.price); 
      
      const item: FuelLogItem = {
          id: Math.random().toString(36).substr(2, 9),
          date: newFuel.date,
          mileage: parseInt(newFuel.mileage) || 0,
          liters: liters,
          pricePerLiter: price / liters, // Derived
          totalCost: price,
          fullTank: newFuel.full
      };
      onUpdateFuelLog([item, ...fuelLog]);
      setNewFuel({ date: '', mileage: '', liters: '', price: '', full: true });
  };

  const handleDeleteFuel = (id: string) => {
      onUpdateFuelLog(fuelLog.filter(f => f.id !== id));
  };

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
          <button onClick={() => setActiveTab('contacts')} className={`flex-1 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === 'contacts' ? 'bg-nordic-charcoal text-white dark:bg-teal-600' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-nordic-charcoal'}`}>Verkstäder</button>
      </div>

      {activeTab === 'overview' && (
      <>
        {/* Car.info Action Header */}
        <div className="flex justify-between items-center bg-white dark:bg-nordic-dark-surface p-4 rounded-3xl border border-nordic-ice dark:border-nordic-dark-bg">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-300">
                    <Search size={20} />
                </div>
                <div>
                    <h4 className="font-bold text-sm text-nordic-charcoal dark:text-nordic-ice">Saknas data?</h4>
                    <p className="text-xs text-slate-500">Regnr: <span className="font-mono bg-slate-100 dark:bg-nordic-charcoal px-1 rounded">{vehicleData.regNo}</span></p>
                </div>
            </div>
            {onUpdateVehicleData && (
                <button 
                    onClick={handleSmartUpdate}
                    disabled={isUpdating}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all disabled:opacity-50"
                >
                    {isUpdating ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                    {isUpdating ? 'Söker...' : 'Hämta från Car.info'}
                </button>
            )}
        </div>

        {/* Analysis Section (New) */}
        {analysisTips.length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-900/10 p-6 rounded-3xl border border-amber-100 dark:border-amber-900/30">
                <div className="flex items-center gap-3 mb-4">
                    <Search className="text-amber-600" size={24} />
                    <h3 className="font-serif font-bold text-xl text-amber-900 dark:text-amber-100">Expertens Analys</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analysisTips.map((tip: any, idx: number) => (
                        <div key={idx} className="bg-white dark:bg-nordic-dark-surface p-4 rounded-2xl shadow-sm border border-amber-50 dark:border-amber-900/30">
                            <h4 className="font-bold text-amber-800 dark:text-amber-200 text-sm mb-1">{tip.title}</h4>
                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{tip.content}</p>
                        </div>
                    ))}
                </div>
            </div>
        )}

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
                <Row label="Motorkod" value={vehicleData.engine.code || 'Okänd'} />
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

      {activeTab === 'service' && (
          <div className="space-y-6">
              {/* Add Service */}
              <div className="bg-white dark:bg-nordic-dark-surface p-6 rounded-3xl border border-nordic-ice dark:border-nordic-dark-bg shadow-sm">
                  <h3 className="font-serif font-bold text-lg text-nordic-charcoal dark:text-nordic-ice mb-4 flex gap-2"><Plus className="text-teal-600"/> Ny Händelse</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <input 
                        type="date" 
                        value={newService.date} 
                        onChange={e => setNewService({...newService, date: e.target.value})}
                        className="p-3 bg-slate-50 dark:bg-nordic-dark-bg rounded-xl border border-slate-200 dark:border-nordic-charcoal text-sm"
                      />
                      <select 
                        value={newService.type} 
                        onChange={e => setNewService({...newService, type: e.target.value})}
                        className="p-3 bg-slate-50 dark:bg-nordic-dark-bg rounded-xl border border-slate-200 dark:border-nordic-charcoal text-sm"
                      >
                          <option value="Service">Service</option>
                          <option value="Reparation">Reparation</option>
                          <option value="Besiktning">Besiktning</option>
                          <option value="Övrigt">Övrigt</option>
                      </select>
                      <input 
                        placeholder="Mätarställning (mil)" 
                        type="number"
                        value={newService.mileage} 
                        onChange={e => setNewService({...newService, mileage: e.target.value})}
                        className="p-3 bg-slate-50 dark:bg-nordic-dark-bg rounded-xl border border-slate-200 dark:border-nordic-charcoal text-sm"
                      />
                      <input 
                        placeholder="Utförare (t.ex. Mekonomen)" 
                        value={newService.performer} 
                        onChange={e => setNewService({...newService, performer: e.target.value})}
                        className="p-3 bg-slate-50 dark:bg-nordic-dark-bg rounded-xl border border-slate-200 dark:border-nordic-charcoal text-sm"
                      />
                      <input 
                        placeholder="Beskrivning (t.ex. Oljebyte + Filter)" 
                        value={newService.description} 
                        onChange={e => setNewService({...newService, description: e.target.value})}
                        className="col-span-full p-3 bg-slate-50 dark:bg-nordic-dark-bg rounded-xl border border-slate-200 dark:border-nordic-charcoal text-sm"
                      />
                  </div>
                  <button onClick={handleAddService} disabled={!newService.date || !newService.description} className="w-full py-3 bg-nordic-charcoal dark:bg-teal-600 text-white rounded-xl font-bold disabled:opacity-50">
                      Spara i Serviceboken
                  </button>
              </div>

              {/* Log List */}
              <div className="bg-white dark:bg-nordic-dark-surface rounded-3xl border border-nordic-ice dark:border-nordic-dark-bg overflow-hidden">
                  {serviceLog.length === 0 ? (
                      <div className="p-8 text-center text-slate-400">Inget loggat än.</div>
                  ) : (
                      <div className="divide-y divide-slate-100 dark:divide-nordic-charcoal">
                          {serviceLog.map(item => (
                              <div key={item.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 group">
                                  <div>
                                      <div className="flex items-center gap-2 mb-1">
                                          <span className={`px-2 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-wider ${
                                              item.type === 'Service' ? 'bg-green-100 text-green-800' :
                                              item.type === 'Besiktning' ? 'bg-amber-100 text-amber-800' :
                                              'bg-slate-100 text-slate-700'
                                          }`}>
                                              {item.type}
                                          </span>
                                          <span className="text-xs text-slate-400">{item.date}</span>
                                      </div>
                                      <h4 className="font-bold text-nordic-charcoal dark:text-nordic-ice">{item.description}</h4>
                                      <p className="text-sm text-slate-500">Vid {item.mileage} • {item.performer}</p>
                                  </div>
                                  <button onClick={() => handleDeleteService(item.id)} className="p-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all">
                                      <Trash2 size={18} />
                                  </button>
                              </div>
                          ))}
                      </div>
                  )}
              </div>
          </div>
      )}

      {activeTab === 'fuel' && (
          <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-white dark:bg-nordic-dark-surface p-4 rounded-2xl border border-nordic-ice dark:border-nordic-dark-bg">
                      <p className="text-[10px] font-bold uppercase text-slate-400">Snittförbrukning</p>
                      <p className="text-2xl font-mono font-bold text-teal-600">{avgConsumption.toFixed(2)} <span className="text-sm text-slate-500">l/mil</span></p>
                  </div>
                  <div className="bg-white dark:bg-nordic-dark-surface p-4 rounded-2xl border border-nordic-ice dark:border-nordic-dark-bg">
                      <p className="text-[10px] font-bold uppercase text-slate-400">Total Kostnad</p>
                      <p className="text-2xl font-mono font-bold text-nordic-charcoal dark:text-nordic-ice">{totalCost.toFixed(0)} <span className="text-sm text-slate-500">kr</span></p>
                  </div>
                  <div className="bg-white dark:bg-nordic-dark-surface p-4 rounded-2xl border border-nordic-ice dark:border-nordic-dark-bg">
                      <p className="text-[10px] font-bold uppercase text-slate-400">Snittpris</p>
                      <p className="text-2xl font-mono font-bold text-slate-600 dark:text-slate-300">{avgPrice.toFixed(2)} <span className="text-sm text-slate-500">kr/l</span></p>
                  </div>
              </div>

              {/* Consumption Chart - Only show if we have data */}
              {chartData.length > 1 && (
                  <div className="bg-white dark:bg-nordic-dark-surface p-6 rounded-3xl border border-nordic-ice dark:border-nordic-dark-bg shadow-sm">
                      <h3 className="font-serif font-bold text-lg text-nordic-charcoal dark:text-nordic-ice mb-4 flex gap-2"><Activity className="text-teal-600"/> Förbrukning över tid</h3>
                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E8CB" />
                                <XAxis dataKey="date" tick={{fontSize: 10}} stroke="#8A817C" tickLine={false} axisLine={false} dy={10} />
                                <YAxis domain={['auto', 'auto']} tick={{fontSize: 10}} stroke="#8A817C" tickLine={false} axisLine={false} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    formatter={(value: number) => [`${value} l/mil`, 'Förbrukning']}
                                />
                                <Line type="monotone" dataKey="consumption" stroke="#0D9488" strokeWidth={3} dot={{r: 4, fill: '#0D9488'}} activeDot={{r: 6}} />
                            </LineChart>
                        </ResponsiveContainer>
                      </div>
                  </div>
              )}

              {/* Add Fuel */}
              <div className="bg-white dark:bg-nordic-dark-surface p-6 rounded-3xl border border-nordic-ice dark:border-nordic-dark-bg shadow-sm">
                  <h3 className="font-serif font-bold text-lg text-nordic-charcoal dark:text-nordic-ice mb-4 flex gap-2"><Fuel className="text-amber-600"/> Ny Tankning</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <input type="date" value={newFuel.date} onChange={e => setNewFuel({...newFuel, date: e.target.value})} className="p-3 bg-slate-50 dark:bg-nordic-dark-bg rounded-xl border border-slate-200 dark:border-nordic-charcoal text-sm" />
                      <input type="number" placeholder="Mätare (mil)" value={newFuel.mileage} onChange={e => setNewFuel({...newFuel, mileage: e.target.value})} className="p-3 bg-slate-50 dark:bg-nordic-dark-bg rounded-xl border border-slate-200 dark:border-nordic-charcoal text-sm" />
                      <input type="number" placeholder="Liter" value={newFuel.liters} onChange={e => setNewFuel({...newFuel, liters: e.target.value})} className="p-3 bg-slate-50 dark:bg-nordic-dark-bg rounded-xl border border-slate-200 dark:border-nordic-charcoal text-sm" />
                      <input type="number" placeholder="Totalpris (kr)" value={newFuel.price} onChange={e => setNewFuel({...newFuel, price: e.target.value})} className="p-3 bg-slate-50 dark:bg-nordic-dark-bg rounded-xl border border-slate-200 dark:border-nordic-charcoal text-sm" />
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                      <input type="checkbox" checked={newFuel.full} onChange={e => setNewFuel({...newFuel, full: e.target.checked})} id="fullTank" className="w-4 h-4 text-teal-600 rounded" />
                      <label htmlFor="fullTank" className="text-sm text-slate-600 dark:text-nordic-dark-muted">Fulltankad (krävs för exakt beräkning)</label>
                  </div>
                  <button onClick={handleAddFuel} disabled={!newFuel.date || !newFuel.liters} className="w-full py-3 bg-nordic-charcoal dark:bg-teal-600 text-white rounded-xl font-bold disabled:opacity-50">
                      Spara Tankning
                  </button>
              </div>

              {/* Log */}
              <div className="bg-white dark:bg-nordic-dark-surface rounded-3xl border border-nordic-ice dark:border-nordic-dark-bg overflow-hidden">
                  <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 dark:bg-nordic-charcoal text-slate-500">
                          <tr>
                              <th className="p-4">Datum</th>
                              <th className="p-4">Mätare</th>
                              <th className="p-4">Volym</th>
                              <th className="p-4">Pris</th>
                              <th className="p-4"></th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-nordic-charcoal">
                          {fuelLog.map(item => (
                              <tr key={item.id} className="group hover:bg-slate-50 dark:hover:bg-nordic-charcoal/50">
                                  <td className="p-4 font-medium dark:text-nordic-ice">{item.date}</td>
                                  <td className="p-4 text-slate-500">{item.mileage} mil</td>
                                  <td className="p-4 font-mono">{item.liters} L</td>
                                  <td className="p-4 font-mono">{item.totalCost} kr</td>
                                  <td className="p-4 text-right">
                                      <button onClick={() => handleDeleteFuel(item.id)} className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all">
                                          <Trash2 size={16} />
                                      </button>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
                  {fuelLog.length === 0 && <div className="p-8 text-center text-slate-400">Inga tankningar.</div>}
              </div>
          </div>
      )}

      {activeTab === 'contacts' && (
          <div className="space-y-6">
              {WORKSHOP_CONTACTS.map((contact, idx) => (
                  <div key={idx} className="bg-white dark:bg-nordic-dark-surface p-5 rounded-2xl border border-nordic-ice dark:border-nordic-dark-bg shadow-sm flex items-center justify-between">
                      <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 mb-1 block">{contact.category}</span>
                          <h4 className="font-bold text-nordic-charcoal dark:text-nordic-ice">{contact.name}</h4>
                          <p className="text-sm text-slate-500">{contact.specialty} • {contact.location}</p>
                          <p className="text-xs text-slate-400 mt-1 italic">"{contact.note}"</p>
                      </div>
                      <a href={`tel:${contact.phone}`} className="p-3 bg-nordic-ice dark:bg-nordic-charcoal rounded-full text-nordic-charcoal dark:text-white hover:bg-teal-500 hover:text-white transition-colors">
                          <Phone size={20} />
                      </a>
                  </div>
              ))}
          </div>
      )}

    </div>
  );
};