#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import * as auth from "./tools/auth";
import * as sessions from "./tools/sessions";
import * as settings from "./tools/settings";
import * as billing from "./tools/billing";

const server = new Server(
  { name: "didit", version: "0.1.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "didit_register",
      description: "Register a new Didit account. Returns a message to check email for verification code.",
      inputSchema: {
        type: "object" as const,
        properties: {
          email: { type: "string", description: "Email address" },
          password: { type: "string", description: "Password (min 8 chars, must include uppercase, lowercase, digit, special char)" },
        },
        required: ["email", "password"],
      },
    },
    {
      name: "didit_verify_email",
      description: "Verify email with 6-char code. Returns access_token, client_id, and api_key.",
      inputSchema: {
        type: "object" as const,
        properties: {
          email: { type: "string" },
          code: { type: "string", description: "6-character alphanumeric code from email" },
        },
        required: ["email", "code"],
      },
    },
    {
      name: "didit_login",
      description: "Login to existing Didit API account. Returns access_token.",
      inputSchema: {
        type: "object" as const,
        properties: {
          email: { type: "string" },
          password: { type: "string" },
        },
        required: ["email", "password"],
      },
    },
    {
      name: "didit_create_session",
      description: "Create a new verification session.",
      inputSchema: {
        type: "object" as const,
        properties: {
          callback_url: { type: "string", description: "URL to redirect after verification" },
          vendor_data: { type: "string", description: "Your unique identifier for the user" },
          features: { type: "string", description: "Comma-separated features: ocr,face,liveness,aml,phone,email,poa,questionnaire" },
        },
        required: [],
      },
    },
    {
      name: "didit_list_sessions",
      description: "List verification sessions with optional filters.",
      inputSchema: {
        type: "object" as const,
        properties: {
          status: { type: "string", description: "Filter by status: Approved, Declined, In Review, Pending" },
          limit: { type: "string" },
          offset: { type: "string" },
        },
      },
    },
    {
      name: "didit_get_session_decision",
      description: "Get the full decision/result for a verification session.",
      inputSchema: {
        type: "object" as const,
        properties: {
          session_id: { type: "string", description: "Session UUID" },
        },
        required: ["session_id"],
      },
    },
    {
      name: "didit_update_session_status",
      description: "Update the status of a verification session.",
      inputSchema: {
        type: "object" as const,
        properties: {
          session_id: { type: "string" },
          status: { type: "string", description: "New status: Approved, Declined" },
        },
        required: ["session_id", "status"],
      },
    },
    {
      name: "didit_list_workflows",
      description: "List all verification workflows for your application. Workflows define the verification steps (ID scan, liveness, face match, AML, etc.).",
      inputSchema: { type: "object" as const, properties: {} },
    },
    {
      name: "didit_create_workflow",
      description: "Create a new verification workflow. Enable features like OCR, face match, liveness, AML screening.",
      inputSchema: {
        type: "object" as const,
        properties: {
          workflow_label: { type: "string", description: "Name for the workflow" },
          is_default: { type: "boolean", description: "Set as default workflow for new sessions" },
          is_ocr_enabled: { type: "boolean" },
          is_face_match_enabled: { type: "boolean" },
          is_liveness_enabled: { type: "boolean" },
          is_aml_enabled: { type: "boolean" },
        },
        required: ["workflow_label"],
      },
    },
    {
      name: "didit_get_balance",
      description: "Get current credit balance and auto-refill settings.",
      inputSchema: { type: "object" as const, properties: {} },
    },
    {
      name: "didit_top_up",
      description: "Create a Stripe checkout session to top up credits.",
      inputSchema: {
        type: "object" as const,
        properties: {
          amount_in_dollars: { type: "number", description: "Amount in USD (minimum $50)" },
        },
        required: ["amount_in_dollars"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result: any;

    switch (name) {
      case "didit_register":
        result = await auth.register(args!.email as string, args!.password as string);
        break;
      case "didit_verify_email":
        result = await auth.verifyEmail(args!.email as string, args!.code as string);
        break;
      case "didit_login":
        result = await auth.login(args!.email as string, args!.password as string);
        break;
      case "didit_create_session":
        result = await sessions.createSession(args || {});
        break;
      case "didit_list_sessions":
        result = await sessions.listSessions(args as Record<string, string>);
        break;
      case "didit_get_session_decision":
        result = await sessions.getSessionDecision(args!.session_id as string);
        break;
      case "didit_update_session_status":
        result = await sessions.updateSessionStatus(args!.session_id as string, args!.status as string);
        break;
      case "didit_list_workflows":
        result = await settings.listWorkflows();
        break;
      case "didit_create_workflow":
        result = await settings.createWorkflow(args || {});
        break;
      case "didit_get_balance":
        result = await billing.getBalance();
        break;
      case "didit_top_up":
        result = await billing.topUp(args!.amount_in_dollars as number);
        break;
      default:
        return { content: [{ type: "text", text: `Unknown tool: ${name}` }], isError: true };
    }

    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  } catch (error: any) {
    return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Didit MCP Server running on stdio");
}

main().catch(console.error);
