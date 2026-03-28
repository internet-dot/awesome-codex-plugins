const fs = require('fs');

const readme = fs.readFileSync('README.md', 'utf8');

// Parse official plugins
const officialMatch = readme.match(/## Official Plugins\n\n[\s\S]*?\n((?:- \S.*\n)+)/);
// Parse community plugins - split by ### subcategories
const communityMatch = readme.match(/## Community Plugins\n\n[\s\S]*?(?=\n## |\n---)/);

function parseLine(line) {
  // Match: - [Name](url) - Description (linked)
  let m = line.match(/^- \[([^\]]+)\]\(([^)]+)\)\s*[-–]\s*(.+)/);
  if (m) return { name: m[1], url: m[2], desc: m[3].trim() };
  // Match: - Name - Description (unlinked, official)
  m = line.match(/^- ([A-Z][A-Za-z0-9\s]+?)\s*[-–]\s*(.+)/);
  if (m) return { name: m[1].trim(), url: 'https://developers.openai.com/codex/plugins', desc: m[2].trim() };
  return null;
}

function parseSection(text) {
  if (!text) return [];
  const lines = text.split('\n').filter(l => l.startsWith('- '));
  return lines.map(parseLine).filter(Boolean);
}

const official = parseSection(officialMatch?.[1] || '');

