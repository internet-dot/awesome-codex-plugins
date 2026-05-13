# Direction — Industrial Monospace

Söhne Mono / JetBrains Mono everywhere. Terminal references. Log-driven hero. Technical aesthetic, no decoration. Dev-tool benchmark.

## Reference apps

- railway.com — serious editorial polish on technical content
- fly.io — terminal-driven brand
- raycast.com — dark craft, micro-interactions
- resend.com — type-driven dev tool benchmark, mostly mono
- supabase.com (older versions)
- modal.com — clean technical
- vercel.com /docs — restrained tech
- temporal.io — technical content, mono accents
- ngrok.com — terminal-meets-marketing

## Typography

| Slot | Face | Size scale |
|---|---|---|
| Display | Söhne Mono / JetBrains Mono — yes mono for display | `clamp(40px, 6.5vw, 96px)` |
| Headline | Same | `clamp(28px, 4.5vw, 64px)` |
| Body | Söhne / Inter Tight (small mono accents) | 15-16px / 1.5 |
| Mono | Söhne Mono / JetBrains Mono / IBM Plex Mono | 13px |
| Code | Same mono | 13-14px in code blocks |

Mono everywhere, body grotesque for readability.

## Palette

- Background: dark warm `#0A0907` or paper `#F5F3EE` (industrial allows both)
- Foreground: stone-100 `#F5F4EE` or ink `#0A0908`
- Accent: green terminal `#00FF66` / `#10B981` or amber `#F59E0B` (terminal-vintage)
- Rule lines: thin, monospaced character widths
- No gradients (industrial = solid)

## Layout grid

- Code-block-driven sections
- Numbered like log entries (`> 01 — initialize`)
- Box-shadow-as-line for boundary (`1px solid currentColor`)
- Terminal-style header / footer with timestamp + status
- Inline code embedded in body

## Motion language

- Typewriter intro (letter-by-letter on hero — dev-tool signature)
- Cursor blink at end of typed text
- Number tickers (port count, latency, version increment)
- Log-stream marquee (lines scroll up like console)
- Terminal-style page transitions (clear-screen + retype)
- Micro: hover-flip glyph (e.g. `→` becomes `↗`)

Avoid: spring physics (mechanical only), smooth-scroll Lenis (raw native), glow effects (industrial is dry).

## Copy voice

- Technical, declarative
- Code-aware: shell prompts (`$`, `>`, `~`)
- Numbered list of features as `01 02 03` mono
- Specs in `key=value` syntax
- No marketing softeners
- Avoid: emoji, conversational tone

## Sample structure

```
1. Terminal-style nav (wordmark in mono + numbered nav items)
2. Hero (typewriter headline + terminal cursor + spec block beneath)
3. Why section (numbered 01 02 03, mono)
4. Features as code blocks (shell snippets, output examples)
5. Pricing as table (mono, ASCII art borders OK)
6. Docs preview (live code editor)
7. Footer (timestamp + version + minimal links)
```

## Direction-specific bans

- Serif body text (mono and grotesque only)
- Soft drop shadows
- Glow effects
- Spring physics on motion
- Decorative imagery (terminal aesthetic — no flourishes)
- Pastel colors
- Centered hero block (left-align like a code block)

## Sample tokens

```css
@theme {
  --color-bg:     #0A0907;
  --color-bg-2:   #14130F;
  --color-fg:     #F5F4EE;
  --color-fg-2:   #A8A39A;
  --color-fg-3:   #6E665C;
  --color-accent: #10B981; /* terminal green */

  --font-display: "Söhne Mono", "JetBrains Mono", "IBM Plex Mono", monospace;
  --font-body:    "Söhne", "Inter Tight", system-ui, sans-serif;
  --font-mono:    "Söhne Mono", "JetBrains Mono", monospace;
}
```

## Typewriter intro

```jsx
import { useEffect, useState } from "react";

function Typewriter({ text, speed = 35 }: { text: string; speed?: number }) {
  const [out, setOut] = useState("");
  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      setOut(text.slice(0, i++));
      if (i > text.length) clearInterval(t);
    }, speed);
    return () => clearInterval(t);
  }, [text, speed]);
  return <span>{out}<span className="animate-blink">▋</span></span>;
}
```
