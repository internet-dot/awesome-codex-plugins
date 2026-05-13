# Security

## Scope

This plugin installs the `ejentum-mcp` npm package via `npx -y` and configures it to receive your `EJENTUM_API_KEY`. The MCP server makes outbound HTTPS requests to `https://api.ejentum.com` to retrieve cognitive scaffold content.

## Network egress

When invoked by Codex, the MCP server makes HTTPS POST requests to `https://api.ejentum.com/logicv1/<mode>` with:

- Your API key (Bearer token) in the `Authorization` header
- The query string Codex sends as the task framing
- No code, repo content, or working-directory data leaves your machine

## API key

Stored as a Codex-managed environment variable, not written to disk by the plugin. You can rotate it at any time at https://ejentum.com and the next invocation picks it up.

## Reporting issues

Report security concerns to info@ejentum.com.
