import { TaskStatus, Priority, CostType, TaskType, MechanicalPhase, BuildPhase } from './enums';
import { Link, Comment, Attachment } from './common';
import { DifficultyLevel } from './user';

// Task Blocker (dependency reference)
export interface TaskBlocker {
    taskId: string;
    reason?: string;  // e.g., "Måste svetsa innan isolering"
}

export interface Subtask {
    id: string;
    title: string;
    completed: boolean;
}

export interface DecisionOption {
    id: string;
    title: string;
    description: string;
    costRange: string;
    pros: string[];
    cons: string[];
    recommended?: boolean;
}

export interface Task {
    id: string;
    title: string;
    description: string;
    status: TaskStatus;
    phase: string;
    priority?: Priority;
    sprint?: string;
    estimatedCostMin: number;
    estimatedCostMax: number;
    actualCost: number;
    weightKg: number;
    costType: CostType;
    tags: string[];
    links: Link[];
    comments: Comment[];
    attachments: Attachment[];
    subtasks: Subtask[];
    decisionOptions?: DecisionOption[];

    // Planner Improvements
    difficultyLevel?: DifficultyLevel;
    requiredTools?: string[];

    // Advanced Project Management (New)
    type?: TaskType;
    mechanicalPhase?: MechanicalPhase;
    buildPhase?: BuildPhase;
    blockers?: TaskBlocker[]; // Tasks blocking this one (with optional reason)

    // Inspection Linking
    inspectionFindingIds?: string[]; // DetailedInspectionFinding IDs this task addresses

    // Timestamps
    created?: string;
    lastModified?: string;

    // Dependencies
    dependencies?: string[];
}
