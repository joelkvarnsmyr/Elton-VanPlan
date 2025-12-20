"use strict";
/**
 * AI Proxy Cloud Function
 *
 * Hanterar alla AI-anrop serverns sida och skyddar API-nycklar.
 * Exponerar endpoints for Gemini streaming chat och strukturerad parsing.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiToolResponse = exports.aiDeepResearch = exports.aiParse = exports.aiChat = void 0;
const https_1 = require("firebase-functions/v2/https");
const params_1 = require("firebase-functions/params");
const genai_1 = require("@google/genai");
// Definiera secrets som hämtas från Secret Manager vid deploy
const geminiApiKey = (0, params_1.defineSecret)('GEMINI_API_KEY');
// Model configuration
// Using Gemini 3 Pro Preview for critical tasks (best reasoning model)
const DEFAULT_MODEL = 'gemini-3-pro-preview';
const FAST_MODEL = 'gemini-2.5-flash'; // For quick, less critical tasks
// Tool declarations for the AI assistant
const functionDeclarations = [
    {
        name: 'addTask',
        description: 'Add a new task to the project plan.',
        parameters: {
            type: genai_1.Type.OBJECT,
            properties: {
                title: { type: genai_1.Type.STRING, description: 'Short title of the task' },
                description: { type: genai_1.Type.STRING, description: 'Detailed description' },
                estimatedCostMax: { type: genai_1.Type.NUMBER, description: 'Estimated max cost in SEK' },
                phase: { type: genai_1.Type.STRING, description: 'Project phase' },
                priority: { type: genai_1.Type.STRING, enum: ['Hög', 'Medel', 'Låg'], description: 'Priority level' },
                sprint: { type: genai_1.Type.STRING, description: 'Sprint name' },
                subtasks: { type: genai_1.Type.ARRAY, items: { type: genai_1.Type.STRING }, description: 'Checklist items' },
                difficultyLevel: { type: genai_1.Type.STRING, enum: ['beginner', 'intermediate', 'expert'], description: 'Skill level required' },
                requiredTools: { type: genai_1.Type.ARRAY, items: { type: genai_1.Type.STRING }, description: 'Tools needed for this task' },
                blockers: {
                    type: genai_1.Type.ARRAY,
                    items: {
                        type: genai_1.Type.OBJECT,
                        properties: {
                            reason: { type: genai_1.Type.STRING, description: 'Why this task is blocked' },
                            blockedBy: { type: genai_1.Type.STRING, description: 'Task title that must complete first' }
                        },
                        required: ['reason']
                    },
                    description: 'Tasks or issues blocking this task'
                },
                decisionOptions: {
                    type: genai_1.Type.ARRAY,
                    items: {
                        type: genai_1.Type.OBJECT,
                        properties: {
                            title: { type: genai_1.Type.STRING, description: 'Option title' },
                            description: { type: genai_1.Type.STRING, description: 'What this option entails' },
                            costRange: { type: genai_1.Type.STRING, description: 'Cost range for this option' },
                            pros: { type: genai_1.Type.ARRAY, items: { type: genai_1.Type.STRING }, description: 'Advantages' },
                            cons: { type: genai_1.Type.ARRAY, items: { type: genai_1.Type.STRING }, description: 'Disadvantages' },
                            recommended: { type: genai_1.Type.BOOLEAN, description: 'Is this your recommended option?' }
                        },
                        required: ['title', 'description']
                    },
                    description: 'Decision alternatives for the user to choose from'
                }
            },
            required: ['title', 'description', 'phase']
        }
    },
    {
        name: 'updateTask',
        description: 'Update an existing task.',
        parameters: {
            type: genai_1.Type.OBJECT,
            properties: {
                taskTitleKeywords: { type: genai_1.Type.STRING, description: 'Keywords to find the task' },
                newStatus: { type: genai_1.Type.STRING, enum: ['todo', 'in-progress', 'done'], description: 'New status' },
                newPriority: { type: genai_1.Type.STRING, enum: ['Hög', 'Medel', 'Låg'], description: 'New priority' },
                newSprint: { type: genai_1.Type.STRING, description: 'Assign to sprint' },
                newTitle: { type: genai_1.Type.STRING, description: 'New title' },
                newDescription: { type: genai_1.Type.STRING, description: 'New description' },
                newCost: { type: genai_1.Type.NUMBER, description: 'New estimated cost' }
            },
            required: ['taskTitleKeywords']
        }
    },
    {
        name: 'deleteTask',
        description: 'Delete a task from the project.',
        parameters: {
            type: genai_1.Type.OBJECT,
            properties: {
                taskTitleKeywords: { type: genai_1.Type.STRING, description: 'Keywords to find task to delete' }
            },
            required: ['taskTitleKeywords']
        }
    },
    {
        name: 'addToShoppingList',
        description: 'Add item to shopping list.',
        parameters: {
            type: genai_1.Type.OBJECT,
            properties: {
                name: { type: genai_1.Type.STRING, description: 'Item name' },
                category: { type: genai_1.Type.STRING, description: 'Category' },
                estimatedCost: { type: genai_1.Type.NUMBER, description: 'Estimated cost in SEK' },
                quantity: { type: genai_1.Type.STRING, description: 'Quantity' },
                linkedTaskId: { type: genai_1.Type.STRING, description: 'ID or title keywords of related task' },
                options: {
                    type: genai_1.Type.ARRAY,
                    items: {
                        type: genai_1.Type.OBJECT,
                        properties: {
                            store: { type: genai_1.Type.STRING, description: 'Store name (e.g. Biltema, Autodoc, Jula)' },
                            price: { type: genai_1.Type.NUMBER, description: 'Price in SEK' },
                            shippingCost: { type: genai_1.Type.NUMBER, description: 'Shipping cost in SEK (0 if pickup)' },
                            url: { type: genai_1.Type.STRING, description: 'Direct product URL' },
                            inStock: { type: genai_1.Type.BOOLEAN, description: 'Is item in stock?' },
                            deliveryTimeDays: { type: genai_1.Type.NUMBER, description: 'Delivery time in days (0 = pickup today)' }
                        },
                        required: ['store', 'price']
                    },
                    description: 'Vendor options with prices and availability - use this to help user compare where to buy!'
                }
            },
            required: ['name']
        }
    },
    {
        name: 'registerPurchase',
        description: 'Mark shopping item as purchased.',
        parameters: {
            type: genai_1.Type.OBJECT,
            properties: {
                itemNameKeywords: { type: genai_1.Type.STRING, description: 'Keywords to find item' },
                actualCost: { type: genai_1.Type.NUMBER, description: 'Actual price paid' },
                store: { type: genai_1.Type.STRING, description: 'Where purchased' },
                date: { type: genai_1.Type.STRING, description: 'Purchase date (YYYY-MM-DD)' }
            },
            required: ['itemNameKeywords', 'actualCost']
        }
    },
    {
        name: 'updateShoppingItem',
        description: 'Update shopping item details.',
        parameters: {
            type: genai_1.Type.OBJECT,
            properties: {
                itemNameKeywords: { type: genai_1.Type.STRING, description: 'Keywords to find item' },
                newName: { type: genai_1.Type.STRING, description: 'New name' },
                newQuantity: { type: genai_1.Type.STRING, description: 'New quantity' },
                newCategory: { type: genai_1.Type.STRING, description: 'New category' },
                newCost: { type: genai_1.Type.NUMBER, description: 'New estimated cost' }
            },
            required: ['itemNameKeywords']
        }
    },
    {
        name: 'deleteShoppingItem',
        description: 'Remove item from shopping list.',
        parameters: {
            type: genai_1.Type.OBJECT,
            properties: {
                itemNameKeywords: { type: genai_1.Type.STRING, description: 'Keywords to find item to delete' }
            },
            required: ['itemNameKeywords']
        }
    },
    {
        name: 'createKnowledgeArticle',
        description: 'Save information to Knowledge Base.',
        parameters: {
            type: genai_1.Type.OBJECT,
            properties: {
                title: { type: genai_1.Type.STRING, description: 'Article title' },
                summary: { type: genai_1.Type.STRING, description: 'Short summary' },
                content: { type: genai_1.Type.STRING, description: 'Full content in Markdown' },
                tags: { type: genai_1.Type.ARRAY, items: { type: genai_1.Type.STRING }, description: 'Tags' }
            },
            required: ['title', 'content']
        }
    }
];
const tools = [
    { googleSearch: {} },
    { functionDeclarations }
];
// --- CLOUD FUNCTIONS ---
/**
 * AI Chat - Handles streaming chat with tool calling
 *
 * Note: Firebase Callable functions don't support true streaming,
 * so we return the full response. For true streaming, use HTTP functions
 * with SSE or consider Firebase Realtime Database for updates.
 */
