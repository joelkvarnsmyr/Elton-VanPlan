import { parseTasksFromInput, parseEnhancedProjectData } from './geminiService';
import { ProjectExport } from './projectExportService';
import { Task, ShoppingItem, KnowledgeArticle, Project, VehicleData, ServiceItem } from '@/types/types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Parse complete project data from JSON or text format
 * AI will structure the data according to our model
 */
export const parseProjectData = async (input: string, imageBase64?: string): Promise<{
    vehicleData?: Partial<VehicleData>;
    historyEvents?: Array<{ date?: string; description: string; cost?: number; mileage?: number }>;
    knowledgeArticles?: KnowledgeArticle[];
    tasks?: Task[];
    shoppingItems?: ShoppingItem[];
    contacts?: any[];
    tips?: { title: string; text: string }[];
}> => {
    try {
        // First, try to parse as JSON (if user provided structured data)
        let parsedJson: ProjectExport | null = null;
        try {
            parsedJson = JSON.parse(input);
        } catch {
            // Not JSON, will use AI to parse
        }

        if (parsedJson && parsedJson.vehicle) {
            // Convert structured ProjectExport to our internal format
            return convertProjectExport(parsedJson);
        } else {
            // Use AI to parse unstructured text/image
            return await parseUnstructuredData(input, imageBase64);
        }
    } catch (e) {
        console.error('Project import error:', e);
        throw new Error('Kunde inte importera projektdata');
    }
};

/**
 * Convert ProjectExport format to internal format
 */
const convertProjectExport = (data: ProjectExport): {
    vehicleData?: Partial<VehicleData>;
    historyEvents?: Array<{ date?: string; description: string; cost?: number; mileage?: number }>;
    knowledgeArticles?: KnowledgeArticle[];
    tasks?: Task[];
    shoppingItems?: ShoppingItem[];
    contacts?: any[];
    tips?: { title: string; text: string }[];
} => {
    const result: any = {};

    // Convert vehicle data
    if (data.vehicle) {
        result.vehicleData = {
            regNo: data.vehicle.identity.regNo,
            make: data.vehicle.identity.make,
            model: data.vehicle.identity.model,
            year: data.vehicle.identity.year,
            prodYear: data.vehicle.identity.productionYear,
            regDate: data.vehicle.identity.firstRegistration,
            vin: data.vehicle.identity.vin,
            color: data.vehicle.identity.color,
            bodyType: data.vehicle.identity.bodyType,
            status: data.vehicle.status.current,
            inspection: {
                last: data.vehicle.status.lastInspection,
                mileage: data.vehicle.status.odometerReading?.toString() || '',
                next: ''
            },
            engine: {
                code: data.vehicle.engine.code,
                fuel: data.vehicle.engine.type.includes('Bensin') ? 'Bensin' :
                      data.vehicle.engine.type.includes('Diesel') ? 'Diesel' : '',
                power: data.vehicle.engine.power,
                volume: data.vehicle.engine.type.split(' ')[0] || '',
                cylinders: data.vehicle.engine.cylinders,
                torque: data.vehicle.engine.torque,
                cooling: data.vehicle.engine.cooling,
                valveTrain: data.vehicle.engine.valveTrain,
                carburetor: data.vehicle.engine.carburetor
            },
            gearbox: data.vehicle.specs.gearbox,
            wheels: {
                drive: data.vehicle.specs.drive,
                tiresFront: data.vehicle.specs.tires.split('/')[0]?.trim() || '',
                tiresRear: data.vehicle.specs.tires.split('/')[0]?.trim() || '',
                boltPattern: data.vehicle.specs.tires.split('/')[1]?.trim() || ''
            },
            dimensions: {
                length: data.vehicle.specs.length,
                width: data.vehicle.specs.width,
                height: '',
                wheelbase: data.vehicle.specs.wheelbase
            },
            weights: {
                curb: data.vehicle.specs.weights.curb,
                total: data.vehicle.specs.weights.total,
                load: data.vehicle.specs.weights.load,
                trailer: data.vehicle.specs.weights.trailer,
                trailerB: 0
            },
            passengers: 2,
            history: {
                owners: 0,
                events: 0,
                lastOwnerChange: ''
            }
        };
    }

    // Convert knowledge base
    if (data.knowledgeBase && data.knowledgeBase.length > 0) {
        result.knowledgeArticles = data.knowledgeBase.map(kb => ({
            id: kb.id || uuidv4(),
            title: kb.title,
            summary: kb.summary,
            content: kb.content,
            tags: kb.tags
        }));
    }

    // Convert tasks
    if (data.tasks && data.tasks.length > 0) {
        result.tasks = data.tasks.map(task => {
            // Parse cost
            let estimatedCostMin = 0;
            let estimatedCostMax = 0;
            let actualCost = task.cost || 0;

            if (task.estCost) {
                const costMatch = task.estCost.match(/(\d+)(?:-(\d+))?/);
                if (costMatch) {
                    estimatedCostMin = parseInt(costMatch[1]);
                    estimatedCostMax = costMatch[2] ? parseInt(costMatch[2]) : estimatedCostMin;
                }
            }

            return {
                id: uuidv4(),
                title: task.title,
                description: task.description || '',
                status: task.status,
                phase: task.phase,
                priority: task.priority,
                estimatedCostMin,
                estimatedCostMax,
                actualCost,
                weightKg: 0,
                costType: 'Drift',
                tags: [],
                links: [],
                comments: [],
                attachments: [],
                subtasks: task.checklist?.map(item => ({
                    id: uuidv4(),
                    title: item,
                    completed: false
                })) || []
            } as Task;
        });
    }

    // Convert shopping list
    if (data.shoppingList && data.shoppingList.length > 0) {
        result.shoppingItems = data.shoppingList.map(item => ({
            id: uuidv4(),
            name: item.name,
            category: 'Reservdelar' as const,
            estimatedCost: item.estCost || 0,
            quantity: item.qty || '1 st',
            checked: false,
            url: item.url
        }));
    }

    // Pass through contacts and tips
    result.contacts = data.contacts || [];
    result.tips = data.tips || [];

    return result;
};

