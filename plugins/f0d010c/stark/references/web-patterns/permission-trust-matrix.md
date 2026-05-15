# Pattern - Permission / trust matrix

Use for plugin managers, MCP servers, security products, local-first tools, API integrations, deploy settings, admin permissions, and billing/account access.

## Structure

- Rows are capabilities, resources, integrations, or scopes.
- Columns show access level, source, reason, status, last used, and action.
- Risk is concrete: read, write, network, shell, secrets, billing, deploy, admin.
- Warnings include why it matters and what the user can do.
- Include audit trail or timestamp for trust-sensitive rows.

## Interaction

- Filter by risk, source, status, and recently used.
- Expand a row for exact paths, scopes, scripts, or environment variables.
- Dangerous changes require confirmation and recovery copy.
- "Revoke", "Review", "Allow once", and "Open settings" should be distinct actions.

## Responsive

- Desktop: dense table or matrix.
- Mobile: grouped cards with capability and action first.

## Avoid

- Vague "secure" badges.
- Hiding the specific resource behind generic labels.
- Alarm colors with no action.
- Showing secrets directly.
