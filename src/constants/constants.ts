
import {
  Project,
  VehicleData,
  KnowledgeArticle,
  ShoppingItemStatus,
  TaskStatus,
  Priority,
  MechanicalPhase,
  BuildPhase,
  CostType,
  TaskType,
  BuildPhase as BuildPhaseEnum,
  MechanicalPhase as MechanicalPhaseEnum
} from '@/types/types';

// ============================================================================
// PROJECT TEMPLATES & DEFAULTS
// Note: Large demo data has been migrated to Firestore template project 'template-elton'
// ============================================================================

export const EMPTY_PROJECT_TEMPLATE: Project = {
  id: '',
  name: 'Nytt Projekt',
  type: 'renovation',
  brand: 'vanplan',
  // NEW ownership model
  ownerIds: [],
  primaryOwnerId: '',
  memberIds: [],
  invitedEmails: [],
  // Legacy fields (for backwards compatibility)
  ownerId: '',
  ownerEmail: '',
  vehicleData: {
    regNo: '', make: '', model: '', year: 0, prodYear: 0, regDate: '', status: '', bodyType: '', passengers: 0,
    inspection: { last: '', mileage: '', next: '' },
    engine: { fuel: '', power: '', volume: '' },
    gearbox: '',
    wheels: { drive: '', tiresFront: '', tiresRear: '', boltPattern: '' },
    dimensions: { length: 0, width: 0, height: '', wheelbase: 0 },
    weights: { curb: 0, total: 0, load: 0, trailer: 0, trailerB: 0 },
    vin: '', color: '',
    history: { owners: 0, events: 0, lastOwnerChange: '' }
  },
  tasks: [],
  shoppingItems: [],
  serviceLog: [],
  fuelLog: [],
  knowledgeArticles: [],
  created: '',
  lastModified: ''
};

// ============================================================================
// KNOWLEDGE BASE RULES
// ============================================================================

export const CRITICAL_WARNINGS = [
  {
    id: 'gl4-oil',
    condition: (v: VehicleData) => v.year < 1990 && v.gearbox?.toLowerCase().includes('manuell'),
    title: '⚠️ Varning: Växellådsolja (Gulmetall)',
    content: 'Gamla manuella växellådor (pre-1990) har ofta synkroniseringar av mässing/gulmetall. Modern API GL-5 olja innehåller additiv som fräter sönder dessa. Du MÅSTE använda API GL-4. Använd aldrig GL-5 om du inte är 100% säker på att lådan tål det.'
  },
  {
    id: 'interference-engine',
    // D24 är känd, men generellt för gamla bilar med rem är detta en bra varning att kolla upp
    condition: (v: VehicleData) => (v.engine.code?.includes('D24') || v.engine.code?.includes('B230K') || v.year < 2000),
    title: '⚠️ Varning: Kamrem (Interference)',
    content: 'Många äldre motorer är av typen "Interference". Om kamremmen går av krockar kolvar och ventiler, vilket leder till totalhaveri. Om historik saknas: Byt rem direkt!'
  },
  {
    id: 'lt-kingpins',
    condition: (v: VehicleData) => (v.model?.includes('LT') && v.year < 1996),
    title: '⚠️ Modellspecifikt: VW LT Spindelbultar',
    content: 'Framvagnen på VW LT Mk1 har spindelbultar (kingpins) som MÅSTE smörjas regelbundet (var 500:e mil). Om de rostar fast blir styrningen trög och byte kräver ofta press och värme.'
  }
];

// ============================================================================
// PLACEHOLDERS
// ============================================================================

export const VEHICLE_TIPS = [];
export const RESOURCE_LINKS = [];
export const KNOWLEDGE_ARTICLES: KnowledgeArticle[] = [];
