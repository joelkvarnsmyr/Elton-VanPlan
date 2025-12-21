import * as functions from "firebase-functions";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { server } from "./server";

// Define the Cloud Function
export const eltonMcp = functions.https.onRequest(async (req, res) => {
    // 1. Security Check (Simple API Key)
    const apiKey = req.headers['x-elton-key'];
    const configuredKey = process.env.ELTON_MCP_KEY || functions.config().elton?.mcp_key;

    if (!configuredKey) {
        console.error("ELTON_MCP_KEY not configured!");
        res.status(500).send("Server configuration error");
        return;
    }

    if (apiKey !== configuredKey) {
        res.status(401).send("Unauthorized: Invalid API Key");
        return;
    }

    // 2. Transport Handling (SSE)
    const transport = new SSEServerTransport("/eltonMcp/messages", res);

    if (req.path === '/messages') {
        await transport.handlePostMessage(req, res);
        return;
    }

    // Start the SSE connection
    await server.connect(transport);
});