/**
 * Use AI to parse unstructured text/image
 * ENHANCED: Now extracts vehicle data, history events, tasks, and shopping items
 */
const parseUnstructuredData = async (text: string, imageBase64?: string): Promise<{
    vehicleData?: Partial<VehicleData>;
    historyEvents?: Array<{ date?: string; description: string; cost?: number; mileage?: number }>;
    tasks?: Task[];
    shoppingItems?: ShoppingItem[];
}> => {
    // Use enhanced parser for complete project data extraction
    const result = await parseEnhancedProjectData(text, imageBase64);

    return {
        vehicleData: result.vehicleData,
        historyEvents: result.historyEvents,
        tasks: result.tasks as Task[],
        shoppingItems: result.shoppingItems as ShoppingItem[]
    };
};

/**
 * Merge imported data into existing project
 */
export const mergeProjectData = (
    existingProject: Project,
    importedData: Awaited<ReturnType<typeof parseProjectData>>
): Partial<Project> => {
    const updates: Partial<Project> = {};

    // Merge vehicle data (only update provided fields)
    if (importedData.vehicleData) {
        updates.vehicleData = {
            ...existingProject.vehicleData,
            ...importedData.vehicleData
        } as VehicleData;
    }

    // Add knowledge articles (append, don't replace)
    if (importedData.knowledgeArticles && importedData.knowledgeArticles.length > 0) {
        updates.knowledgeArticles = [
            ...(existingProject.knowledgeArticles || []),
            ...importedData.knowledgeArticles
        ];
    }

    // Add tasks (append, don't replace)
    if (importedData.tasks && importedData.tasks.length > 0) {
        updates.tasks = [
            ...existingProject.tasks,
            ...importedData.tasks
        ];
    }

    // Add shopping items (append, don't replace)
    if (importedData.shoppingItems && importedData.shoppingItems.length > 0) {
        updates.shoppingItems = [
            ...existingProject.shoppingItems,
            ...importedData.shoppingItems
        ];
    }

    // Add history events to service log (append, don't replace)
    if (importedData.historyEvents && importedData.historyEvents.length > 0) {
        const serviceItems: ServiceItem[] = importedData.historyEvents.map(event => {
            // Convert relative dates to actual dates
            let date = new Date().toISOString().split('T')[0]; // Default to today

            if (event.date) {
                if (event.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
                    // Already in YYYY-MM-DD format
                    date = event.date;
                } else if (event.date.toLowerCase().includes('igår')) {
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    date = yesterday.toISOString().split('T')[0];
                } else if (event.date.toLowerCase().includes('förra veckan')) {
                    const lastWeek = new Date();
                    lastWeek.setDate(lastWeek.getDate() - 7);
                    date = lastWeek.toISOString().split('T')[0];
                } else if (event.date.match(/(\d+)\s*(år|månad|dag)/)) {
                    // Parse "3 år sedan", "2 månader sedan", etc.
                    const match = event.date.match(/(\d+)\s*(år|månad|dag)/);
                    if (match) {
                        const amount = parseInt(match[1]);
                        const unit = match[2];
                        const pastDate = new Date();

                        if (unit === 'år') {
                            pastDate.setFullYear(pastDate.getFullYear() - amount);
                        } else if (unit === 'månad') {
                            pastDate.setMonth(pastDate.getMonth() - amount);
                        } else if (unit === 'dag') {
                            pastDate.setDate(pastDate.getDate() - amount);
                        }

                        date = pastDate.toISOString().split('T')[0];
                    }
                }
            }

            // Determine service type based on description
            let type: ServiceItem['type'] = 'Övrigt';
            const desc = event.description.toLowerCase();

            if (desc.includes('service') || desc.includes('oljebyte') || desc.includes('filter')) {
                type = 'Service';
            } else if (desc.includes('reparation') || desc.includes('bytt') || desc.includes('fixat') || desc.includes('lagat')) {
                type = 'Reparation';
            } else if (desc.includes('besiktning') || desc.includes('kontroll')) {
                type = 'Besiktning';
            } else if (desc.includes('köpt') || desc.includes('köpte') || desc.includes('såld') || desc.includes('sålde')) {
                type = 'Övrigt';
            }

            return {
                id: uuidv4(),
                date,
                description: event.description + (event.cost ? ` (${event.cost} kr)` : ''),
                mileage: event.mileage?.toString() || '',
                performer: 'Importerad från magic import',
                type
            };
        });

        updates.serviceLog = [
            ...existingProject.serviceLog,
            ...serviceItems
        ];
    }

    return updates;
};
