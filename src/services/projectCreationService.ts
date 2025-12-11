/**
 * Project Creation Service
 *
 * Orchestrates complete project creation with type-specific onboarding
 * Integrates:
 * - vehicleDataService (reg number lookup)
 * - expertAnalysisService (AI analysis)
 * - onboardingService (complete data generation)
 * - geminiService (existing AI features)
 */

import { ProjectType, Project, VehicleData } from '@/types/types';
import { fetchVehicleByRegNo, enrichVehicleData } from './vehicleDataService';
import { generateCompleteOnboarding, OnboardingInput } from './onboardingService';
import { generateProjectProfile } from './geminiService';
import { EMPTY_PROJECT_TEMPLATE } from '@/constants/constants';

// ===========================
// TYPES
// ===========================

export interface ProjectCreationInput {
  // User selections
  projectType: ProjectType;
  projectName?: string;

  // Vehicle identification (at least one required)
  regNo?: string;
  vinNumber?: string;
  userDescription?: string; // "VW LT31 1976" eller "Mercedes Sprinter 2014"
  imageBase64?: string;

  // User context
  userLocation?: string; // For local contacts
  userId: string;
  userEmail: string;
}

export interface ProjectCreationResult {
  success: boolean;
  project?: Partial<Project>;
  error?: string;
  warnings?: string[];
}

// ===========================
// MAIN CREATION FLOW
// ===========================

/**
 * Create a complete project with full onboarding data
 *
 * Flow:
 * 1. Identify vehicle (reg number, image OCR, or AI analysis)
 * 2. Fetch vehicle data from APIs
 * 3. Generate type-specific content (tasks, knowledge, shopping)
 * 4. Return complete project structure
 */
export async function createProjectWithOnboarding(
  input: ProjectCreationInput
): Promise<ProjectCreationResult> {

  console.log(`🚀 Creating ${input.projectType} project...`);
  const warnings: string[] = [];

  try {
    // ===========================
    // STEP 1: IDENTIFY VEHICLE
    // ===========================

    let vehicleData: Partial<VehicleData> = {};

    // Method 1: Registration number (most reliable)
    if (input.regNo) {
      console.log(`🔍 Fetching vehicle data for ${input.regNo}...`);
      const result = await fetchVehicleByRegNo(input.regNo);

      if (result.success && result.data) {
        vehicleData = result.data;
        console.log(`✅ Vehicle data loaded from ${result.source}`);
      } else {
        warnings.push(`Kunde inte hämta data från regnummer. Använder AI-analys istället.`);
      }
    }

    // Method 2: AI analysis of description/image
    if (!vehicleData.make && (input.userDescription || input.imageBase64)) {
      console.log(`🤖 Using AI to analyze vehicle...`);

      try {
        const aiResult = await generateProjectProfile(
          input.userDescription || '',
          input.imageBase64
        );

        if (aiResult.vehicleData) {
          vehicleData = {
            ...vehicleData,
            ...aiResult.vehicleData
          };
          console.log(`✅ AI identified: ${vehicleData.make} ${vehicleData.model}`);
        }
      } catch (error) {
        console.warn('AI analysis failed:', error);
        warnings.push('AI-analys misslyckades. Några fält kan behöva fyllas i manuellt.');
      }
    }

    // Fallback: Minimal vehicle data
    if (!vehicleData.make) {
      vehicleData = {
        ...EMPTY_PROJECT_TEMPLATE.vehicleData,
        regNo: input.regNo || '',
        make: input.userDescription?.split(' ')[0] || 'Okänd',
        model: input.userDescription?.split(' ').slice(1).join(' ') || 'Modell'
      };
      warnings.push('Kunde inte identifiera fordon automatiskt. Fyll i fordonets data manuellt.');
    }

    // ===========================
    // STEP 2: ENRICH VEHICLE DATA
    // ===========================

    console.log(`🔬 Enriching vehicle data...`);
    vehicleData = await enrichVehicleData(vehicleData);

    // ===========================
    // STEP 3: GENERATE COMPLETE ONBOARDING
    // ===========================

    console.log(`📚 Generating ${input.projectType}-specific content...`);

    const onboardingInput: OnboardingInput = {
      projectType: input.projectType,
      vehicleData: vehicleData,
      userLocation: input.userLocation,
      userInput: input.userDescription,
      imageBase64: input.imageBase64
    };

    const onboarding = await generateCompleteOnboarding(onboardingInput);

    // ===========================
    // STEP 4: BUILD PROJECT STRUCTURE
    // ===========================

    const projectName = input.projectName ||
      `${onboarding.vehicle.make} ${onboarding.vehicle.model}` ||
      'Nytt Projekt';

    const project: Partial<Project> = {
      name: projectName,
      type: input.projectType,
      brand: 'vanplan', // Default brand
      ownerId: input.userId,
      ownerEmail: input.userEmail,

      // Complete vehicle data with expert analysis
      vehicleData: onboarding.vehicle,

      // Generated content
      tasks: onboarding.tasks,
      shoppingItems: onboarding.shoppingList,
      knowledgeArticles: onboarding.knowledgeBase,

      // Empty logs (user will fill these)
      serviceLog: [],
      fuelLog: [],

      // Metadata
      created: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      isDemo: false,

      // Collaboration
      members: [],
      invitedEmails: []
    };

    console.log(`✅ Project created successfully!`);
    console.log(`   - ${onboarding.tasks.length} tasks`);
    console.log(`   - ${onboarding.knowledgeBase.length} knowledge articles`);
    console.log(`   - ${onboarding.shoppingList.length} shopping items`);
    console.log(`   - ${onboarding.contacts.length} contacts`);

    return {
      success: true,
      project,
      warnings: warnings.length > 0 ? warnings : undefined
    };

  } catch (error: any) {
    console.error('Project creation failed:', error);

    return {
      success: false,
      error: error.message || 'Ett oväntat fel inträffade vid projektskapandet.',
      warnings
    };
  }
}

// ===========================
// QUICK HELPERS
// ===========================

/**
 * Quick create from registration number only
 */
export async function createProjectFromRegNo(
  regNo: string,
  projectType: ProjectType,
  userId: string,
  userEmail: string,
  location?: string
): Promise<ProjectCreationResult> {

  return createProjectWithOnboarding({
    projectType,
    regNo,
    userId,
    userEmail,
    userLocation: location
  });
}

/**
 * Quick create from user description + image
 */
export async function createProjectFromDescription(
  description: string,
  imageBase64: string | undefined,
  projectType: ProjectType,
  userId: string,
  userEmail: string,
  location?: string
): Promise<ProjectCreationResult> {

  return createProjectWithOnboarding({
    projectType,
    userDescription: description,
    imageBase64,
    userId,
    userEmail,
    userLocation: location
  });
}

// ===========================
// EXPORT
// ===========================

export default {
  createProjectWithOnboarding,
  createProjectFromRegNo,
  createProjectFromDescription
};