exports.aiChat = (0, https_1.onCall)({
    secrets: [geminiApiKey],
    region: 'europe-west1',
    maxInstances: 10,
    timeoutSeconds: 120,
    memory: '512MiB',
    cors: ['http://localhost:3000', 'http://localhost:5173', 'https://eltonvanplan.web.app', 'https://eltonvanplan.firebaseapp.com']
}, async (request) => {
    // Verify authentication
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { history, newMessage, systemInstruction, imageBase64, model } = request.data;
    if (!newMessage) {
        throw new https_1.HttpsError('invalid-argument', 'Message is required');
    }
    const apiKey = geminiApiKey.value();
    if (!apiKey) {
        throw new https_1.HttpsError('failed-precondition', 'API key not configured');
    }
    try {
        const ai = new genai_1.GoogleGenAI({ apiKey });
        const modelName = model || DEFAULT_MODEL;
        // Map history to new API format
        const historyContents = history.map(h => {
            const parts = [{ text: h.content }];
            if (h.image) {
                parts.push({
                    inlineData: {
                        mimeType: 'image/jpeg',
                        data: h.image.split(',')[1] || h.image
                    }
                });
            }
            return { role: h.role, parts };
        });
        // Create chat with new API
        const chat = ai.chats.create({
            model: modelName,
            config: {
                tools,
                systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined
            },
            history: historyContents
        });
        // Prepare message parts
        const parts = [{ text: newMessage }];
        if (imageBase64) {
            parts.push({
                inlineData: {
                    mimeType: 'image/jpeg',
                    data: imageBase64
                }
            });
        }
        const result = await chat.sendMessage({ message: parts });
        const response = result;
        // Extract text and function calls
        const textParts = response.candidates?.[0]?.content?.parts?.filter((p) => p.text) || [];
        const functionCalls = response.candidates?.[0]?.content?.parts?.filter((p) => p.functionCall)?.map((p) => p.functionCall) || [];
        return {
            text: textParts.map((p) => p.text).join(''),
            functionCalls,
            finishReason: response.candidates?.[0]?.finishReason
        };
    }
    catch (error) {
        console.error('AI Chat Error:', error);
        throw new https_1.HttpsError('internal', `AI request failed: ${error.message}`);
    }
});
/**
 * AI Parse - Structured JSON output for tasks/shopping items
 */
