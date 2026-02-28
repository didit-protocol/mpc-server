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
import * as users from "./tools/users";
import * as questionnaires from "./tools/questionnaires";
import * as blocklist from "./tools/blocklist";
import * as standalone from "./tools/standalone";

const server = new Server(
  { name: "didit", version: "3.0.0" },
  { capabilities: { tools: {} } }
);

// ---------------------------------------------------------------------------
// Tool definitions
// ---------------------------------------------------------------------------
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    // ── Auth ────────────────────────────────────────────────────────────
    {
      name: "didit_register",
      description: "Register a new Didit account. A 6-character verification code is sent to the email. Follow up with didit_verify_email.",
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
      description: "Verify email with the 6-character code. Returns access_token, refresh_token, organization, application (with client_id and api_key).",
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
      description: "Login to existing Didit account. Returns access_token and refresh_token.",
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
      name: "didit_list_organizations",
      description: "List all organizations the authenticated user belongs to. Requires access_token from login or verify_email.",
      inputSchema: {
        type: "object" as const,
        properties: {
          access_token: { type: "string", description: "Bearer access token from login/verify_email" },
        },
        required: ["access_token"],
      },
    },
    {
      name: "didit_get_application",
      description: "Get application details including client_id and api_key. Requires access_token.",
      inputSchema: {
        type: "object" as const,
        properties: {
          access_token: { type: "string", description: "Bearer access token" },
          organization_id: { type: "string" },
          application_id: { type: "string" },
        },
        required: ["access_token", "organization_id", "application_id"],
      },
    },

    // ── Sessions ────────────────────────────────────────────────────────
    {
      name: "didit_create_session",
      description: "Create a new identity verification session. Returns session_id, session_url, and session_token.",
      inputSchema: {
        type: "object" as const,
        properties: {
          callback_url: { type: "string", description: "URL to redirect user after verification" },
          vendor_data: { type: "string", description: "Your unique identifier for the user (e.g. user ID)" },
          features: { type: "string", description: "Comma-separated features: ocr,face,liveness,aml,phone,email,poa,questionnaire" },
        },
      },
    },
    {
      name: "didit_list_sessions",
      description: "List verification sessions with optional filters and pagination.",
      inputSchema: {
        type: "object" as const,
        properties: {
          status: { type: "string", description: "Filter by status: Approved, Declined, In Review, Pending" },
          vendor_data: { type: "string", description: "Filter by vendor_data" },
          limit: { type: "string", description: "Number of results per page" },
          offset: { type: "string", description: "Pagination offset" },
        },
      },
    },
    {
      name: "didit_get_session_decision",
      description: "Get the full verification decision and all extracted data for a session.",
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
      description: "Approve, decline, or request resubmission of a session. Resubmitted sessions keep already-approved steps.",
      inputSchema: {
        type: "object" as const,
        properties: {
          session_id: { type: "string" },
          status: { type: "string", description: "New status: Approved, Declined, Resubmission Requested" },
        },
        required: ["session_id", "status"],
      },
    },
    {
      name: "didit_delete_session",
      description: "Permanently delete a single verification session and all associated data.",
      inputSchema: {
        type: "object" as const,
        properties: {
          session_id: { type: "string" },
        },
        required: ["session_id"],
      },
    },
    {
      name: "didit_batch_delete_sessions",
      description: "Delete multiple sessions by session numbers, or delete all sessions.",
      inputSchema: {
        type: "object" as const,
        properties: {
          session_numbers: {
            type: "array",
            items: { type: "number" },
            description: "Array of session numbers to delete",
          },
          delete_all: { type: "boolean", description: "Set true to delete ALL sessions (ignores session_numbers)" },
        },
      },
    },
    {
      name: "didit_generate_session_pdf",
      description: "Generate a PDF verification report for a session.",
      inputSchema: {
        type: "object" as const,
        properties: {
          session_id: { type: "string" },
        },
        required: ["session_id"],
      },
    },
    {
      name: "didit_list_session_reviews",
      description: "List the review history and activity log for a session.",
      inputSchema: {
        type: "object" as const,
        properties: {
          session_id: { type: "string" },
        },
        required: ["session_id"],
      },
    },
    {
      name: "didit_add_session_review",
      description: "Add a review note or status change to a session.",
      inputSchema: {
        type: "object" as const,
        properties: {
          session_id: { type: "string" },
          comment: { type: "string", description: "Review comment or note" },
          status: { type: "string", description: "Optional new status" },
        },
        required: ["session_id"],
      },
    },
    {
      name: "didit_share_session",
      description: "Share a verified session with a trusted partner for reusable KYC (B2B session sharing).",
      inputSchema: {
        type: "object" as const,
        properties: {
          session_id: { type: "string" },
          partner_client_id: { type: "string", description: "The partner application's client_id" },
        },
        required: ["session_id", "partner_client_id"],
      },
    },
    {
      name: "didit_import_shared_session",
      description: "Import a shared verification session from a partner (Reusable KYC).",
      inputSchema: {
        type: "object" as const,
        properties: {
          share_token: { type: "string", description: "Token received from the sharing partner" },
        },
        required: ["share_token"],
      },
    },

    // ── Workflows (Verification Settings) ───────────────────────────────
    {
      name: "didit_list_workflows",
      description: "List all verification workflows for your application. Each workflow defines verification steps, thresholds, and accepted documents.",
      inputSchema: { type: "object" as const, properties: {} },
    },
    {
      name: "didit_create_workflow",
      description: "Create a new verification workflow. Enable features like OCR (ID scan), face match, liveness detection, AML screening, phone, email, proof of address, and questionnaire.",
      inputSchema: {
        type: "object" as const,
        properties: {
          workflow_label: { type: "string", description: "Name for the workflow" },
          is_default: { type: "boolean", description: "Set as default workflow for new sessions" },
          is_ocr_enabled: { type: "boolean", description: "Enable ID document scanning" },
          is_face_match_enabled: { type: "boolean", description: "Enable face match against ID photo" },
          is_liveness_enabled: { type: "boolean", description: "Enable anti-spoofing liveness detection" },
          is_aml_enabled: { type: "boolean", description: "Enable AML/sanctions screening" },
          is_phone_verification_enabled: { type: "boolean", description: "Enable phone number verification" },
          is_email_verification_enabled: { type: "boolean", description: "Enable email verification" },
          is_poa_enabled: { type: "boolean", description: "Enable proof of address" },
          is_questionnaire_enabled: { type: "boolean", description: "Enable custom questionnaire" },
        },
        required: ["workflow_label"],
      },
    },
    {
      name: "didit_get_workflow",
      description: "Get the full configuration of a specific workflow.",
      inputSchema: {
        type: "object" as const,
        properties: {
          workflow_id: { type: "string", description: "Workflow UUID" },
        },
        required: ["workflow_id"],
      },
    },
    {
      name: "didit_update_workflow",
      description: "Update a workflow's configuration (feature toggles, thresholds, accepted documents, etc.).",
      inputSchema: {
        type: "object" as const,
        properties: {
          workflow_id: { type: "string", description: "Workflow UUID" },
          workflow_label: { type: "string" },
          is_default: { type: "boolean" },
          is_ocr_enabled: { type: "boolean" },
          is_face_match_enabled: { type: "boolean" },
          is_liveness_enabled: { type: "boolean" },
          is_aml_enabled: { type: "boolean" },
          is_phone_verification_enabled: { type: "boolean" },
          is_email_verification_enabled: { type: "boolean" },
          is_poa_enabled: { type: "boolean" },
          is_questionnaire_enabled: { type: "boolean" },
        },
        required: ["workflow_id"],
      },
    },
    {
      name: "didit_delete_workflow",
      description: "Delete a verification workflow. Existing sessions using it are not affected.",
      inputSchema: {
        type: "object" as const,
        properties: {
          workflow_id: { type: "string", description: "Workflow UUID" },
        },
        required: ["workflow_id"],
      },
    },

    // ── Questionnaires ──────────────────────────────────────────────────
    {
      name: "didit_list_questionnaires",
      description: "List all custom questionnaires for your application.",
      inputSchema: { type: "object" as const, properties: {} },
    },
    {
      name: "didit_create_questionnaire",
      description: "Create a custom questionnaire with questions, branching logic, and multi-language support.",
      inputSchema: {
        type: "object" as const,
        properties: {
          title: { type: "string", description: "Questionnaire title" },
          description: { type: "string", description: "Description shown to the user" },
          questions: {
            type: "array",
            description: "Array of question objects with type, text, options, and optional branching",
          },
        },
        required: ["title", "questions"],
      },
    },
    {
      name: "didit_get_questionnaire",
      description: "Get full details of a specific questionnaire (questions, options, translations).",
      inputSchema: {
        type: "object" as const,
        properties: {
          questionnaire_id: { type: "string", description: "Questionnaire UUID" },
        },
        required: ["questionnaire_id"],
      },
    },
    {
      name: "didit_update_questionnaire",
      description: "Update a questionnaire's title, description, questions, or translations.",
      inputSchema: {
        type: "object" as const,
        properties: {
          questionnaire_id: { type: "string", description: "Questionnaire UUID" },
          title: { type: "string" },
          description: { type: "string" },
          questions: { type: "array" },
        },
        required: ["questionnaire_id"],
      },
    },
    {
      name: "didit_delete_questionnaire",
      description: "Delete a questionnaire.",
      inputSchema: {
        type: "object" as const,
        properties: {
          questionnaire_id: { type: "string", description: "Questionnaire UUID" },
        },
        required: ["questionnaire_id"],
      },
    },

    // ── Users ───────────────────────────────────────────────────────────
    {
      name: "didit_list_users",
      description: "List all verified users. Supports pagination and status filtering.",
      inputSchema: {
        type: "object" as const,
        properties: {
          status: { type: "string", description: "Filter: Approved, Declined, In Review, Pending" },
          limit: { type: "string" },
          offset: { type: "string" },
        },
      },
    },
    {
      name: "didit_get_user",
      description: "Get details of a specific user by their vendor_data identifier.",
      inputSchema: {
        type: "object" as const,
        properties: {
          vendor_data: { type: "string", description: "The vendor_data value that identifies the user" },
        },
        required: ["vendor_data"],
      },
    },
    {
      name: "didit_update_user",
      description: "Update user metadata or tags.",
      inputSchema: {
        type: "object" as const,
        properties: {
          vendor_data: { type: "string", description: "The vendor_data value that identifies the user" },
          tags: { type: "array", items: { type: "string" }, description: "Tags to assign" },
        },
        required: ["vendor_data"],
      },
    },
    {
      name: "didit_delete_users",
      description: "Batch delete users by vendor_data list, or delete all users.",
      inputSchema: {
        type: "object" as const,
        properties: {
          vendor_data_list: {
            type: "array",
            items: { type: "string" },
            description: "Array of vendor_data values to delete",
          },
          delete_all: { type: "boolean", description: "Set true to delete ALL users" },
        },
      },
    },

    // ── Billing ─────────────────────────────────────────────────────────
    {
      name: "didit_get_balance",
      description: "Get current credit balance and auto-refill settings.",
      inputSchema: { type: "object" as const, properties: {} },
    },
    {
      name: "didit_top_up",
      description: "Create a Stripe checkout session to top up credits. Returns a checkout URL.",
      inputSchema: {
        type: "object" as const,
        properties: {
          amount_in_dollars: { type: "number", description: "Amount in USD (minimum $50)" },
        },
        required: ["amount_in_dollars"],
      },
    },

    // ── Blocklist ───────────────────────────────────────────────────────
    {
      name: "didit_list_blocklist",
      description: "List blocklist entries. Filter by item_type: face, document, phone, email.",
      inputSchema: {
        type: "object" as const,
        properties: {
          item_type: { type: "string", description: "Filter: face, document, phone, email" },
          limit: { type: "string" },
          offset: { type: "string" },
        },
      },
    },
    {
      name: "didit_add_to_blocklist",
      description: "Add faces, documents, phones, and/or emails to the blocklist by session ID.",
      inputSchema: {
        type: "object" as const,
        properties: {
          session_id: { type: "string", description: "Session UUID to blocklist items from" },
          face: { type: "boolean", description: "Block the face from this session" },
          document: { type: "boolean", description: "Block the document from this session" },
          phone: { type: "boolean", description: "Block the phone from this session" },
          email: { type: "boolean", description: "Block the email from this session" },
        },
        required: ["session_id"],
      },
    },
    {
      name: "didit_remove_from_blocklist",
      description: "Remove faces, documents, phones, and/or emails from the blocklist by session ID.",
      inputSchema: {
        type: "object" as const,
        properties: {
          session_id: { type: "string", description: "Session UUID to unblock items from" },
          face: { type: "boolean" },
          document: { type: "boolean" },
          phone: { type: "boolean" },
          email: { type: "boolean" },
        },
        required: ["session_id"],
      },
    },

    // ── Standalone: Identity & Documents ────────────────────────────────
    {
      name: "didit_id_verification",
      description: "Verify an identity document by submitting front (and optionally back) images. Returns structured OCR data and authenticity checks.",
      inputSchema: {
        type: "object" as const,
        properties: {
          front_image_path: { type: "string", description: "Absolute path to front image file" },
          back_image_path: { type: "string", description: "Absolute path to back image file (optional)" },
        },
        required: ["front_image_path"],
      },
    },
    {
      name: "didit_poa_verification",
      description: "Proof of Address verification. Submit document images to extract and validate address information.",
      inputSchema: {
        type: "object" as const,
        properties: {
          front_image_path: { type: "string", description: "Absolute path to front image file" },
          back_image_path: { type: "string", description: "Absolute path to back image file (optional)" },
        },
        required: ["front_image_path"],
      },
    },
    {
      name: "didit_database_validation",
      description: "Validate identity data against national and global authoritative data sources.",
      inputSchema: {
        type: "object" as const,
        properties: {
          first_name: { type: "string" },
          last_name: { type: "string" },
          date_of_birth: { type: "string", description: "YYYY-MM-DD format" },
          document_number: { type: "string" },
          country: { type: "string", description: "ISO 3166-1 alpha-2 country code" },
        },
        required: ["first_name", "last_name", "date_of_birth", "country"],
      },
    },

    // ── Standalone: Biometrics & Face ───────────────────────────────────
    {
      name: "didit_passive_liveness",
      description: "Passive liveness detection -- verify a person is physically present from a single image (no interaction required).",
      inputSchema: {
        type: "object" as const,
        properties: {
          image_path: { type: "string", description: "Absolute path to facial image file" },
        },
        required: ["image_path"],
      },
    },
    {
      name: "didit_face_match",
      description: "Compare two facial images to determine if they belong to the same person (1:1 face matching).",
      inputSchema: {
        type: "object" as const,
        properties: {
          image_1_path: { type: "string", description: "Absolute path to first facial image" },
          image_2_path: { type: "string", description: "Absolute path to second facial image" },
        },
        required: ["image_1_path", "image_2_path"],
      },
    },
    {
      name: "didit_face_search",
      description: "Search for a face against a database of previously verified faces (1:N face matching).",
      inputSchema: {
        type: "object" as const,
        properties: {
          image_path: { type: "string", description: "Absolute path to facial image file" },
        },
        required: ["image_path"],
      },
    },
    {
      name: "didit_age_estimation",
      description: "Estimate a person's age from a facial image. Also performs passive liveness check.",
      inputSchema: {
        type: "object" as const,
        properties: {
          image_path: { type: "string", description: "Absolute path to facial image file" },
        },
        required: ["image_path"],
      },
    },

    // ── Standalone: AML Screening ───────────────────────────────────────
    {
      name: "didit_aml_screening",
      description: "AML screening against global watchlists, PEP lists, and sanctions databases. Supports person and company entity types.",
      inputSchema: {
        type: "object" as const,
        properties: {
          full_name: { type: "string", description: "Full name to screen" },
          date_of_birth: { type: "string", description: "YYYY-MM-DD (optional, improves accuracy)" },
          entity_type: { type: "string", description: "person or company (default: person)" },
          countries: { type: "array", items: { type: "string" }, description: "ISO country codes to filter (optional)" },
        },
        required: ["full_name"],
      },
    },

    // ── Standalone: Email & Phone Verification ──────────────────────────
    {
      name: "didit_email_send",
      description: "Send a one-time verification code to an email address. Code valid for 5 minutes.",
      inputSchema: {
        type: "object" as const,
        properties: {
          email: { type: "string", description: "Email address to verify" },
        },
        required: ["email"],
      },
    },
    {
      name: "didit_email_check",
      description: "Verify the OTP code sent to an email. Max 3 attempts per code.",
      inputSchema: {
        type: "object" as const,
        properties: {
          email: { type: "string" },
          code: { type: "string", description: "Verification code from email" },
        },
        required: ["email", "code"],
      },
    },
    {
      name: "didit_phone_send",
      description: "Send a one-time verification code to a phone number via SMS. Code valid for 5 minutes.",
      inputSchema: {
        type: "object" as const,
        properties: {
          phone_number: { type: "string", description: "Phone number with country code (e.g. +1234567890)" },
        },
        required: ["phone_number"],
      },
    },
    {
      name: "didit_phone_check",
      description: "Verify the OTP code sent to a phone number. Max 3 attempts per code.",
      inputSchema: {
        type: "object" as const,
        properties: {
          phone_number: { type: "string" },
          code: { type: "string", description: "Verification code from SMS" },
        },
        required: ["phone_number", "code"],
      },
    },
  ],
}));

