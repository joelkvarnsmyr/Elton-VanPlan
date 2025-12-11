// @ts-nocheck - TODO: Fix Google AI SDK version mismatch
/**
 * AI Proxy Functions
 *
 * Handles AI chat, parsing, and deep research
 * API keys are securely stored in Google Secret Manager
 */

import * as functions from 'firebase-functions';
import { GoogleGenAI } from '@google/genai';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

const secretClient = new SecretManagerServiceClient();
const region = 'europe-west1'; // EU region

// Cache for API keys (in-memory, per Cloud Function instance)
let cachedGeminiKey: string | null = null;

/**
 * Securely fetch Gemini API key from Secret Manager
 */
async function getGeminiApiKey(): Promise<string> {
  if (cachedGeminiKey) {
    return cachedGeminiKey;
  }

  const projectId = process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT;
  if (!projectId) {
    throw new Error('Project ID not available');
  }

  const [version] = await secretClient.accessSecretVersion({
    name: `projects/${projectId}/secrets/GEMINI_API_KEY/versions/latest`,
  });

  const apiKey = version.payload?.data?.toString();
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not found in Secret Manager');
  }

  cachedGeminiKey = apiKey;
  return apiKey;
}

/**
 * AI Chat Proxy
 *
 * POST /aiChat
 * Body: { message: string, history: [], vehicleData: {}, tasks: [], shoppingList: [], image?: string }
 */
export const aiChat = functions
  .region(region)
  .https.onRequest(async (req, res) => {
    // CORS headers
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }

    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    try {
      const {
        message,
        history,
        vehicleData,
        tasks,
        shoppingList,
        imageBase64,
        systemInstruction
      } = req.body;

      const apiKey = await getGeminiApiKey();
      const ai = new GoogleGenAI({ apiKey });

      const model = ai.getGenerativeModel({
        model: 'gemini-2.0-flash-exp',
        systemInstruction: systemInstruction || 'You are a helpful AI assistant for vehicle maintenance.'
      });

      const chat = model.startChat({
        history: history || []
      });

      const parts: any[] = [{ text: message }];
      if (imageBase64) {
        parts.push({
          inlineData: {
            mimeType: 'image/jpeg',
            data: imageBase64
          }
        });
      }

      const result = await chat.sendMessage(parts);
      const response = result.response;

      res.json({
        success: true,
        text: response.text(),
        functionCalls: response.candidates?.[0]?.content?.parts
          ?.filter((p: any) => p.functionCall)
          ?.map((p: any) => p.functionCall)
      });

    } catch (error: any) {
      console.error('AI Chat error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Internal server error'
      });
    }
  });

/**
 * AI Parsing Proxy (for task/shopping extraction)
 *
 * POST /aiParse
 * Body: { input: string, imageBase64?: string }
 */
export const aiParse = functions
  .region(region)
  .https.onRequest(async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }

    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    try {
      const { input, imageBase64, schema } = req.body;

      const apiKey = await getGeminiApiKey();
      const ai = new GoogleGenAI({ apiKey });

      const model = ai.getGenerativeModel({
        model: 'gemini-2.0-flash-exp',
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: schema
        }
      });

      const parts: any[] = [];
      if (imageBase64) {
        parts.push({ inlineData: { mimeType: 'image/jpeg', data: imageBase64 } });
        parts.push({ text: 'Analysera denna bild. Identifiera uppgifter och inköpsbehov.' });
      } else {
        parts.push({ text: `Analysera följande:\n\n${input}` });
      }

      const result = await model.generateContent({ contents: [{ parts }] });
      const jsonText = result.response.text();

      res.json({
        success: true,
        data: JSON.parse(jsonText)
      });

    } catch (error: any) {
      console.error('AI Parse error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Internal server error'
      });
    }
  });

/**
 * Deep Research Proxy (Project Profile Generation)
 *
 * POST /aiDeepResearch
 * Body: { vehicleDescription: string, imageBase64?: string, projectType?: string, userSkillLevel?: string }
 */
export const aiDeepResearch = functions
  .region(region)
  .runWith({ timeoutSeconds: 300, memory: '1GB' }) // Longer timeout for research
  .https.onRequest(async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }

    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    try {
      const {
        vehicleDescription,
        imageBase64,
        projectType = 'renovation',
        userSkillLevel = 'intermediate',
        detectivePrompt,
        plannerPrompt
      } = req.body;

      const apiKey = await getGeminiApiKey();
      const ai = new GoogleGenAI({ apiKey });

      // Step 1: Detective (with Google Search)
      const detectiveModel = ai.getGenerativeModel({
        model: 'gemini-2.0-flash-exp',
        tools: [{ googleSearch: {} }]
      });

      const detectiveParts: any[] = [{ text: detectivePrompt }];
      if (imageBase64) {
        detectiveParts.push({ inlineData: { mimeType: 'image/jpeg', data: imageBase64 } });
      }

      const detectiveResponse = await detectiveModel.generateContent({
        contents: [{ parts: detectiveParts }]
      });

      let detectiveJson = detectiveResponse.response.text() || '{}';
      if (detectiveJson.includes('```json')) {
        detectiveJson = detectiveJson.split('```json')[1].split('```')[0].trim();
      }

      const detectiveData = JSON.parse(detectiveJson);

      // Step 2: Planner
      const plannerModel = ai.getGenerativeModel({
        model: 'gemini-2.0-flash-exp',
        generationConfig: {
          responseMimeType: 'application/json'
        }
      });

      const plannerResponse = await plannerModel.generateContent(plannerPrompt);
      const plannerData = JSON.parse(plannerResponse.response.text());

      // Merge results
      const result = {
        projectName: detectiveData.projectName,
        projectType: plannerData.projectType || projectType,
        vehicleData: {
          ...detectiveData.vehicleData,
          expertAnalysis: plannerData.expertAnalysis
        },
        initialTasks: plannerData.initialTasks || [],
        analysisReport: plannerData.analysisReport
      };

      res.json({
        success: true,
        data: result
      });

    } catch (error: any) {
      console.error('Deep Research error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Internal server error'
      });
    }
  });
