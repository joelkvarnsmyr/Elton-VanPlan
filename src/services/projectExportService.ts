import { Project, Task, ShoppingItem, KnowledgeArticle, Contact } from '@/types/types';

/**
 * Complete project export format matching the structure
 * that AI can understand and import
 */
export interface ProjectExport {
  meta: {
    project: string;
    exported: string;
    version: string;
  };
  vehicle: {
    identity: {
      regNo: string;
      make: string;
      model: string;
      year: number;
      productionYear: number;
      firstRegistration: string;
      vin: string;
      color: string;
      bodyType: string;
    };
    engine: {
      code?: string;
      type: string;
      cylinders?: number;
      power: string;
      torque?: string;
      cooling?: string;
      valveTrain?: string;
      valveAdjustment?: string;
      carburetor?: string;
    };
    specs: {
      gearbox: string;
      drive: string;
      tires: string;
      length: number;
      width: number;
      wheelbase: number;
      weights: {
        curb: number;
        total: number;
        load: number;
        trailer: number;
      };
    };
    status: {
      current: string;
      since?: string;
      lastInspection: string;
      odometerReading?: number;
      odometerNote?: string;
    };
  };
  knowledgeBase: {
    id: string;
    title: string;
    tags: string[];
    summary: string;
    content: string;
  }[];
  tasks: {
    title: string;
    status: string;
    cost?: number;
    estCost?: string;
    phase: string;
    description?: string;
    checklist?: string[];
    priority?: string;
  }[];
  shoppingList: {
    name: string;
    estCost?: number;
    url?: string;
    qty?: string;
  }[];
  contacts?: {
    name: string;
    phone: string;
    type: string;
  }[];
  tips?: {
    title: string;
    text: string;
  }[];
}

/**
 * Export a complete project to the structured format
 * that AI can understand and re-import
 */
export const exportProject = (project: Project, contacts: Contact[] = []): ProjectExport => {
  const v = project.vehicleData;

  return {
    meta: {
      project: project.name,
      exported: new Date().toISOString().split('T')[0],
      version: '2.0'
    },
    vehicle: {
      identity: {
        regNo: v.regNo,
        make: v.make,
        model: v.model,
        year: v.year,
        productionYear: v.prodYear,
        firstRegistration: v.regDate,
        vin: v.vin,
        color: v.color,
        bodyType: v.bodyType
      },
      engine: {
        code: v.engine.code,
        type: `${v.engine.volume} ${v.engine.fuel}`,
        cylinders: v.engine.cylinders,
        power: v.engine.power,
        torque: v.engine.torque,
        cooling: v.engine.cooling,
        valveTrain: v.engine.valveTrain,
        carburetor: v.engine.carburetor
      },
      specs: {
        gearbox: v.gearbox,
        drive: v.wheels.drive,
        tires: `${v.wheels.tiresFront} / ${v.wheels.boltPattern}`,
        length: v.dimensions.length,
        width: v.dimensions.width,
        wheelbase: v.dimensions.wheelbase,
        weights: {
          curb: v.weights.curb,
          total: v.weights.total,
          load: v.weights.load,
          trailer: v.weights.trailer
        }
      },
      status: {
        current: v.status,
        lastInspection: v.inspection.last,
        odometerReading: v.inspection.mileage ? parseInt(v.inspection.mileage.replace(/\s/g, '')) : undefined
      }
    },
    knowledgeBase: (project.knowledgeArticles || []).map(kb => ({
      id: kb.id,
      title: kb.title,
      tags: kb.tags,
      summary: kb.summary,
      content: kb.content
    })),
    tasks: project.tasks.map(task => ({
      title: task.title,
      status: task.status,
      cost: task.actualCost > 0 ? task.actualCost : undefined,
      estCost: task.estimatedCostMin > 0 ?
        (task.estimatedCostMin === task.estimatedCostMax ?
          `${task.estimatedCostMin} kr` :
          `${task.estimatedCostMin}-${task.estimatedCostMax} kr`) :
        undefined,
      phase: task.phase,
      description: task.description || undefined,
      checklist: task.subtasks && task.subtasks.length > 0 ? task.subtasks.map(st => st.title) : undefined,
      priority: task.priority || undefined
    })),
    shoppingList: project.shoppingItems.map(item => ({
      name: item.name,
      estCost: item.estimatedCost,
      url: item.url,
      qty: item.quantity
    })),
    contacts: contacts.map(c => ({
      name: c.name,
      phone: c.phone,
      type: c.specialty || c.category
    })),
    tips: v.expertAnalysis?.maintenanceNotes ? [{
      title: 'Underhållstips',
      text: v.expertAnalysis.maintenanceNotes
    }] : []
  };
};