exports.aiParse = (0, https_1.onCall)({
    secrets: [geminiApiKey],
    region: 'europe-west1',
    maxInstances: 10,
    timeoutSeconds: 60,
    memory: '256MiB',
    cors: ['http://localhost:3000', 'http://localhost:5173', 'https://eltonvanplan.web.app', 'https://eltonvanplan.firebaseapp.com']
}, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { input, imageBase64, systemInstruction, model } = request.data;
    if (!input && !imageBase64) {
        throw new https_1.HttpsError('invalid-argument', 'Input text or image required');
    }
    const apiKey = geminiApiKey.value();
    if (!apiKey) {
        throw new https_1.HttpsError('failed-precondition', 'API key not configured');
    }
    const outputSchema = {
        type: genai_1.Type.OBJECT,
        properties: {
            tasks: {
                type: genai_1.Type.ARRAY,
                items: {
                    type: genai_1.Type.OBJECT,
                    properties: {
                        title: { type: genai_1.Type.STRING },
                        description: { type: genai_1.Type.STRING },
                        estimatedCostMin: { type: genai_1.Type.NUMBER },
                        estimatedCostMax: { type: genai_1.Type.NUMBER },
                        phase: { type: genai_1.Type.STRING },
                        priority: { type: genai_1.Type.STRING, enum: ['Hög', 'Medel', 'Låg'] },
                        subtasks: {
                            type: genai_1.Type.ARRAY,
                            items: {
                                type: genai_1.Type.OBJECT,
                                properties: { title: { type: genai_1.Type.STRING } }
                            }
                        },
                        tags: { type: genai_1.Type.ARRAY, items: { type: genai_1.Type.STRING } }
                    },
                    required: ['title', 'description', 'phase']
                }
            },
            shoppingItems: {
                type: genai_1.Type.ARRAY,
                items: {
                    type: genai_1.Type.OBJECT,
                    properties: {
                        name: { type: genai_1.Type.STRING },
                        category: { type: genai_1.Type.STRING, enum: ['Reservdelar', 'Kemi & Färg', 'Verktyg', 'Inredning', 'Övrigt'] },
                        estimatedCost: { type: genai_1.Type.NUMBER },
                        quantity: { type: genai_1.Type.STRING }
                    },
                    required: ['name', 'estimatedCost']
                }
            }
        }
    };
    try {
        const ai = new genai_1.GoogleGenAI({ apiKey });
        // Use fast model for parsing (speed over deep reasoning)
        const modelName = model || FAST_MODEL;
        const parts = [];
        if (imageBase64) {
            parts.push({ inlineData: { mimeType: 'image/jpeg', data: imageBase64 } });
            parts.push({ text: 'Analysera denna bild. Identifiera uppgifter och inköpsbehov.' });
        }
        else {
            parts.push({ text: `Analysera följande:\n\n${input}` });
        }
        const result = await ai.models.generateContent({
            model: modelName,
            contents: [{ role: 'user', parts }],
            config: {
                responseMimeType: 'application/json',
                responseSchema: outputSchema,
                systemInstruction: { parts: [{ text: systemInstruction || 'Du är en expert på att strukturera projektdata för fordonsrenovering.' }] }
            }
        });
        const jsonText = result.text;
        if (!jsonText) {
            return { tasks: [], shoppingItems: [] };
        }
        return JSON.parse(jsonText);
    }
    catch (error) {
        console.error('AI Parse Error:', error);
        throw new https_1.HttpsError('internal', `Parse request failed: ${error.message}`);
    }
});
/**
 * Deep Research - Multi-agent vehicle analysis
 */