// Parse community with subcategories
const community = [];
const catLines = (communityMatch?.[0] || '').split('\n');
let currentCat = 'General';
for (const line of catLines) {
  const catMatch = line.match(/^### (.+)/);
  if (catMatch) { currentCat = catMatch[1]; continue; }
  const plugin = parseLine(line);
  if (plugin) community.push({ ...plugin, cat: currentCat });
}

const total = official.length + community.length;

// Count unique categories
const cats = [...new Set(community.map(p => p.cat))];

const siteHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Codex Plugins — a curated directory</title>
  <meta name="description" content="A curated directory of OpenAI Codex plugins. Community entries verified with valid .codex-plugin manifests.">
  <meta property="og:title" content="Codex Plugins">
  <meta property="og:description" content="A curated directory of OpenAI Codex plugins.">
  <meta property="og:type" content="website">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><text y='28' font-size='28'>⬡</text></svg>">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500;700&family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            mono: ['"Roboto Mono"', 'monospace'],
            sans: ['Roboto', 'system-ui', 'sans-serif'],
          },
          colors: {
            hol: {
              purple: '#7C3AED',
              'purple-light': '#A78BFA',
              'purple-dark': '#5B21B6',
              blue: '#3B82F6',
              'blue-light': '#60A5FA',
              cyan: '#06B6D4',
            },
            surface: {
              50: '#FAFAFA',
              100: '#F4F4F5',
              200: '#E4E4E7',
              300: '#D4D4D8',
            }
          }
        }
      }
    }
  </script>
  <style>
    body { font-family: 'Roboto', system-ui, sans-serif; }
    .font-mono { font-family: 'Roboto Mono', monospace; }
    .gradient-text {
      background: linear-gradient(135deg, #7C3AED 0%, #3B82F6 50%, #06B6D4 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  </style>
</head>
<body class="bg-white text-gray-900 antialiased">

  <nav class="border-b border-gray-200">
    <div class="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
      <a href="/" class="font-mono text-sm text-gray-500 hover:text-gray-900 transition-colors">
        <span class="text-gray-900 font-medium">codex-plugins</span> <span class="text-gray-300">/</span> directory
      </a>
      <div class="flex gap-5">
        <a href="https://github.com/internet-dot/awesome-codex-plugins" target="_blank" rel="noopener" class="font-mono text-xs text-gray-400 hover:text-gray-900 transition-colors">GitHub</a>
        <a href="https://github.com/internet-dot/awesome-codex-plugins/blob/main/CONTRIBUTING.md" target="_blank" rel="noopener" class="font-mono text-xs text-gray-400 hover:text-gray-900 transition-colors">Submit</a>
      </div>
    </div>
  </nav>

  <div class="max-w-5xl mx-auto px-6">

    <header class="pt-16 pb-12 border-b border-gray-200">
      <p class="font-mono text-xs uppercase tracking-widest text-hol-purple mb-4">curated directory</p>
      <h1 class="font-mono text-4xl font-bold leading-tight text-gray-900 max-w-lg">
        Verified plugins for <span class="gradient-text">OpenAI Codex</span>
      </h1>
      <p class="mt-4 text-gray-500 max-w-lg leading-relaxed">
        Community-maintained directory of Codex plugins. Every entry verified to include a valid <code class="font-mono text-xs bg-surface-100 px-1.5 py-0.5 rounded text-gray-700">.codex-plugin</code> manifest.
      </p>
      <div class="flex gap-3 mt-6">
        <a href="https://github.com/internet-dot/awesome-codex-plugins" target="_blank" rel="noopener" class="font-mono text-xs font-medium px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900 transition-all">View on GitHub</a>
        <a href="https://github.com/internet-dot/awesome-codex-plugins/blob/main/CONTRIBUTING.md" target="_blank" rel="noopener" class="font-mono text-xs font-medium px-4 py-2 rounded-lg bg-hol-purple text-white hover:bg-hol-purple-dark transition-all">Submit a plugin</a>
      </div>
    </header>

    <div class="py-5 border-b border-gray-200">
      <input type="text" id="q" placeholder="filter plugins..." autocomplete="off"
        class="w-full max-w-xs font-mono text-sm px-3 py-2 bg-surface-50 border border-gray-200 rounded-lg outline-none focus:border-hol-purple/50 transition-colors placeholder:text-gray-300">
    </div>

    <section id="sec-official" class="pt-8 pb-4">
      <div class="flex items-center gap-3 mb-5">
        <h2 class="font-mono text-xs font-medium uppercase tracking-widest text-gray-400">Official</h2>
        <span class="font-mono text-[10px] text-gray-300 bg-surface-100 px-1.5 py-0.5 rounded">${official.length}</span>
        <div class="flex-1 h-px bg-gray-200"></div>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3" id="list-official"></div>
    </section>

    <section id="sec-community" class="pt-8 pb-4">
      <div class="flex items-center gap-3 mb-5">
        <h2 class="font-mono text-xs font-medium uppercase tracking-widest text-gray-400">Community</h2>
        <span class="font-mono text-[10px] text-gray-300 bg-surface-100 px-1.5 py-0.5 rounded">${community.length}</span>
        <div class="flex-1 h-px bg-gray-200"></div>
      </div>
      <div id="cats"></div>
    </section>

    <div id="empty" class="hidden py-16 text-center font-mono text-sm text-gray-300">No results.</div>

    <footer class="py-10 mt-4 border-t border-gray-200">
      <p class="font-mono text-xs text-gray-300">
        Apache 2.0 &middot; <a href="https://hol.org" target="_blank" rel="noopener" class="text-gray-400 hover:text-gray-900 transition-colors">HOL</a> &middot; ${total} plugins
      </p>
    </footer>
  </div>

  <script>
    const O = ${JSON.stringify(official)};
    const C = ${JSON.stringify(community.map(p => [p.name, p.desc, p.url, p.cat]))};

    const card = ([name, desc, url], official) => \`
      <a href="\${url}" target="_blank" rel="noopener"
        class="group block p-4 rounded-xl border border-gray-200 bg-surface-50 hover:border-hol-purple/30 hover:bg-white hover:shadow-sm transition-all">
        <div class="flex items-start justify-between gap-2">
          <h3 class="font-mono text-sm font-medium text-gray-900">\${name}</h3>
          <span class="font-mono text-[10px] font-medium uppercase tracking-wide px-2 py-0.5 rounded shrink-0 \${official ? 'bg-purple-50 text-hol-purple' : 'bg-emerald-50 text-emerald-600'}">\${official ? 'Official' : 'Verified'}</span>
        </div>
        <p class="mt-2 text-sm text-gray-400 leading-relaxed line-clamp-2">\${desc}</p>
      </a>\`;

    const q = document.getElementById('q');
    const lo = document.getElementById('list-official');
    const catsEl = document.getElementById('cats');
    const empty = document.getElementById('empty');
    const secO = document.getElementById('sec-official');
    const secC = document.getElementById('sec-community');

    function render() {
      const s = q.value.toLowerCase();
      const fo = s ? O.filter(([n,d]) => n.toLowerCase().includes(s) || d.toLowerCase().includes(s)) : O;
      const fc = s ? C.filter(([n,d]) => n.toLowerCase().includes(s) || d.toLowerCase().includes(s)) : C;
      secO.style.display = fo.length ? '' : 'none';
      secC.style.display = fc.length ? '' : 'none';
      empty.classList.toggle('hidden', fo.length || fc.length);
      lo.innerHTML = fo.map(p => card(p, true)).join('');
      const groups = {};
      fc.forEach(p => { (groups[p[3]] = groups[p[3]] || []).push(p); });
      catsEl.innerHTML = Object.entries(groups).map(([cat, items]) =>
        \`<p class="font-mono text-[10px] uppercase tracking-widest text-gray-300 font-medium mt-8 mb-3">\${cat}</p><div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">\${items.map(p => card(p, false)).join('')}</div>\`
      ).join('');
    }
    render();
    q.addEventListener('input', render);
  </script>
</body>
</html>`;

fs.mkdirSync('dist', { recursive: true });
fs.writeFileSync('dist/index.html', siteHtml);
console.log(`Built site: ${total} plugins (${official.length} official, ${community.length} community)`);