/**
 * Create a comprehensive context string for AI Assistant
 * Contains ALL project data in a structured, readable format
 */
export const buildAIContext = (project: Project, contacts: Contact[] = []): string => {
  const exported = exportProject(project, contacts);

  let context = `# PROJEKTKONTEXT: ${exported.meta.project}\n\n`;

  // Vehicle Identity
  context += `## FORDON\n`;
  context += `**Registreringsnummer:** ${exported.vehicle.identity.regNo}\n`;
  context += `**Märke & Modell:** ${exported.vehicle.identity.make} ${exported.vehicle.identity.model}\n`;
  context += `**Årsmodell:** ${exported.vehicle.identity.year} (Tillverkad ${exported.vehicle.identity.productionYear})\n`;
  context += `**Första registrering:** ${exported.vehicle.identity.firstRegistration}\n`;
  context += `**Chassinummer:** ${exported.vehicle.identity.vin}\n`;
  context += `**Karosstyp:** ${exported.vehicle.identity.bodyType}\n`;
  context += `**Färg:** ${exported.vehicle.identity.color}\n\n`;

  // Engine
  context += `## MOTOR\n`;
  if (exported.vehicle.engine.code) {
    context += `**Motorkod:** ${exported.vehicle.engine.code}\n`;
  }
  context += `**Typ:** ${exported.vehicle.engine.type}\n`;
  context += `**Effekt:** ${exported.vehicle.engine.power}\n`;
  if (exported.vehicle.engine.cylinders) {
    context += `**Cylindrar:** ${exported.vehicle.engine.cylinders}\n`;
  }
  if (exported.vehicle.engine.torque) {
    context += `**Vridmoment:** ${exported.vehicle.engine.torque}\n`;
  }
  if (exported.vehicle.engine.carburetor) {
    context += `**Förgasare:** ${exported.vehicle.engine.carburetor}\n`;
  }
  context += `\n`;

  // Specs
  context += `## SPECIFIKATIONER\n`;
  context += `**Växellåda:** ${exported.vehicle.specs.gearbox}\n`;
  context += `**Drivning:** ${exported.vehicle.specs.drive}\n`;
  context += `**Däck:** ${exported.vehicle.specs.tires}\n`;
  context += `**Mått (L×B):** ${exported.vehicle.specs.length}×${exported.vehicle.specs.width} mm\n`;
  context += `**Hjulbas:** ${exported.vehicle.specs.wheelbase} mm\n`;
  context += `**Vikter:**\n`;
  context += `  - Tjänstevikt: ${exported.vehicle.specs.weights.curb} kg\n`;
  context += `  - Totalvikt: ${exported.vehicle.specs.weights.total} kg\n`;
  context += `  - Lastvikt: ${exported.vehicle.specs.weights.load} kg\n`;
  context += `  - Släpvagnsvikt: ${exported.vehicle.specs.weights.trailer} kg\n\n`;

  // Status
  context += `## AKTUELL STATUS\n`;
  context += `**Trafikstatus:** ${exported.vehicle.status.current}\n`;
  context += `**Senaste besiktning:** ${exported.vehicle.status.lastInspection}\n`;
  if (exported.vehicle.status.odometerReading) {
    context += `**Mätarställning:** ${exported.vehicle.status.odometerReading} km\n`;
    if (exported.vehicle.status.odometerNote) {
      context += `**Notering:** ${exported.vehicle.status.odometerNote}\n`;
    }
  }
  context += `\n`;

  // Knowledge Base
  if (exported.knowledgeBase.length > 0) {
    context += `## KUNSKAPSBAS (${exported.knowledgeBase.length} artiklar)\n\n`;
    exported.knowledgeBase.forEach(kb => {
      context += `### ${kb.title}\n`;
      context += `**Tags:** ${kb.tags ? kb.tags.join(', ') : 'Inga'}\n`;
      context += `**Sammanfattning:** ${kb.summary}\n\n`;
      context += `${kb.content}\n\n`;
      context += `---\n\n`;
    });
  }

  // Tasks
  if (exported.tasks.length > 0) {
    context += `## UPPGIFTER (${exported.tasks.length} st)\n\n`;

    // Group by phase
    const tasksByPhase: Record<string, typeof exported.tasks> = {};
    exported.tasks.forEach(task => {
      if (!tasksByPhase[task.phase]) {
        tasksByPhase[task.phase] = [];
      }
      tasksByPhase[task.phase].push(task);
    });

    Object.entries(tasksByPhase).forEach(([phase, tasks]) => {
      context += `### ${phase}\n`;
      tasks.forEach(task => {
        context += `- **${task.title}** [${task.status}]\n`;
        if (task.description) {
          context += `  ${task.description}\n`;
        }
        if (task.cost) {
          context += `  Kostnad: ${task.cost} kr\n`;
        } else if (task.estCost) {
          context += `  Uppskattad kostnad: ${task.estCost}\n`;
        }
        if (task.checklist) {
          context += `  Checklista:\n`;
          task.checklist.forEach(item => {
            context += `    • ${item}\n`;
          });
        }
      });
      context += `\n`;
    });
  }

  // Shopping List
  if (exported.shoppingList.length > 0) {
    context += `## INKÖPSLISTA (${exported.shoppingList.length} artiklar)\n\n`;
    exported.shoppingList.forEach(item => {
      context += `- **${item.name}**`;
      if (item.qty) context += ` (${item.qty})`;
      if (item.estCost) context += ` - ${item.estCost} kr`;
      if (item.url) context += ` [${item.url}]`;
      context += `\n`;
    });
    context += `\n`;
  }

  // Contacts
  if (exported.contacts && exported.contacts.length > 0) {
    context += `## KONTAKTER\n\n`;
    exported.contacts.forEach(contact => {
      context += `- **${contact.name}** (${contact.type})\n`;
      context += `  Tel: ${contact.phone}\n`;
    });
    context += `\n`;
  }

  // Tips
  if (exported.tips && exported.tips.length > 0) {
    context += `## TIPS & VARNINGAR\n\n`;
    exported.tips.forEach(tip => {
      context += `**${tip.title}:** ${tip.text}\n\n`;
    });
  }

  return context;
};

/**
 * Calculate project statistics for AI context
 */
export const getProjectStats = (project: Project) => {
  const totalTasks = project.tasks.length;
  const completedTasks = project.tasks.filter(t => t.status === 'Klart').length;
  const inProgressTasks = project.tasks.filter(t => t.status === 'Pågående').length;

  const totalEstimatedCost = project.tasks.reduce((sum, t) => sum + t.estimatedCostMax, 0);
  const totalActualCost = project.tasks.reduce((sum, t) => sum + t.actualCost, 0);

  const shoppingTotal = project.shoppingItems.reduce((sum, i) => sum + (i.actualCost || i.estimatedCost), 0);
  const shoppingCompleted = project.shoppingItems.filter(i => i.checked).length;

  return {
    tasks: {
      total: totalTasks,
      completed: completedTasks,
      inProgress: inProgressTasks,
      remaining: totalTasks - completedTasks
    },
    costs: {
      estimated: totalEstimatedCost,
      actual: totalActualCost,
      shopping: shoppingTotal
    },
    shopping: {
      total: project.shoppingItems.length,
      completed: shoppingCompleted
    }
  };
};
