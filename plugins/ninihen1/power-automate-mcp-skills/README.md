# FlowStudio MCP — Power Automate Skills for AI Agents

Give your AI agent the same visibility you have in the Power Automate portal — plus a bit more.
The Graph API only returns top-level run status — agents can't see action inputs,
loop iterations, or nested failures. Flow Studio MCP exposes all of it.

![Agent debugging a Power Automate flow via MCP](assets/demo-debug.gif)

**You can click through the portal and find the root cause. Your agent can't — unless it has MCP.**

![The portal shows everything to a human — but agents only see the top-level error via Graph API](assets/portal-vs-reality.png)

![With Flow Studio MCP, the agent sees what you see](assets/mcp-root-cause.png)

## When you need this

- Your agent can see that a flow failed, but not why — Graph API only returns status codes
- You want your agent to see action-level inputs and outputs, like you can in the portal
- A loop has hundreds of iterations and some produced bad output — in the portal you'd click through each one, but the agent can scan all iteration inputs and outputs at once
- You're tired of being the middle-man between your agent and the portal

## Graph API vs Flow Studio MCP

The core difference: **Graph API gives your agent run status. MCP gives your agent the inputs and outputs of every action.**

| What the agent sees | Graph API | Flow Studio MCP |
|---|---|---|
| Run passed or failed | Yes | Yes |
| **Action inputs and outputs** | **No** | **Yes** |
| Error details beyond status code | No | Yes |
| Child flow run details | No | Yes |
| Loop iteration data | No | Yes |
| Flow definition (read + write) | Limited | Full JSON |
| Resubmit / cancel runs | Limited | Yes |

## Skills

| Skill | Description |
|---|---|
| [`power-automate-mcp`](skills/power-automate-mcp/) | Connect to and operate Power Automate cloud flows — list flows, read definitions, check runs, resubmit, cancel |
| [`power-automate-debug`](skills/power-automate-debug/) | Step-by-step diagnostic process for investigating failing flows |
| [`power-automate-build`](skills/power-automate-build/) | Build, scaffold, and deploy Power Automate flow definitions from scratch |

Each skill follows the [Agent Skills specification](https://agentskills.io/specification)
and works with any compatible agent.

### Supported agents

Copilot, Claude Code, Codex, OpenClaw, Gemini CLI, Cursor, Goose, Amp, OpenHands

## Quick Start

### Install as Claude Code plugin

Available through the Claude plugin marketplace after approval. To test locally:

```bash
git clone https://github.com/ninihen1/power-automate-mcp-skills.git
claude --plugin-dir ./power-automate-mcp-skills
```

Then connect the MCP server:
```bash
claude mcp add --transport http flowstudio https://mcp.flowstudio.app/mcp \
  --header "x-api-key: <YOUR_TOKEN>"
```

Get your token at [mcp.flowstudio.app](https://mcp.flowstudio.app).

### Install in Codex

Inside a Codex session, install skills directly:
```
$skill-installer install https://github.com/ninihen1/power-automate-mcp-skills/tree/master/skills/power-automate-mcp
$skill-installer install https://github.com/ninihen1/power-automate-mcp-skills/tree/master/skills/power-automate-debug
$skill-installer install https://github.com/ninihen1/power-automate-mcp-skills/tree/master/skills/power-automate-build
```

Then connect the MCP server in `~/.codex/config.toml`:
```toml
[mcp_servers.flowstudio]
url = "https://mcp.flowstudio.app/mcp"

[mcp_servers.flowstudio.http_headers]
x-api-key = "<YOUR_TOKEN>"
```

### Install via skills.sh

Search for [flowstudio on skills.sh](https://skills.sh/?q=flowstudio), or:

```bash
npx skills add github/awesome-copilot -s flowstudio-power-automate-mcp
npx skills add github/awesome-copilot -s flowstudio-power-automate-debug
npx skills add github/awesome-copilot -s flowstudio-power-automate-build
```

### Install via ClawHub

```bash
npx clawhub@latest install power-automate-mcp
```

### Install via Smithery

```bash
npx smithery skill add flowstudio/power-automate-mcp
```

### Manual install

Copy the skill folder(s) into your project's `.github/skills/` directory
(or wherever your agent discovers skills).

### Connect the MCP server

**Claude Code:**
```bash
claude mcp add --transport http flowstudio https://mcp.flowstudio.app/mcp \
  --header "x-api-key: <YOUR_TOKEN>"
```

**Codex** (`~/.codex/config.toml`):
```toml
[mcp_servers.flowstudio]
url = "https://mcp.flowstudio.app/mcp"

[mcp_servers.flowstudio.http_headers]
x-api-key = "<YOUR_TOKEN>"
```

**Copilot / VS Code** (`.vscode/mcp.json`):
```json
{
  "servers": {
    "flowstudio": {
      "type": "http",
      "url": "https://mcp.flowstudio.app/mcp",
      "headers": { "x-api-key": "<YOUR_TOKEN>" }
    }
  }
}
```

Get your token at [mcp.flowstudio.app](https://mcp.flowstudio.app).

## Real debugging examples

These are from real production investigations, not demos.

- **[Expression error in child flow](examples/fix-expression-error.md)** —
  `contains(string(...))` crashed on a nested property. Agent traced through
  parent flow, into child, through loop iterations, and found the failing input.
  Portal showed "ExpressionEvaluationFailed" with no context.

- **[Data entry, not a flow bug](examples/data-not-flow.md)** —
  User reported two "bugs" back to back. Agent proved both were data entry
  errors (missing comma in email, single address in CC field). Flow was correct.
  Diagnosed in seconds.

- **[Null value crashes child flow](examples/null-child-flow.md)** —
  `split(Name, ', ')` crashed when 38% of records had null Names. Agent traced
  parent to child to loop to action, found the root cause, and deployed a fix
  via `update_live_flow`.

## Prerequisites

- A [FlowStudio](https://mcp.flowstudio.app) MCP subscription
- MCP endpoint: `https://mcp.flowstudio.app/mcp`
- API key / JWT token (passed as `x-api-key` header)

## Repository structure

```
skills/
  power-automate-mcp/       core connection & operation skill
  power-automate-debug/     debug workflow skill
  power-automate-build/     build & deploy skill
examples/                   real debugging walkthroughs
README.md
LICENSE                     MIT
```

## Available on GitHub

Works with Copilot, Claude, and any MCP-compatible agent.

- [awesome-copilot](https://github.com/github/awesome-copilot) (merged)
- [skills.sh](https://skills.sh/?q=flowstudio) (3K+ installs)
- [Smithery](https://smithery.ai/skills/flowstudio/power-automate-mcp) (published)
- [ClawHub](https://clawhub.ai) (v1.1.0)

## Contributing

Contributions welcome. Each skill folder must contain a `SKILL.md` with the
required frontmatter. See the existing skills for the format.

## License

[MIT](LICENSE)

---

Keywords: Power Automate debugging, flow run history, expression evaluation failed,
child flow failure, nested action errors, loop iteration output, agent automation MCP,
Power Platform AI, flow definition deploy, resubmit failed run
