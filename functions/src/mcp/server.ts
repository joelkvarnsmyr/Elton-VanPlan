import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import * as admin from "firebase-admin";
import { z } from "zod";

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();

// Create MCP Server
export const server = new McpServer({
    name: "Elton VanPlan Backend",
    version: "1.0.0"
});

// --- RESOURCES ---

// Resource: List all tasks for a project
server.resource(
    "tasks",
    "elton://{projectId}/tasks",
    async (uri, { projectId }) => {
        const snapshot = await db.collection("projects").doc(projectId).collection("tasks").get();
        const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return {
            contents: [{
                uri: uri.href,
                text: JSON.stringify(tasks, null, 2),
                mimeType: "application/json"
            }]
        };
    }
);

// Resource: List shopping items
server.resource(
    "shopping",
    "elton://{projectId}/shopping",
    async (uri, { projectId }) => {
        const snapshot = await db.collection("projects").doc(projectId).collection("shoppingList").get();
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return {
            contents: [{
                uri: uri.href,
                text: JSON.stringify(items, null, 2),
                mimeType: "application/json"
            }]
        };
    }
);

// Resource: Get Vehicle Data
server.resource(
    "vehicle",
    "elton://{projectId}/vehicle",
    async (uri, { projectId }) => {
        const docSnap = await db.collection("projects").doc(projectId).get();
        const project = docSnap.data();
        return {
            contents: [{
                uri: uri.href,
                text: JSON.stringify(project?.vehicleData || {}, null, 2),
                mimeType: "application/json"
            }]
        };
    }
);

// --- TOOLS ---

// Tool: Add Task
server.tool(
    "add_task",
    "Add a new task to the project plan",
    {
        projectId: z.string(),
        title: z.string(),
        description: z.string(),
        phase: z.string(),
        status: z.enum(["todo", "in-progress", "done"]).default("todo"),
        priority: z.enum(["Hög", "Medel", "Låg"]).optional(),
        estimatedCostMax: z.number().optional()
    },
    async (args) => {
        const { projectId, ...taskData } = args;
        const ref = await db.collection("projects").doc(projectId).collection("tasks").add({
            ...taskData,
            created: new Date().toISOString()
        });
        return {
            content: [{ type: "text", text: `Task created with ID: ${ref.id}` }]
        };
    }
);

// Tool: Add Shopping Item
server.tool(
    "add_shopping_item",
    "Add an item to the shopping list",
    {
        projectId: z.string(),
        name: z.string(),
        category: z.string(),
        estimatedCost: z.number().optional(),
        quantity: z.string().optional()
    },
    async (args) => {
        const { projectId, ...itemData } = args;
        const ref = await db.collection("projects").doc(projectId).collection("shoppingList").add({
            ...itemData,
            checked: false,
            created: new Date().toISOString()
        });
        return {
            content: [{ type: "text", text: `Shopping item created with ID: ${ref.id}` }]
        };
    }
);

// Tool: Add Vehicle History Event
server.tool(
    "add_vehicle_event",
    "Log a vehicle history event (service, repair, etc)",
    {
        projectId: z.string(),
        type: z.enum(["Service", "Reparation", "Besiktning", "Övrigt"]),
        title: z.string(),
        description: z.string(),
        date: z.string(),
        mileage: z.number().optional(),
        cost: z.number().optional()
    },
    async (args) => {
        const { projectId, ...eventData } = args;
        const event = {
            id: `evt-${Date.now()}`,
            ...eventData
        };

        await db.collection("projects").doc(projectId).update({
            "vehicleData.historyEvents": admin.firestore.FieldValue.arrayUnion(event),
            lastModified: new Date().toISOString()
        });

        return {
            content: [{ type: "text", text: `Vehicle event added: ${args.title}` }]
        };
    }
);