exports.aiDeepResearch = (0, https_1.onCall)({
    secrets: [geminiApiKey],
    region: 'europe-west1',
    maxInstances: 5,
    timeoutSeconds: 180,
    memory: '1GiB',
    cors: true
}, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { vehicleDescription, imageBase64, projectType, 
    // userSkillLevel, // TODO: Use this in prompts
    detectivePrompt, plannerPrompt } = request.data;
    if (!vehicleDescription) {
        throw new https_1.HttpsError('invalid-argument', 'Vehicle description required');
    }
    const apiKey = geminiApiKey.value();
    if (!apiKey) {
        throw new https_1.HttpsError('failed-precondition', 'API key not configured');
    }
    try {
        const ai = new genai_1.GoogleGenAI({ apiKey });
        // Use fast model for Deep Research (2 sequential calls, need speed)
        const modelName = FAST_MODEL;
        console.log('🚀 Deep Research starting:', {
            vehicle: vehicleDescription,
            projectType,
            model: modelName,
            hasImage: !!imageBase64
        });
        // --- AGENT 1: DETECTIVE ---
        console.log('🕵️ Agent 1: Detective started...');
        const detectiveStartTime = Date.now();
        const detectiveParts = [{ text: detectivePrompt }];
        if (imageBase64) {
            detectiveParts.push({ inlineData: { mimeType: 'image/jpeg', data: imageBase64 } });
            console.log('📸 Image included in detective analysis');
        }
        let detectiveData = {};
        try {
            const detectiveResponse = await ai.models.generateContent({
                model: modelName,
                contents: [{ role: 'user', parts: detectiveParts }],
                config: {
                    tools: [{ googleSearch: {} }]
                }
            });
            const detectiveTime = Date.now() - detectiveStartTime;
            console.log(`⏱️ Detective completed in ${detectiveTime}ms`);
            let detectiveJson = detectiveResponse.text || '{}';
            if (detectiveJson.includes('```json')) {
                detectiveJson = detectiveJson.split('```json')[1].split('```')[0].trim();
            }
            detectiveData = JSON.parse(detectiveJson);
            const dataPoints = Object.keys(detectiveData.vehicleData || {}).length;
            console.log('✅ Detective found:', {
                projectName: detectiveData.projectName,
                make: detectiveData.vehicleData?.make,
                model: detectiveData.vehicleData?.model,
                year: detectiveData.vehicleData?.year,
                dataPoints: dataPoints
            });
        }
        catch (detectiveError) {
            const detectiveTime = Date.now() - detectiveStartTime;
            console.error(`❌ Detective failed after ${detectiveTime}ms:`, {
                error: detectiveError.message,
                status: detectiveError.status
            });
            console.warn('🔄 Using fallback data...');
            detectiveData = {
                projectName: vehicleDescription.substring(0, 30),
                vehicleData: {
                    make: vehicleDescription.split(' ')[0] || 'Okänd',
                    model: vehicleDescription.split(' ').slice(1).join(' ') || 'Modell',
                    year: new Date().getFullYear() - 20
                }
            };
        }
        // --- AGENT 2: PLANNER ---
        console.log('📝 Agent 2: Planner started...');
        const plannerStartTime = Date.now();
        const plannerResponse = await ai.models.generateContent({
            model: modelName,
            contents: [{ role: 'user', parts: [{ text: plannerPrompt }] }],
            config: {
                responseMimeType: 'application/json'
            }
        });
        const plannerTime = Date.now() - plannerStartTime;
        console.log(`⏱️ Planner completed in ${plannerTime}ms`);
        let plannerJson = plannerResponse.text || '{}';
        if (plannerJson.includes('```json')) {
            plannerJson = plannerJson.split('```json')[1].split('```')[0].trim();
        }
        const plannerData = JSON.parse(plannerJson);
        const taskCount = plannerData.initialTasks?.length || 0;
        const shoppingCount = plannerData.shoppingItems?.length || 0;
        console.log('✅ Planner created:', {
            tasks: taskCount,
            shoppingItems: shoppingCount,
            hasAnalysisReport: !!plannerData.analysisReport
        });
        // --- MERGE RESULTS ---
        const result = {
            projectName: detectiveData.projectName,
            projectType: plannerData.projectType || projectType || 'renovation',
            vehicleData: {
                ...detectiveData.vehicleData,
                expertAnalysis: plannerData.expertAnalysis
            },
            initialTasks: plannerData.initialTasks || [],
            analysisReport: plannerData.analysisReport,
            provider: 'gemini'
        };
        const totalTime = Date.now() - detectiveStartTime;
        console.log('🎉 Deep Research completed:', {
            totalTimeMs: totalTime,
            totalTimeSec: (totalTime / 1000).toFixed(1) + 's',
            vehicleDataFields: Object.keys(result.vehicleData).length,
            tasksCreated: result.initialTasks.length
        });
        return result;
    }
    catch (error) {
        console.error('Deep Research Error:', error);
        // Return minimal fallback
        return {
            projectName: vehicleDescription.substring(0, 30) || 'Nytt Projekt',
            projectType: projectType || 'renovation',
            vehicleData: {
                make: vehicleDescription.split(' ')[0] || 'Okänd',
                model: vehicleDescription.split(' ').slice(1).join(' ') || 'Modell',
                year: new Date().getFullYear() - 10
            },
            initialTasks: [],
            analysisReport: null,
            error: 'AI-tjänster otillgängliga'
        };
    }
});
/**
 * Send tool responses back to the AI for continued conversation
 */
