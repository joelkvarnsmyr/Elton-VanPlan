import {
  Task,
  TaskStatus,
  Priority,
  TaskType,
  MechanicalPhase,
  CostType,
  InspectionFinding,
} from '@/types/types';

/**
 * Convert an InspectionFinding to a Task using deterministic mapping rules.
 * Pure function – safe to unit test.
 */
export const convertFindingToTask = (finding: InspectionFinding): Task => {
  // Map severity to priority
  const priority: Priority =
    finding.severity === 'CRITICAL'
      ? Priority.HIGH
      : finding.severity === 'WARNING'
        ? Priority.MEDIUM
        : Priority.LOW;

  // Map zone to mechanical phase
  let mechanicalPhase: MechanicalPhase | undefined;
  if (finding.category === 'ENGINE') mechanicalPhase = MechanicalPhase.P1_ENGINE;
  else if (
    finding.category === 'UNDERCARRIAGE' ||
    finding.category === 'EXTERIOR'
  )
    mechanicalPhase = MechanicalPhase.P2_RUST;
  else mechanicalPhase = MechanicalPhase.P3_FUTURE;

  const now = new Date().toISOString();
  const title =
    finding.severity === 'CRITICAL'
      ? `AKUT: ${finding.aiDiagnosis}`
      : finding.severity === 'WARNING'
        ? `Åtgärd: ${finding.aiDiagnosis}`
        : `Notera: ${finding.aiDiagnosis}`;

  const newTask: Task = {
    id: Math.random().toString(36).slice(2),
    title: title.slice(0, 120),
    description:
      `Skapat via Elton Inspector (${finding.category}).\n\n` +
      `Allvarlighet: ${finding.severity} (${finding.confidence}%).\n\n` +
      `Diagnos:\n${finding.aiDiagnosis}`,
    status: TaskStatus.TODO,
    phase: mechanicalPhase || '3. Löpande Underhåll',
    priority,
    sprint: undefined,
    estimatedCostMin: 0,
    estimatedCostMax: 0,
    actualCost: 0,
    weightKg: 0,
    costType: CostType.OPERATION,
    tags: ['Inspector', finding.category],
    links: [],
    comments: [],
    attachments: [],
    subtasks: [],
    type: TaskType.MAINTENANCE,
    mechanicalPhase,
    created: now,
    lastModified: now,
  };

  return newTask;
};
