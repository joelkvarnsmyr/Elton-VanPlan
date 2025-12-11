
import React, 'react';
import { ServiceItem, Task, FuelLogItem, VehicleData, Project, Contact } from '@/types/types';
import { Scale, Settings, Activity, FileText, AlertTriangle, Fuel, Plus, Save, X, Edit2, Phone, MapPin, Search, Info } from 'lucide-react';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';
import { Contacts } from './Contacts';
import { WorkshopFinder } from './WorkshopFinder';
import { getLocationWithFallback, createManualLocation } from '@/services/location';

interface VehicleSpecsProps {
    vehicleData: VehicleData;
    tasks?: Task[];
    serviceLog?: ServiceItem[];
    fuelLog?: FuelLogItem[];
    contacts?: Contact[];
    projectLocation?: { city: string; lat: number; lng: number };
    onAddService?: (entry: ServiceItem) => void;
    onAddFuel?: (entry: FuelLogItem) => void;
    onUpdateSpecs?: (data: Partial<VehicleData>) => void;
    onUpdateContacts?: (contacts: Contact[]) => void;
    onUpdateLocation?: (location: any) => void;
}

const Disclaimer = () => (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-2xl p-4 mb-6">
        <div className="flex items-start gap-3">
            <Info size={20} className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
                <h4 className="font-bold text-blue-800 dark:text-blue-300">Ett litet meddelande från verkstan:</h4>
                <p className="text-sm text-blue-700 dark:text-blue-400/80 mt-1">
                    Elton gör sitt bästa för att hämta korrekt data, men ibland kan det smyga sig in ett fel. Dubbelkolla alltid kritisk information! Om du hittar något som inte stämmer, blir vi superglada om du <a href="mailto:feedback@elton.se" className="font-bold underline hover:text-blue-600">rapporterar det till oss</a>. Tillsammans gör vi Elton smartare!
                </p>
            </div>
        </div>
    </div>
);