exports.aiToolResponse = (0, https_1.onCall)({
    secrets: [geminiApiKey],
    region: 'europe-west1',
    maxInstances: 10,
    timeoutSeconds: 60,
    memory: '256MiB',
    cors: ['http://localhost:3000', 'http://localhost:5173', 'https://eltonvanplan.web.app', 'https://eltonvanplan.firebaseapp.com']
}, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { history, toolResponses, systemInstruction, model } = request.data;
    const apiKey = geminiApiKey.value();
    if (!apiKey) {
        throw new https_1.HttpsError('failed-precondition', 'API key not configured');
    }
    try {
        const ai = new genai_1.GoogleGenAI({ apiKey });
        const modelName = model || FAST_MODEL; // Tool responses use fast model
        const historyContents = history.map(h => ({
            role: h.role,
            parts: [{ text: h.content }]
        }));
        const chat = ai.chats.create({
            model: modelName,
            config: {
                tools,
                systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined
            },
            history: historyContents
        });
        const result = await chat.sendMessage({
            message: toolResponses.map(r => ({
                functionResponse: {
                    name: r.name,
                    response: { result: r.result }
                }
            }))
        });
        const response = result;
        const textParts = response.candidates?.[0]?.content?.parts?.filter((p) => p.text) || [];
        const functionCalls = response.candidates?.[0]?.content?.parts?.filter((p) => p.functionCall)?.map((p) => p.functionCall) || [];
        return {
            text: textParts.map((p) => p.text).join(''),
            functionCalls,
            finishReason: response.candidates?.[0]?.finishReason
        };
    }
    catch (error) {
        console.error('Tool Response Error:', error);
        throw new https_1.HttpsError('internal', `Tool response failed: ${error.message}`);
    }
});
//# sourceMappingURL=proxy.js.map