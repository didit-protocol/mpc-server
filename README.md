# Didit MCP Server

The official [Model Context Protocol](https://modelcontextprotocol.io/) server for [Didit](https://www.didit.me) identity verification. Connect AI coding agents to the full Didit platform — register accounts, verify identities, manage workflows, screen against watchlists, and more — all through natural language.

**47 tools** covering every public Didit API.

## Quick Start

Add to your MCP client config:

**Cursor** (`.cursor/mcp.json`):
```json
{
  "mcpServers": {
    "didit": {
      "command": "npx",
      "args": ["@didit-protocol/mcp-server"],
      "env": {
        "DIDIT_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

**Claude Desktop** (`claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "didit": {
      "command": "npx",
      "args": ["@didit-protocol/mcp-server"],
      "env": {
        "DIDIT_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

Works with **Cursor, Claude Code, GitHub Copilot, Windsurf, Devin, OpenHands, Codex**, and any MCP-compatible agent.

## No API Key Yet?

The agent can register for you — no browser needed:

1. Ask the agent: *"Register me a Didit account with dev@company.com"*
2. Agent calls `didit_register` → you get a 6-character code via email
3. Tell the agent the code → it calls `didit_verify_email`
4. Response includes your `api_key` — add it to the MCP config

Two API calls, zero friction. See [Programmatic Registration](https://docs.didit.me/integration/programmatic-registration) for details.

## Available Tools

### Auth

| Tool | Description |
|------|-------------|
| `didit_register` | Register a new account (sends verification code to email) |
| `didit_verify_email` | Verify email with 6-char code → get `api_key` and credentials |
| `didit_login` | Login to existing account → get access token |
| `didit_list_organizations` | List organizations you belong to |
| `didit_get_application` | Get application details (client_id, api_key) |

### Sessions

| Tool | Description |
|------|-------------|
| `didit_create_session` | Create a verification session → returns session URL |
| `didit_list_sessions` | List sessions with status, vendor_data, and pagination filters |
| `didit_get_session_decision` | Get full verification decision and extracted data |
| `didit_update_session_status` | Approve, decline, or request resubmission |
| `didit_delete_session` | Delete a single session and all associated data |
| `didit_batch_delete_sessions` | Delete multiple sessions by number, or delete all |
| `didit_generate_session_pdf` | Generate a PDF verification report |
| `didit_list_session_reviews` | List review history and activity log |
| `didit_add_session_review` | Add a review note or status change |
| `didit_share_session` | Share a verified session with a partner (Reusable KYC) |
| `didit_import_shared_session` | Import a shared session from a partner |

### Workflows

| Tool | Description |
|------|-------------|
| `didit_list_workflows` | List all verification workflows |
| `didit_create_workflow` | Create a workflow (ID scan, liveness, face match, AML, etc.) |
| `didit_get_workflow` | Get full workflow configuration |
| `didit_update_workflow` | Update feature toggles, thresholds, accepted documents |
| `didit_delete_workflow` | Delete a workflow |

### Questionnaires

| Tool | Description |
|------|-------------|
| `didit_list_questionnaires` | List custom questionnaires |
| `didit_create_questionnaire` | Create with questions, branching logic, multi-language |
| `didit_get_questionnaire` | Get full questionnaire details |
| `didit_update_questionnaire` | Update questions, options, or translations |
| `didit_delete_questionnaire` | Delete a questionnaire |

### Users

| Tool | Description |
|------|-------------|
| `didit_list_users` | List verified users with status filtering |
| `didit_get_user` | Get user details by vendor_data identifier |
| `didit_update_user` | Update user metadata or tags |
| `didit_delete_users` | Batch delete users by vendor_data list |

### Billing

| Tool | Description |
|------|-------------|
| `didit_get_balance` | Check credit balance and auto-refill settings |
| `didit_top_up` | Create a Stripe checkout to add credits (min $50) |

### Blocklist

| Tool | Description |
|------|-------------|
| `didit_list_blocklist` | List blocked faces, documents, phones, and emails |
| `didit_add_to_blocklist` | Block items from a session (face, document, phone, email) |
| `didit_remove_from_blocklist` | Unblock items from a session |

### Standalone APIs

Run verification checks directly without creating a session.

| Tool | Description |
|------|-------------|
| `didit_id_verification` | Verify identity documents — OCR extraction + authenticity |
| `didit_poa_verification` | Proof of address — extract and validate address data |
| `didit_database_validation` | Validate identity against national/global databases |
| `didit_passive_liveness` | Detect if a person is physically present (single image) |
| `didit_face_match` | Compare two faces — 1:1 matching |
| `didit_face_search` | Search face against verified database — 1:N matching |
| `didit_age_estimation` | Estimate age from facial image |
| `didit_aml_screening` | Screen against AML, sanctions, and PEP watchlists |
| `didit_email_send` | Send email verification OTP |
| `didit_email_check` | Verify email OTP code |
| `didit_phone_send` | Send phone verification OTP via SMS |
| `didit_phone_check` | Verify phone OTP code |

## Example Conversation

> **You:** Set up identity verification for my app with ID scan and liveness
>
> **Agent:** I'll create a workflow for you.
> *calls `didit_create_workflow`* with `is_ocr_enabled: true, is_liveness_enabled: true`
>
> Done! Workflow "Standard KYC" is ready with ID document scanning and liveness detection.
> To create a verification session:
> ```bash
> curl -X POST https://verification.didit.me/v3/session/ \
>   -H "x-api-key: YOUR_API_KEY"
> ```

> **You:** Check my credit balance and list recent sessions
>
> **Agent:** *calls `didit_get_balance`* → 4,250 credits remaining
> *calls `didit_list_sessions`* → 12 sessions (8 Approved, 2 Pending, 2 Declined)

> **You:** Screen "John Smith" born 1985-03-15 against AML watchlists
>
> **Agent:** *calls `didit_aml_screening`* with `full_name: "John Smith", date_of_birth: "1985-03-15"`
> → No matches found. Clean result.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DIDIT_API_KEY` | Yes | Your Didit API key (from verify-email response or console) |
| `DIDIT_API_BASE_URL` | No | Override verification API URL (default: `https://verification.didit.me/v3`) |
| `DIDIT_AUTH_BASE_URL` | No | Override auth API URL (default: `https://apx.didit.me/auth/v2`) |

## Documentation

- [AI Agent Integration Guide](https://docs.didit.me/integration/ai-agent-integration)
- [Programmatic Registration](https://docs.didit.me/integration/programmatic-registration)
- [API Reference](https://docs.didit.me)
- [Didit Console](https://console.didit.me)

## License

MIT