export const VehicleSpecs: React.FC<VehicleSpecsProps> = ({
    vehicleData,
    tasks = [],
    serviceLog = [],
    fuelLog = [],
    contacts = [],
    projectLocation,
    onAddService,
    onAddFuel,
    onUpdateSpecs,
    onUpdateContacts,
    onUpdateLocation
}) => {
  const [activeTab, setActiveTab] = React.useState<'overview' | 'service' | 'fuel' | 'contacts' | 'find-workshop'>('overview');
  const [userLocation, setUserLocation] = React.useState<any>(projectLocation || null);
  const [isRequestingLocation, setIsRequestingLocation] = React.useState(false);
  const [isEditingSpecs, setIsEditingSpecs] = React.useState(false);
  
  // Forms State
  const [newService, setNewService] = React.useState({ description: '', date: '', mileage: '', performer: '', type: 'Service' as const });
  const [newFuel, setNewFuel] = React.useState({ date: '', mileage: '', liters: '', pricePerLiter: '', full: true });
  
  // Edit Specs State (Flat structure for simpler form)
  const [editSpecs, setEditSpecs] = React.useState<any>({});

  const startEditing = () => {
      setEditSpecs({
          load: vehicleData.weights.load,
          curb: vehicleData.weights.curb,
          total: vehicleData.weights.total,
          trailer: vehicleData.weights.trailer,
          length: vehicleData.dimensions.length,
          width: vehicleData.dimensions.width,
          power: vehicleData.engine.power,
          fuel: vehicleData.engine.fuel,
          gearbox: vehicleData.gearbox,
          tires: vehicleData.wheels.tiresFront,
          mileage: vehicleData.inspection.mileage
      });
      setIsEditingSpecs(true);
  };

  const requestLocationPermission = async () => {
      setIsRequestingLocation(true);
      try {
          const location = await getLocationWithFallback();
          if (location && location.coordinates) {
              const locationData = {
                  city: location.city,
                  lat: location.coordinates.lat,
                  lng: location.coordinates.lng
              };
              setUserLocation(locationData);
              if (onUpdateLocation) {
                  onUpdateLocation({
                      city: location.city,
                      region: location.region,
                      country: location.country,
                      coordinates: location.coordinates,
                      source: location.source,
                      lastUpdated: location.lastUpdated
                  });
              }
          }
      } catch (error) {
          console.error('Location error:', error);
      } finally {
          setIsRequestingLocation(false);
      }
  };

  const handleAddWorkshopContact = (contact: Contact) => {
      if (onUpdateContacts) {
          onUpdateContacts([...contacts, contact]);
          setActiveTab('contacts'); // Switch to contacts tab to show the added contact
      }
  };

  const saveSpecs = () => {
      if (!onUpdateSpecs) return;
      onUpdateSpecs({
          weights: { ...vehicleData.weights, load: Number(editSpecs.load), curb: Number(editSpecs.curb), total: Number(editSpecs.total), trailer: Number(editSpecs.trailer) },
          dimensions: { ...vehicleData.dimensions, length: Number(editSpecs.length), width: Number(editSpecs.width) },
          engine: { ...vehicleData.engine, power: editSpecs.power, fuel: editSpecs.fuel },
          gearbox: editSpecs.gearbox,
          wheels: { ...vehicleData.wheels, tiresFront: editSpecs.tires, tiresRear: editSpecs.tires },
          inspection: { ...vehicleData.inspection, mileage: editSpecs.mileage }
      });
      setIsEditingSpecs(false);
  };

  const handleAddService = () => {
      if (!newService.description || !onAddService) return;
      onAddService({
          id: Math.random().toString(36).substr(2, 9),
          ...newService,
          type: newService.type as any
      });
      setNewService({ description: '', date: '', mileage: '', performer: '', type: 'Service' });
  };

  const handleAddFuel = () => {
      if (!newFuel.liters || !onAddFuel) return;
      const liters = parseFloat(newFuel.liters);
      const price = parseFloat(newFuel.pricePerLiter);
      onAddFuel({
          id: Math.random().toString(36).substr(2, 9),
          date: newFuel.date || new Date().toISOString().split('T')[0],
          mileage: parseInt(newFuel.mileage) || 0,
          liters,
          pricePerLiter: price,
          totalCost: liters * price,
          fullTank: newFuel.full
      });
      setNewFuel({ date: '', mileage: '', liters: '', pricePerLiter: '', full: true });
  };

  // Calculate Weights
  const totalTaskWeight = tasks.reduce((sum, task) => sum + (task.weightKg || 0), 0);
  const maxLoad = vehicleData.weights.load;
  const remainingLoad = maxLoad - totalTaskWeight;
  const loadPercentage = Math.min((totalTaskWeight / maxLoad) * 100, 100);

  const Card = ({ title, icon: Icon, children, warning, onEdit }: any) => (
    <div className="bg-white dark:bg-nordic-dark-surface rounded-3xl p-6 border border-nordic-ice dark:border-nordic-dark-bg shadow-sm h-full relative group">
      <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-nordic-ice dark:bg-nordic-charcoal rounded-xl text-nordic-charcoal dark:text-nordic-ice">
            <Icon size={20} />
            </div>
            <h3 className="font-serif font-bold text-lg text-nordic-charcoal dark:text-nordic-ice">{title}</h3>
          </div>
          <div className="flex gap-2">
            {warning && <AlertTriangle size={18} className="text-amber-500" />}
            {onEdit && !isEditingSpecs && (
                <button onClick={onEdit} className="p-1 text-slate-300 hover:text-teal-600 opacity-0 group-hover:opacity-100 transition-all">
                    <Edit2 size={16} />
                </button>
            )}
          </div>
      </div>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );

  const Row = ({ label, value, highlight = false, editKey }: { label: string, value: string | number, highlight?: boolean, editKey?: string }) => (
    <div className={`flex justify-between items-center py-2 border-b border-slate-50 dark:border-nordic-charcoal last:border-0 ${highlight ? 'bg-teal-50/50 dark:bg-teal-900/20 -mx-2 px-2 rounded-lg' : ''}`}>
      <span className="text-sm text-slate-500 dark:text-nordic-dark-muted font-medium">{label}</span>
      {isEditingSpecs && editKey ? (
          <input 
            className="text-sm font-bold text-right bg-white dark:bg-black/20 border border-slate-200 dark:border-nordic-charcoal rounded px-2 py-1 w-24"
            value={editSpecs[editKey]}
            onChange={(e) => setEditSpecs({...editSpecs, [editKey]: e.target.value})}
          />
      ) : (
          <span className={`text-sm font-bold text-right ${highlight ? 'text-teal-700 dark:text-teal-400' : 'text-nordic-charcoal dark:text-nordic-ice'}`}>{value}</span>
      )}
    </div>
  );

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
        
      {/* Navigation Tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide bg-white dark:bg-nordic-dark-surface p-2 rounded-2xl border border-nordic-ice dark:border-nordic-dark-bg sticky top-0 z-20 shadow-sm">
          <button onClick={() => setActiveTab('overview')} className={`flex-1 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === 'overview' ? 'bg-nordic-charcoal text-white dark:bg-teal-600' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-nordic-charcoal'}`}>Garage & Data</button>
          <button onClick={() => setActiveTab('contacts')} className={`flex-1 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === 'contacts' ? 'bg-nordic-charcoal text-white dark:bg-teal-600' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-nordic-charcoal'}`}>Kontakter</button>
          <button onClick={() => setActiveTab('find-workshop')} className={`flex-1 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === 'find-workshop' ? 'bg-nordic-charcoal text-white dark:bg-teal-600' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-nordic-charcoal'}`}>Hitta Verkstad</button>
          <button onClick={() => setActiveTab('service')} className={`flex-1 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === 'service' ? 'bg-nordic-charcoal text-white dark:bg-teal-600' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-nordic-charcoal'}`}>Servicebok</button>
          <button onClick={() => setActiveTab('fuel')} className={`flex-1 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === 'fuel' ? 'bg-nordic-charcoal text-white dark:bg-teal-600' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-nordic-charcoal'}`}>Bränsle</button>
      </div>

      {activeTab === 'overview' && (
      <>
        <Disclaimer />

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

        {isEditingSpecs && (
            <div className="flex justify-end gap-2">
                <button onClick={() => setIsEditingSpecs(false)} className="px-4 py-2 text-slate-500 hover:bg-white rounded-xl">Avbryt</button>
                <button onClick={saveSpecs} className="px-6 py-2 bg-teal-600 text-white rounded-xl font-bold shadow-lg hover:bg-teal-700">Spara Ändringar</button>
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <Card title="Last & Mått" icon={Scale} onEdit={startEditing}>
                <Row label="Max Lastvikt" value={`${vehicleData.weights.load} kg`} highlight editKey="load" />
                <Row label="Tjänstevikt" value={`${vehicleData.weights.curb} kg`} editKey="curb" />
                <Row label="Totalvikt" value={`${vehicleData.weights.total} kg`} editKey="total" />
                <Row label="Max Släpvagn" value={`${vehicleData.weights.trailer} kg`} editKey="trailer" />
                <div className="pt-2"></div>
                <Row label="Längd" value={`${vehicleData.dimensions.length} mm`} editKey="length" />
                <Row label="Bredd" value={`${vehicleData.dimensions.width} mm`} editKey="width" />
            </Card>

            <Card title="Drivlina & Hjul" icon={Settings} onEdit={startEditing}>
                <Row label="Motor" value={vehicleData.engine.power} highlight editKey="power" />
                <Row label="Bränsle" value={vehicleData.engine.fuel} editKey="fuel" />
                <Row label="Växellåda" value={vehicleData.gearbox} editKey="gearbox" />
                <div className="pt-2"></div>
                <Row label="Däck" value={vehicleData.wheels.tiresFront} editKey="tires" />
            </Card>

            <Card title="Historik & Status" icon={FileText} warning={true} onEdit={startEditing}>
                <Row label="Mätarställning" value={vehicleData.inspection.mileage} highlight editKey="mileage" />
                <Row label="Senast Besiktigad" value={vehicleData.inspection.last} />
                <Row label="Antal Ägare" value={vehicleData.history.owners} />
                <Row label="Första Trafik" value={vehicleData.regDate} />
            </Card>
        </div>

        {vehicleData.expertAnalysis && (
            <div className="col-span-1 md:col-span-2 xl:col-span-3">
                <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-3xl p-6">
                    <h3 className="font-serif font-bold text-xl text-amber-800 dark:text-amber-500 mb-4 flex items-center gap-2">
                        <AlertTriangle size={24} /> Expertens Analys
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-bold text-sm uppercase text-amber-900/50 mb-3">Vanliga fel & Varningar</h4>
                            <ul className="space-y-3">
                                {vehicleData.expertAnalysis.commonFaults.map((fault, i) => (
                                    <li key={i} className="bg-white dark:bg-nordic-charcoal p-3 rounded-xl border border-amber-100 dark:border-amber-900/30 shadow-sm">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-bold text-nordic-charcoal dark:text-nordic-ice">{fault.title}</span>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                                fault.urgency === 'High' ? 'bg-rose-100 text-rose-700' : 
                                                fault.urgency === 'Medium' ? 'bg-amber-100 text-amber-700' : 
                                                'bg-slate-100 text-slate-600'
                                            }`}>{fault.urgency}</span>
                                        </div>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-snug">{fault.description}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        
                        <div>
                            <h4 className="font-bold text-sm uppercase text-amber-900/50 mb-3">Modifieringar & Tips</h4>
                            <ul className="space-y-3">
                                {vehicleData.expertAnalysis.modificationTips.map((tip, i) => (
                                    <li key={i} className="bg-white dark:bg-nordic-charcoal p-3 rounded-xl border border-amber-100 dark:border-amber-900/30 shadow-sm">
                                        <span className="font-bold text-teal-700 dark:text-teal-400 block mb-1">{tip.title}</span>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-snug">{tip.description}</p>
                                    </li>
                                ))}
                            </ul>
                            {vehicleData.expertAnalysis.maintenanceNotes && (
                                <div className="mt-4 p-3 bg-white dark:bg-nordic-charcoal rounded-xl border border-amber-100 text-sm italic text-slate-500">
                                    " {vehicleData.expertAnalysis.maintenanceNotes} "
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )}
      </>
      )}

      {activeTab === 'contacts' && (
          <div className="space-y-6">
              <div className="bg-white dark:bg-nordic-dark-surface p-6 rounded-3xl border border-nordic-ice dark:border-nordic-dark-bg">
                  <div className="flex items-center gap-3 mb-4">
                      <Phone size={24} className="text-teal-600" />
                      <div>
                          <h3 className="font-serif font-bold text-2xl text-nordic-charcoal dark:text-nordic-ice">
                              Verkstadskontakter
                          </h3>
                          <p className="text-sm text-slate-500 dark:text-nordic-dark-muted">
                              Spara kontakter till verkstäder, specialister och försäkring
                          </p>
                      </div>
                  </div>
              </div>

              <Contacts
                  contacts={contacts}
                  onUpdate={(updatedContacts) => onUpdateContacts && onUpdateContacts(updatedContacts)}
                  featureLocation="vehicleSpecs"
              />
          </div>
      )}

      {activeTab === 'service' && (
          <div className="space-y-6">
              <div className="bg-white dark:bg-nordic-dark-surface p-6 rounded-3xl border border-nordic-ice dark:border-nordic-dark-bg">
                  <h3 className="font-bold text-lg text-nordic-charcoal dark:text-nordic-ice mb-4 flex items-center gap-2"><Plus size={20} /> Ny Servicehändelse</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input className="p-3 bg-slate-50 dark:bg-nordic-dark-bg rounded-xl border border-slate-200 dark:border-nordic-charcoal" placeholder="Beskrivning (t.ex. Oljebyte)" value={newService.description} onChange={e => setNewService({...newService, description: e.target.value})} />
                      <input className="p-3 bg-slate-50 dark:bg-nordic-dark-bg rounded-xl border border-slate-200 dark:border-nordic-charcoal" placeholder="Utförare (t.ex. Mekonomen / Jag)" value={newService.performer} onChange={e => setNewService({...newService, performer: e.target.value})} />
                      <input type="date" className="p-3 bg-slate-50 dark:bg-nordic-dark-bg rounded-xl border border-slate-200 dark:border-nordic-charcoal" value={newService.date} onChange={e => setNewService({...newService, date: e.target.value})} />
                      <input className="p-3 bg-slate-50 dark:bg-nordic-dark-bg rounded-xl border border-slate-200 dark:border-nordic-charcoal" placeholder="Mätarställning (mil)" value={newService.mileage} onChange={e => setNewService({...newService, mileage: e.target.value})} />
                  </div>
                  <button onClick={handleAddService} className="mt-4 w-full py-3 bg-nordic-charcoal dark:bg-teal-600 text-white font-bold rounded-xl hover:bg-slate-800 dark:hover:bg-teal-700">Spara till Serviceboken</button>
              </div>

              <div className="space-y-4">
                  {serviceLog.length === 0 && <p className="text-center text-slate-400 py-8">Inga poster än.</p>}
                  {serviceLog.map((item, idx) => (
                      <div key={idx} className="bg-white dark:bg-nordic-dark-surface p-4 rounded-2xl border border-slate-100 dark:border-nordic-dark-bg flex justify-between items-center">
                          <div>
                              <h4 className="font-bold text-nordic-charcoal dark:text-nordic-ice">{item.description}</h4>
                              <p className="text-xs text-slate-500">{item.date} • {item.mileage}</p>
                          </div>
                          <span className="px-3 py-1 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 text-xs font-bold rounded-lg">{item.performer}</span>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {activeTab === 'find-workshop' && (
          <div className="space-y-6">
              <div className="bg-white dark:bg-nordic-dark-surface p-6 rounded-3xl border border-nordic-ice dark:border-nordic-dark-bg">
                  <div className="flex items-center gap-3 mb-4">
                      <Search size={24} className="text-teal-600" />
                      <div>
                          <h3 className="font-serif font-bold text-2xl text-nordic-charcoal dark:text-nordic-ice">
                              Hitta Verkstäder
                          </h3>
                          <p className="text-sm text-slate-500 dark:text-nordic-dark-muted">
                              Sök efter verkstäder baserat på din plats och bilens märke
                          </p>
                      </div>
                  </div>
              </div>

              <WorkshopFinder
                  userLocation={userLocation}
                  vehicleMake={vehicleData.make}
                  onAddContact={handleAddWorkshopContact}
                  onRequestLocation={requestLocationPermission}
              />
          </div>
      )}

      {activeTab === 'fuel' && (
          <div className="space-y-6">
              <div className="bg-white dark:bg-nordic-dark-surface p-6 rounded-3xl border border-nordic-ice dark:border-nordic-dark-bg">
                  <h3 className="font-bold text-lg text-nordic-charcoal dark:text-nordic-ice mb-4 flex items-center gap-2"><Fuel size={20} /> Logga Tankning</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <input type="date" className="p-3 bg-slate-50 dark:bg-nordic-dark-bg rounded-xl border border-slate-200 dark:border-nordic-charcoal" value={newFuel.date} onChange={e => setNewFuel({...newFuel, date: e.target.value})} />
                      <input className="p-3 bg-slate-50 dark:bg-nordic-dark-bg rounded-xl border border-slate-200 dark:border-nordic-charcoal" placeholder="Liter" type="number" value={newFuel.liters} onChange={e => setNewFuel({...newFuel, liters: e.target.value})} />
                      <input className="p-3 bg-slate-50 dark:bg-nordic-dark-bg rounded-xl border border-slate-200 dark:border-nordic-charcoal" placeholder="Pris/L" type="number" value={newFuel.pricePerLiter} onChange={e => setNewFuel({...newFuel, pricePerLiter: e.target.value})} />
                      <input className="p-3 bg-slate-50 dark:bg-nordic-dark-bg rounded-xl border border-slate-200 dark:border-nordic-charcoal" placeholder="Mätare (mil)" type="number" value={newFuel.mileage} onChange={e => setNewFuel({...newFuel, mileage: e.target.value})} />
                  </div>
                  <button onClick={handleAddFuel} className="mt-4 w-full py-3 bg-nordic-charcoal dark:bg-teal-600 text-white font-bold rounded-xl hover:bg-slate-800 dark:hover:bg-teal-700">Spara Tankning</button>
              </div>

              <div className="space-y-4">
                  {fuelLog.length === 0 && <p className="text-center text-slate-400 py-8">Inga tankningar loggade.</p>}
                  {fuelLog.map((item, idx) => (
                      <div key={idx} className="bg-white dark:bg-nordic-dark-surface p-4 rounded-2xl border border-slate-100 dark:border-nordic-dark-bg flex justify-between items-center">
                          <div>
                              <h4 className="font-bold text-nordic-charcoal dark:text-nordic-ice">{item.liters} liter</h4>
                              <p className="text-xs text-slate-500">{item.date} • {item.mileage} mil</p>
                          </div>
                          <div className="text-right">
                              <p className="font-mono font-bold text-teal-600">{Math.round(item.totalCost)} kr</p>
                              <p className="text-xs text-slate-400">{item.pricePerLiter} kr/l</p>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}
    </div>
  );
};