// ---------------------------------------------------------------------------
// Tool dispatch
// ---------------------------------------------------------------------------
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result: any;

    switch (name) {
      // Auth
      case "didit_register":
        result = await auth.register(args!.email as string, args!.password as string);
        break;
      case "didit_verify_email":
        result = await auth.verifyEmail(args!.email as string, args!.code as string);
        break;
      case "didit_login":
        result = await auth.login(args!.email as string, args!.password as string);
        break;
      case "didit_list_organizations":
        result = await auth.listOrganizations(args!.access_token as string);
        break;
      case "didit_get_application":
        result = await auth.getApplication(args!.access_token as string, args!.organization_id as string, args!.application_id as string);
        break;

      // Sessions
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
      case "didit_delete_session":
        result = await sessions.deleteSession(args!.session_id as string);
        break;
      case "didit_batch_delete_sessions":
        result = await sessions.batchDeleteSessions(args?.session_numbers as number[], args?.delete_all as boolean);
        break;
      case "didit_generate_session_pdf":
        result = await sessions.generateSessionPdf(args!.session_id as string);
        break;
      case "didit_list_session_reviews":
        result = await sessions.listSessionReviews(args!.session_id as string);
        break;
      case "didit_add_session_review":
        result = await sessions.addSessionReview(args!.session_id as string, args as Record<string, any>);
        break;
      case "didit_share_session":
        result = await sessions.shareSession(args!.session_id as string, args as Record<string, any>);
        break;
      case "didit_import_shared_session":
        result = await sessions.importSharedSession(args as Record<string, any>);
        break;

      // Workflows
      case "didit_list_workflows":
        result = await settings.listWorkflows();
        break;
      case "didit_create_workflow":
        result = await settings.createWorkflow(args || {});
        break;
      case "didit_get_workflow":
        result = await settings.getWorkflow(args!.workflow_id as string);
        break;
      case "didit_update_workflow": {
        const { workflow_id, ...data } = args as Record<string, any>;
        result = await settings.updateWorkflow(workflow_id, data);
        break;
      }
      case "didit_delete_workflow":
        result = await settings.deleteWorkflow(args!.workflow_id as string);
        break;

      // Questionnaires
      case "didit_list_questionnaires":
        result = await questionnaires.listQuestionnaires();
        break;
      case "didit_create_questionnaire":
        result = await questionnaires.createQuestionnaire(args as Record<string, any>);
        break;
      case "didit_get_questionnaire":
        result = await questionnaires.getQuestionnaire(args!.questionnaire_id as string);
        break;
      case "didit_update_questionnaire": {
        const { questionnaire_id, ...data } = args as Record<string, any>;
        result = await questionnaires.updateQuestionnaire(questionnaire_id, data);
        break;
      }
      case "didit_delete_questionnaire":
        result = await questionnaires.deleteQuestionnaire(args!.questionnaire_id as string);
        break;

      // Users
      case "didit_list_users":
        result = await users.listUsers(args as Record<string, string>);
        break;
      case "didit_get_user":
        result = await users.getUser(args!.vendor_data as string);
        break;
      case "didit_update_user": {
        const { vendor_data, ...data } = args as Record<string, any>;
        result = await users.updateUser(vendor_data, data);
        break;
      }
      case "didit_delete_users":
        result = await users.deleteUsers(args?.vendor_data_list as string[], args?.delete_all as boolean);
        break;

      // Billing
      case "didit_get_balance":
        result = await billing.getBalance();
        break;
      case "didit_top_up":
        result = await billing.topUp(args!.amount_in_dollars as number);
        break;

      // Blocklist
      case "didit_list_blocklist":
        result = await blocklist.listBlocklist(args as Record<string, string>);
        break;
      case "didit_add_to_blocklist":
        result = await blocklist.addToBlocklist(args as Record<string, any>);
        break;
      case "didit_remove_from_blocklist":
        result = await blocklist.removeFromBlocklist(args as Record<string, any>);
        break;

      // Standalone: Identity & Documents
      case "didit_id_verification":
        result = await standalone.idVerification(args!.front_image_path as string, args?.back_image_path as string);
        break;
      case "didit_poa_verification":
        result = await standalone.poaVerification(args!.front_image_path as string, args?.back_image_path as string);
        break;
      case "didit_database_validation":
        result = await standalone.databaseValidation(args as Record<string, any>);
        break;

      // Standalone: Biometrics
      case "didit_passive_liveness":
        result = await standalone.passiveLiveness(args!.image_path as string);
        break;
      case "didit_face_match":
        result = await standalone.faceMatch(args!.image_1_path as string, args!.image_2_path as string);
        break;
      case "didit_face_search":
        result = await standalone.faceSearch(args!.image_path as string);
        break;
      case "didit_age_estimation":
        result = await standalone.ageEstimation(args!.image_path as string);
        break;

      // Standalone: AML
      case "didit_aml_screening":
        result = await standalone.amlScreening(args as Record<string, any>);
        break;

      // Standalone: Email & Phone
      case "didit_email_send":
        result = await standalone.emailSend(args as Record<string, any>);
        break;
      case "didit_email_check":
        result = await standalone.emailCheck(args as Record<string, any>);
        break;
      case "didit_phone_send":
        result = await standalone.phoneSend(args as Record<string, any>);
        break;
      case "didit_phone_check":
        result = await standalone.phoneCheck(args as Record<string, any>);
        break;

      default:
        return { content: [{ type: "text", text: `Unknown tool: ${name}` }], isError: true };
    }

    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  } catch (error: any) {
    const message = error?.message || String(error);
    return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Didit MCP Server v3.0.0 running on stdio");
}

main().catch(console.error);
