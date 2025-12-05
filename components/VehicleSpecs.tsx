import React from 'react';
import { VEHICLE_DATA, VEHICLE_TIPS } from '../constants';
import { Car, Scale, Settings, Activity, FileText, Users, Calendar, AlertTriangle, Wrench, Lightbulb, Zap, ShieldAlert } from 'lucide-react';

export const VehicleSpecs: React.FC = () => {
  const Card = ({ title, icon: Icon, children, warning }: any) => (
    <div className="bg-white rounded-3xl p-6 border border-nordic-ice shadow-sm h-full">
      <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-nordic-ice rounded-xl text-nordic-charcoal">
            <Icon size={20} />
            </div>
            <h3 className="font-serif font-bold text-lg text-nordic-charcoal">{title}</h3>
          </div>
          {warning && <AlertTriangle size={18} className="text-amber-500" />}
      </div>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );

  const Row = ({ label, value, highlight = false }: { label: string, value: string | number, highlight?: boolean }) => (
    <div className={`flex justify-between items-center py-2 border-b border-slate-50 last:border-0 ${highlight ? 'bg-teal-50/50 -mx-2 px-2 rounded-lg' : ''}`}>
      <span className="text-sm text-slate-500 font-medium">{label}</span>
      <span className={`text-sm font-bold text-right ${highlight ? 'text-teal-700' : 'text-nordic-charcoal'}`}>{value}</span>
    </div>
  );

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      {/* Hero Card */}
      <div className="bg-nordic-charcoal text-white rounded-3xl p-8 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-32 bg-teal-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <span className="bg-white/10 px-2 py-1 rounded text-[10px] font-bold tracking-widest uppercase text-slate-300">Regnr</span>
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${VEHICLE_DATA.status.includes('Avställd') ? 'bg-rose-500/20 text-rose-200' : 'bg-green-500/20 text-green-200'}`}>
                        {VEHICLE_DATA.status.split(' ')[0]}
                    </span>
                </div>
                <h2 className="text-5xl font-mono font-bold tracking-wider mb-2">{VEHICLE_DATA.regNo}</h2>
                <p className="text-slate-400 font-serif italic">{VEHICLE_DATA.bodyType}</p>
            </div>
            
            <div className="flex flex-wrap gap-3">
                <div className="bg-white/10 px-4 py-3 rounded-2xl backdrop-blur-sm border border-white/5">
                    <span className="block text-[10px] text-slate-300 uppercase mb-1">Fabrikat</span>
                    <span className="font-bold text-lg">{VEHICLE_DATA.make} {VEHICLE_DATA.model}</span>
                </div>
                <div className="bg-white/10 px-4 py-3 rounded-2xl backdrop-blur-sm border border-white/5">
                    <span className="block text-[10px] text-slate-300 uppercase mb-1">Årsmodell</span>
                    <span className="font-bold text-lg">{VEHICLE_DATA.year}</span>
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        
        {/* Mått & Vikt */}
        <Card title="Last & Mått" icon={Scale}>
           <Row label="Max Lastvikt" value={`${VEHICLE_DATA.weights.load} kg`} highlight />
           <Row label="Tjänstevikt" value={`${VEHICLE_DATA.weights.curb} kg`} />
           <Row label="Totalvikt" value={`${VEHICLE_DATA.weights.total} kg`} />
           <Row label="Max Släpvagn" value={`${VEHICLE_DATA.weights.trailer} kg`} />
           <div className="pt-2"></div>
           <Row label="Längd" value={`${VEHICLE_DATA.dimensions.length} mm`} />
           <Row label="Bredd" value={`${VEHICLE_DATA.dimensions.width} mm`} />
           <Row label="Axelavstånd" value={`${VEHICLE_DATA.dimensions.wheelbase} mm`} />
        </Card>

        {/* Motor & Hjul */}
        <Card title="Drivlina & Hjul" icon={Settings}>
           <Row label="Motor" value={VEHICLE_DATA.engine.power} highlight />
           <Row label="Bränsle" value={VEHICLE_DATA.engine.fuel} />
           <Row label="Växellåda" value={VEHICLE_DATA.gearbox} />
           <Row label="Drivning" value={VEHICLE_DATA.wheels.drive} />
           <div className="pt-2"></div>
           <Row label="Däck (Fram/Bak)" value={VEHICLE_DATA.wheels.tiresFront} />
           <Row label="Bultmönster" value={VEHICLE_DATA.wheels.boltPattern} />
        </Card>

        {/* Historik & Besiktning */}
        <Card title="Historik & Status" icon={FileText} warning={true}>
           <Row label="Mätarställning" value={VEHICLE_DATA.inspection.mileage} highlight />
           <Row label="Senast Besiktigad" value={VEHICLE_DATA.inspection.last} />
           <Row label="Antal Ägare" value={VEHICLE_DATA.history.owners} />
           <Row label="Händelser" value={VEHICLE_DATA.history.events} />
           <Row label="Senaste Ägarbyte" value={VEHICLE_DATA.history.lastOwnerChange} />
           <Row label="Första Trafik" value={VEHICLE_DATA.regDate} />
        </Card>

        {/* Övrigt */}
        <Card title="Övrigt" icon={Users}>
           <Row label="Passagerare" value={`${VEHICLE_DATA.passengers} + förare`} />
           <Row label="Färg" value={VEHICLE_DATA.color} />
           <Row label="Chassinummer" value={VEHICLE_DATA.vin} />
           <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-100 text-xs text-amber-800 leading-relaxed">
             <strong>Notera:</strong> Mätarställningen har troligen slagit om (endast 5 siffror). Historiken visar 22 ägare, vilket tyder på ett långt liv. Var extra noga med kamrem och service.
           </div>
        </Card>
      </div>

      {/* Expert Tips Section */}
      <div className="pt-8">
        <h2 className="text-3xl font-serif font-bold text-nordic-charcoal mb-6">Experttips för Elton</h2>
        <div className="grid grid-cols-1 gap-6">
          {VEHICLE_TIPS.map((section, idx) => (
             <div key={idx} className="bg-white rounded-3xl border border-nordic-ice shadow-sm overflow-hidden">
                <div className="bg-nordic-ice/50 p-6 border-b border-nordic-ice">
                   <h3 className="font-serif font-bold text-xl text-nordic-charcoal">{section.category}</h3>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                   {section.items.map((item: any, i: number) => (
                      <div key={i} className="flex gap-4 items-start p-4 rounded-2xl bg-white border border-slate-100 hover:border-nordic-blue transition-colors shadow-sm hover:shadow-md">
                         <div className={`p-2.5 rounded-xl shrink-0 ${
                            item.priority === 'Kritisk' ? 'bg-rose-100 text-rose-700' :
                            item.priority === 'Viktigt' ? 'bg-amber-100 text-amber-700' :
                            item.priority === 'Komfort' ? 'bg-indigo-100 text-indigo-700' :
                            'bg-teal-100 text-teal-700'
                         }`}>
                            {item.priority === 'Kritisk' ? <ShieldAlert size={20} /> : 
                             item.priority === 'Komfort' ? <Zap size={20} /> :
                             <Wrench size={20} />}
                         </div>
                         <div>
                            <div className="flex justify-between items-start mb-1">
                               <h4 className="font-bold text-nordic-charcoal">{item.title}</h4>
                               <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                  item.priority === 'Kritisk' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500'
                               }`}>{item.priority}</span>
                            </div>
                            <p className="text-sm text-slate-600 leading-relaxed">{item.content}</p>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          ))}
        </div>
      </div>
    </div>
  );
};