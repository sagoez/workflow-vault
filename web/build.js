const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const rootDir = path.join(__dirname, '..');
const outDir = path.join(__dirname, 'site');
const yamlFiles = fs.readdirSync(rootDir).filter(f => f.endsWith('.yaml')).sort();

const workflows = [];
const categories = {};
const allTags = new Set();

for (const file of yamlFiles) {
  const raw = fs.readFileSync(path.join(rootDir, file), 'utf8');
  const data = yaml.load(raw);
  const category = file.split('_')[0];

  data._file = file;
  data._category = category;
  data.tags = data.tags || [];
  data.arguments = data.arguments || [];
  data.shells = data.shells || [];

  workflows.push(data);
  categories[category] = (categories[category] || 0) + 1;
  data.tags.forEach(t => allTags.add(t));
}

const sortedCategories = Object.entries(categories).sort((a, b) => b[1] - a[1]);
const sortedTags = [...allTags].sort();

const faviconSvg = encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64"><rect width="64" height="64" rx="14" fill="#000"/><text x="32" y="44" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-style="italic" font-size="32" fill="#fff">wf</text></svg>');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Workflow Vault</title>
<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,${faviconSvg}">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #fafafa;
    --surface: #ffffff;
    --surface2: #f4f4f5;
    --border: #e4e4e7;
    --text: #09090b;
    --text-muted: #71717a;
    --accent: #09090b;
    --accent-dim: #09090b08;
    --tag-bg: #f4f4f5;
    --tag-text: #52525b;
    --green: #16a34a;
    --orange: #ea580c;
    --radius: 8px;
    --icon-fill: #000;
    --icon-text: #fff;
    --command-text: #16a34a;
  }

  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #1a1a1a;
      --surface: #242424;
      --surface2: #2e2e2e;
      --border: #383838;
      --text: #e8e8e8;
      --text-muted: #999;
      --accent: #e8e8e8;
      --accent-dim: #e8e8e811;
      --tag-bg: #2e2e2e;
      --tag-text: #999;
      --green: #4ade80;
      --orange: #fb923c;
      --icon-fill: #e8e8e8;
      --icon-text: #1a1a1a;
      --command-text: #4ade80;
    }
  }

  [data-theme="dark"] {
    --bg: #1a1a1a;
    --surface: #242424;
    --surface2: #2e2e2e;
    --border: #383838;
    --text: #e8e8e8;
    --text-muted: #999;
    --accent: #e8e8e8;
    --accent-dim: #e8e8e811;
    --tag-bg: #2e2e2e;
    --tag-text: #999;
    --green: #4ade80;
    --orange: #fb923c;
    --icon-fill: #e8e8e8;
    --icon-text: #1a1a1a;
    --command-text: #4ade80;
  }

  [data-theme="light"] {
    --bg: #fafafa;
    --surface: #ffffff;
    --surface2: #f4f4f5;
    --border: #e4e4e7;
    --text: #09090b;
    --text-muted: #71717a;
    --accent: #09090b;
    --accent-dim: #09090b08;
    --tag-bg: #f4f4f5;
    --tag-text: #52525b;
    --green: #16a34a;
    --orange: #ea580c;
    --icon-fill: #000;
    --icon-text: #fff;
    --command-text: #16a34a;
  }

  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: var(--bg);
    color: var(--text);
    line-height: 1.6;
    min-height: 100vh;
    transition: background 0.3s ease, color 0.3s ease;
  }

  .sidebar, .main, .search-input, .command-code, .arg-input {
    transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
  }

  .layout {
    display: grid;
    grid-template-columns: 240px 1fr;
    min-height: 100vh;
  }

  /* Sidebar */
  .sidebar {
    background: var(--surface);
    border-right: 1px solid var(--border);
    padding: 24px 0;
    position: sticky;
    top: 0;
    height: 100vh;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  }

  .sidebar-header {
    padding: 0 20px 20px;
    border-bottom: 1px solid var(--border);
    margin-bottom: 12px;
  }

  .sidebar-header h1 {
    font-size: 20px;
    font-weight: 700;
    letter-spacing: -0.02em;
  }

  .sidebar-header .count {
    font-size: 13px;
    color: var(--text-muted);
    margin-top: 2px;
  }

  .github-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-top: 10px;
    padding: 5px 12px;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 6px;
    color: var(--text-muted);
    text-decoration: none;
    font-size: 12px;
    font-weight: 500;
    transition: all 0.15s;
  }

  .github-badge:hover {
    color: var(--text);
    border-color: var(--text-muted);
    background: var(--border);
  }

  .github-badge svg {
    flex-shrink: 0;
  }

  .theme-toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 6px;
    color: var(--text-muted);
    cursor: pointer;
    transition: all 0.15s;
    margin-left: 6px;
  }

  .theme-toggle:hover {
    color: var(--text);
    border-color: var(--text-muted);
  }

  .sidebar-section {
    padding: 8px 12px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-muted);
  }

  .sidebar-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 20px;
    font-size: 14px;
    color: var(--text-muted);
    cursor: pointer;
    transition: all 0.15s;
    border-left: 3px solid transparent;
  }

  .sidebar-item:hover {
    background: var(--surface2);
    color: var(--text);
  }

  .sidebar-item.active {
    background: var(--accent-dim);
    color: var(--text);
    border-left-color: var(--text);
  }

  .sidebar-item .badge {
    font-size: 12px;
    background: var(--surface2);
    padding: 1px 8px;
    border-radius: 10px;
    color: var(--text-muted);
    font-weight: 500;
  }

  .sidebar-item.active .badge {
    background: var(--accent-dim);
    color: var(--text);
  }

  /* Main content */
  .main {
    padding: 32px 40px;
    max-width: 960px;
  }

  .search-bar {
    position: sticky;
    top: 0;
    z-index: 10;
    background: var(--bg);
    padding-bottom: 20px;
  }

  .search-input {
    width: 100%;
    padding: 12px 16px 12px 44px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    color: var(--text);
    font-size: 15px;
    outline: none;
    transition: border-color 0.15s;
  }

  .search-input:focus {
    border-color: var(--accent);
  }

  .search-wrapper {
    position: relative;
  }

  .search-icon {
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-muted);
    font-size: 16px;
    pointer-events: none;
  }

  .active-filters {
    display: flex;
    gap: 8px;
    margin-top: 12px;
    flex-wrap: wrap;
  }

  .filter-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 12px;
    background: var(--accent-dim);
    color: var(--accent);
    border-radius: 20px;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s ease;
    animation: scaleIn 0.2s ease-out;
  }

  .filter-pill:hover { opacity: 0.7; transform: scale(0.97); }
  .filter-pill .x { font-weight: 700; }

  .results-count {
    font-size: 13px;
    color: var(--text-muted);
    margin-bottom: 16px;
  }

  /* Animations */
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.97); }
    to { opacity: 1; transform: scale(1); }
  }

  @keyframes checkmark {
    0% { transform: scale(0); }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); }
  }

  /* Workflow cards */
  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    margin-bottom: 12px;
    overflow: hidden;
    transition: border-color 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease;
    animation: fadeInUp 0.4s ease-out both;
  }

  .card:hover {
    border-color: var(--accent);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    transform: translateY(-1px);
  }

  .card-header {
    padding: 16px 20px;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
    transition: background 0.2s ease;
  }

  .card-header:hover {
    background: var(--accent-dim);
  }

  .card-title {
    font-size: 15px;
    font-weight: 600;
    margin-bottom: 4px;
  }

  .card-desc {
    font-size: 13px;
    color: var(--text-muted);
    line-height: 1.5;
  }

  .card-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  .category-badge {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    padding: 3px 10px;
    border-radius: 4px;
    background: var(--surface2);
    color: var(--text-muted);
    white-space: nowrap;
  }

  .card-body {
    padding: 0 20px;
    border-top: 1px solid var(--border);
    max-height: 0;
    overflow: hidden;
    opacity: 0;
    transition: max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1),
                opacity 0.25s ease,
                padding 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .card.open .card-body {
    max-height: 800px;
    opacity: 1;
    padding: 16px 20px;
  }

  /* Interactive args form */
  .args-form {
    margin-bottom: 16px;
  }

  .args-form-label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-muted);
    margin-bottom: 10px;
  }

  .arg-row {
    display: grid;
    grid-template-columns: 120px 1fr;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;
  }

  .arg-label {
    font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
    font-size: 12px;
    color: var(--orange);
    text-align: right;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .arg-input {
    width: 100%;
    padding: 7px 12px;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 5px;
    color: var(--text);
    font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
    font-size: 13px;
    outline: none;
    transition: border-color 0.15s;
  }

  .arg-input:focus {
    border-color: var(--accent);
  }

  .arg-input::placeholder {
    color: var(--text-muted);
    opacity: 0.6;
  }

  .arg-desc {
    grid-column: 2;
    font-size: 11px;
    color: var(--text-muted);
    margin-top: -4px;
    margin-bottom: 4px;
  }

  .command-block {
    position: relative;
    margin-bottom: 14px;
  }

  .command-label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-muted);
    margin-bottom: 6px;
  }

  .command-code {
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 14px 16px;
    padding-right: 70px;
    font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
    font-size: 13px;
    line-height: 1.6;
    overflow-x: auto;
    white-space: pre-wrap;
    word-break: break-all;
    color: var(--command-text);
  }

  .command-code .placeholder {
    color: var(--orange);
    background-color: rgba(251, 146, 60, 0.15);
    border-radius: 3px;
    padding: 1px 4px;
    transition: all 0.3s ease;
  }

  .command-code .filled {
    color: var(--accent);
    background-color: rgba(108, 138, 255, 0.15);
    border-radius: 3px;
    padding: 1px 4px;
    animation: scaleIn 0.2s ease-out;
  }

  .copy-btn {
    position: absolute;
    top: 28px;
    right: 8px;
    background: var(--surface2);
    border: 1px solid var(--border);
    color: var(--text-muted);
    font-size: 12px;
    padding: 4px 10px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .copy-btn:hover { color: var(--text); background: var(--border); transform: scale(1.05); }
  .copy-btn:active { transform: scale(0.95); }
  .copy-btn.copied { color: var(--green); border-color: var(--green); background: rgba(74, 222, 128, 0.1); }

  .tags-row {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 12px;
  }

  .tag {
    font-size: 12px;
    padding: 2px 10px;
    border-radius: 4px;
    background: var(--tag-bg);
    color: var(--tag-text);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .tag:hover {
    background: var(--accent-dim);
    color: var(--accent);
    transform: translateY(-1px);
  }

  .tag:active {
    transform: scale(0.95);
  }

  .shells-info {
    font-size: 12px;
    color: var(--text-muted);
    margin-top: 10px;
  }

  .shells-info span {
    color: var(--text);
  }

  .author-info {
    font-size: 12px;
    color: var(--text-muted);
    margin-top: 6px;
  }

  .author-info a {
    color: var(--accent);
    text-decoration: none;
  }

  .author-info a:hover {
    text-decoration: underline;
  }

  .empty-state {
    text-align: center;
    padding: 60px 20px;
    color: var(--text-muted);
  }

  .empty-state h2 {
    font-size: 18px;
    margin-bottom: 8px;
    color: var(--text);
  }

  /* Responsive */
  @media (max-width: 768px) {
    .layout {
      grid-template-columns: 1fr;
    }
    .sidebar {
      position: static;
      height: auto;
      border-right: none;
      border-bottom: 1px solid var(--border);
      padding: 16px 0;
    }
    .sidebar-header {
      padding: 0 16px 14px;
    }
    .sidebar-header h1 {
      font-size: 18px;
    }
    .sidebar-section {
      display: none;
    }
    .sidebar-item {
      display: inline-flex;
      padding: 5px 12px;
      font-size: 13px;
      border-left: none;
      border-radius: 6px;
      margin: 2px 4px 2px 12px;
    }
    .sidebar-item .badge {
      margin-left: 4px;
      padding: 0 6px;
      font-size: 11px;
    }
    .sidebar-item.active {
      border-left-color: transparent;
    }
    .main {
      padding: 16px 12px;
    }
    .search-input {
      font-size: 14px;
      padding: 10px 14px 10px 40px;
    }
    .card-header {
      padding: 12px 14px;
      flex-direction: column;
      gap: 8px;
    }
    .card-body {
      padding: 0 14px 14px;
    }
    .card.open .card-body {
      padding-top: 14px;
    }
    .command-code {
      font-size: 12px;
      padding: 10px 12px;
      padding-right: 60px;
    }
    .arg-row {
      grid-template-columns: 1fr;
      gap: 4px;
    }
    .arg-label {
      text-align: left;
      font-size: 11px;
    }
    .arg-input {
      font-size: 12px;
      padding: 6px 10px;
    }
    .github-badge {
      margin-top: 8px;
      font-size: 11px;
      padding: 4px 10px;
    }
  }
</style>
</head>
<body>
<div class="layout">
  <aside class="sidebar">
    <div class="sidebar-header">
      <div style="display:flex;align-items:center;gap:10px;">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="28" height="28"><rect width="64" height="64" rx="14" fill="var(--text)"/><text x="32" y="44" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-style="italic" font-size="32" fill="var(--bg)">wf</text></svg>
        <h1>Workflow Vault</h1>
      </div>
      <div class="count">${workflows.length} workflows</div>
      <div style="display:flex;align-items:center;gap:6px;margin-top:10px;">
        <a href="https://github.com/sagoez/workflow" target="_blank" class="github-badge" style="margin-top:0;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
          CLI Tool
        </a>
        <button class="theme-toggle" onclick="toggleTheme()" title="Toggle theme" id="themeToggle">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" id="themeIcon"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
        </button>
      </div>
    </div>
    <div class="sidebar-section">Categories</div>
    <div class="sidebar-item active" data-category="all">
      <span>All</span>
      <span class="badge">${workflows.length}</span>
    </div>
    ${sortedCategories.map(([cat, count]) => `<div class="sidebar-item" data-category="${cat}">
      <span>${cat}</span>
      <span class="badge">${count}</span>
    </div>`).join('\n    ')}
  </aside>
  <main class="main">
    <div class="search-bar">
      <div class="search-wrapper">
        <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input class="search-input" type="text" placeholder="Search workflows..." autofocus>
      </div>
      <div class="active-filters" id="activeFilters"></div>
    </div>
    <div class="results-count" id="resultsCount"></div>
    <div id="workflowList"></div>
  </main>
</div>

<script>
const workflows = ${JSON.stringify(workflows, null, 2)};

let state = {
  search: '',
  category: 'all',
  tags: new Set(),
};

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function highlightCommand(command, args, cardId) {
  let html = escapeHtml(command);
  // Replace {{arg}} placeholders with highlighted spans
  for (const a of args) {
    const placeholder = '{{' + a.name + '}}';
    const escapedPlaceholder = escapeHtml(placeholder);
    const inputEl = document.querySelector('#arg-' + cardId + '-' + a.name);
    const val = inputEl ? inputEl.value : '';
    if (val) {
      html = html.split(escapedPlaceholder).join('<span class="filled">' + escapeHtml(val) + '</span>');
    } else {
      html = html.split(escapedPlaceholder).join('<span class="placeholder">' + escapedPlaceholder + '</span>');
    }
  }
  return html;
}

function resolveCommand(command, args, cardId) {
  let resolved = command;
  for (const a of args) {
    const placeholder = '{{' + a.name + '}}';
    const inputEl = document.querySelector('#arg-' + cardId + '-' + a.name);
    const val = inputEl ? inputEl.value : '';
    resolved = resolved.split(placeholder).join(val || placeholder);
  }
  return resolved;
}

function getCardId(file) {
  return file.replace(/[^a-zA-Z0-9]/g, '_');
}

function renderCard(w) {
  const cardId = getCardId(w._file);

  const argsFormHtml = w.arguments.length ? \`
    <div class="args-form">
      <div class="args-form-label">Arguments</div>
      \${w.arguments.map(a => \`
        <div class="arg-row">
          <label class="arg-label" for="arg-\${cardId}-\${a.name}">\${escapeHtml(a.name)}</label>
          <input class="arg-input"
            id="arg-\${cardId}-\${a.name}"
            data-card="\${cardId}"
            type="text"
            placeholder="\${a.default_value ? escapeHtml(String(a.default_value)) : 'required'}"
            value="\${a.default_value ? escapeHtml(String(a.default_value)) : ''}"
            oninput="updatePreview('\${cardId}')">
        </div>
        \${a.description ? '<div class="arg-desc">' + escapeHtml(a.description) + '</div>' : ''}
      \`).join('')}
    </div>\` : '';

  const tagsHtml = w.tags.length ? \`
    <div class="tags-row">
      \${w.tags.map(t => \`<span class="tag" onclick="addTagFilter('\${escapeHtml(t)}')">\${escapeHtml(t)}</span>\`).join('')}
    </div>\` : '';

  const shellsHtml = w.shells && w.shells.length ? \`
    <div class="shells-info">Shells: <span>\${w.shells.join(', ')}</span></div>\` : '';

  const authorHtml = w.author ? \`
    <div class="author-info">Author: \${w.author_url ? \`<a href="\${escapeHtml(w.author_url)}" target="_blank">\${escapeHtml(w.author)}</a>\` : escapeHtml(w.author)}</div>\` : '';

  // Initial command with placeholders highlighted
  let initialCmd = escapeHtml(w.command);
  for (const a of w.arguments) {
    const ph = escapeHtml('{{' + a.name + '}}');
    const val = a.default_value ? escapeHtml(String(a.default_value)) : null;
    if (val) {
      initialCmd = initialCmd.split(ph).join('<span class="filled">' + val + '</span>');
    } else {
      initialCmd = initialCmd.split(ph).join('<span class="placeholder">{{' + escapeHtml(a.name) + '}}</span>');
    }
  }

  const delay = (w._renderIndex || 0) * 0.03;
  return \`<div class="card" data-file="\${w._file}" data-card-id="\${cardId}" style="animation-delay:\${delay}s">
    <div class="card-header" onclick="toggleCard(this)">
      <div>
        <div class="card-title">\${escapeHtml(w.name)}</div>
        <div class="card-desc">\${escapeHtml(w.description || '')}</div>
      </div>
      <div class="card-meta">
        <span class="category-badge">\${escapeHtml(w._category)}</span>
      </div>
    </div>
    <div class="card-body">
      \${argsFormHtml}
      <div class="command-block">
        <div class="command-label">Command</div>
        <div class="command-code" id="cmd-\${cardId}">\${initialCmd}</div>
        <button class="copy-btn" onclick="copyResolved('\${cardId}', event)">Copy</button>
      </div>
      \${tagsHtml}
      \${shellsHtml}
      \${authorHtml}
    </div>
  </div>\`;
}

// Lookup workflow by cardId
function getWorkflow(cardId) {
  return workflows.find(w => getCardId(w._file) === cardId);
}

function updatePreview(cardId) {
  const w = getWorkflow(cardId);
  if (!w) return;
  const cmdEl = document.getElementById('cmd-' + cardId);
  if (!cmdEl) return;
  cmdEl.innerHTML = highlightCommand(w.command, w.arguments, cardId);
}

function copyResolved(cardId, event) {
  event.stopPropagation();
  const w = getWorkflow(cardId);
  if (!w) return;
  const resolved = resolveCommand(w.command, w.arguments, cardId);
  const btn = event.currentTarget;
  navigator.clipboard.writeText(resolved).then(() => {
    btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="animation:checkmark 0.3s ease"><polyline points="20 6 9 17 4 12"/></svg> Copied';
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 1500);
  });
}

function filterWorkflows() {
  const q = state.search.toLowerCase();
  return workflows.filter(w => {
    if (state.category !== 'all' && w._category !== state.category) return false;
    if (state.tags.size > 0 && ![...state.tags].every(t => w.tags.includes(t))) return false;
    if (q) {
      const haystack = [w.name, w.description, w.command, ...w.tags, w._category].join(' ').toLowerCase();
      return q.split(/\\s+/).every(word => haystack.includes(word));
    }
    return true;
  });
}

function render() {
  const results = filterWorkflows();
  document.getElementById('resultsCount').textContent = \`\${results.length} workflow\${results.length !== 1 ? 's' : ''}\`;
  results.forEach((w, i) => w._renderIndex = i);
  document.getElementById('workflowList').innerHTML = results.length
    ? results.map(renderCard).join('')
    : '<div class="empty-state"><h2>No workflows found</h2><p>Try adjusting your search or filters.</p></div>';

  const filtersEl = document.getElementById('activeFilters');
  const pills = [];
  if (state.category !== 'all') {
    pills.push(\`<span class="filter-pill" onclick="clearCategory()">category: \${state.category} <span class="x">&times;</span></span>\`);
  }
  state.tags.forEach(t => {
    pills.push(\`<span class="filter-pill" onclick="removeTagFilter('\${t}')">tag: \${t} <span class="x">&times;</span></span>\`);
  });
  filtersEl.innerHTML = pills.join('');

  document.querySelectorAll('.sidebar-item').forEach(el => {
    el.classList.toggle('active', el.dataset.category === state.category);
  });
}

function toggleCard(header) {
  header.parentElement.classList.toggle('open');
}

function addTagFilter(tag) {
  state.tags.add(tag);
  render();
}

function removeTagFilter(tag) {
  state.tags.delete(tag);
  render();
}

function clearCategory() {
  state.category = 'all';
  render();
}

// Sidebar click handlers
document.querySelectorAll('.sidebar-item').forEach(el => {
  el.addEventListener('click', () => {
    state.category = el.dataset.category;
    render();
  });
});

// Search input
document.querySelector('.search-input').addEventListener('input', (e) => {
  state.search = e.target.value;
  render();
});

// Keyboard shortcut: / to focus search
document.addEventListener('keydown', (e) => {
  if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
    e.preventDefault();
    document.querySelector('.search-input').focus();
  }
  if (e.key === 'Escape') {
    document.activeElement.blur();
  }
});

// Theme toggle
function getPreferredTheme() {
  const saved = localStorage.getItem('theme');
  if (saved) return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const icon = document.getElementById('themeIcon');
  if (theme === 'dark') {
    icon.innerHTML = '<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>';
  } else {
    icon.innerHTML = '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>';
  }
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || getPreferredTheme();
  const next = current === 'dark' ? 'light' : 'dark';
  localStorage.setItem('theme', next);
  applyTheme(next);
}

applyTheme(getPreferredTheme());

render();
</script>
</body>
</html>`;

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'index.html'), html);
console.log(`Built site/index.html with ${workflows.length} workflows in ${sortedCategories.length} categories`);
