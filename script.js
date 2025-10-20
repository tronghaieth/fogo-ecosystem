// script.js — grouped catalogues + compact project tiles with social icons under logo/title
(() => {
  const ECOSYSTEM_JSON = 'ecosystem.json';
  const CACHE_KEY = 'fogo_ecosystem_cache_v1';
  const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour

  const $ = sel => document.querySelector(sel);
  const statusEl = $('#status');
  const listEl = $('#list');
  const searchEl = $('#search');
  const tagFilterEl = $('#tagFilter');

  function setStatus(text = '') { if (statusEl) statusEl.textContent = text; }

  function debounce(fn, wait = 250) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), wait);
    };
  }

  async function fetchWithCache(url) {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Date.now() - parsed.ts < CACHE_TTL_MS) {
          console.debug('Using cached ecosystem.json');
          return parsed.data;
        }
      }
    } catch (e) {
      console.warn('cache read failed', e);
    }
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
    const data = await res.json();
    try { localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data })); } catch (e) {}
    return data;
  }

  function escapeHtml(str = '') {
    return String(str).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  }

  function extractTags(items) {
    const set = new Set();
    items.forEach(it => (it.tags || []).forEach(t => set.add(t)));
    return Array.from(set).sort();
  }

  const ICONS = {
    discord: `<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Discord</title><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/></svg>`,
    twitter: `<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>X</title><path d="M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z"/></svg>`,
    web: `<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Google Chrome</title><path d="M12 0C8.21 0 4.831 1.757 2.632 4.501l3.953 6.848A5.454 5.454 0 0 1 12 6.545h10.691A12 12 0 0 0 12 0zM1.931 5.47A11.943 11.943 0 0 0 0 12c0 6.012 4.42 10.991 10.189 11.864l3.953-6.847a5.45 5.45 0 0 1-6.865-2.29zm13.342 2.166a5.446 5.446 0 0 1 1.45 7.09l.002.001h-.002l-5.344 9.257c.206.01.413.016.621.016 6.627 0 12-5.373 12-12 0-1.54-.29-3.011-.818-4.364zM12 16.364a4.364 4.364 0 1 1 0-8.728 4.364 4.364 0 0 1 0 8.728Z"/></svg>`
  };

  // render compact project tile: logo, title, (short desc optional), social-row underneath
  function renderProjectTile(item) {
    const title = item.name || 'Untitled';
    const desc = item.description || '';
    const url = item.url || item.website || '#';
    const logoSrc = item.logo || item.image || '';

    const tile = document.createElement('div');
    tile.className = 'project-tile';

    const logoInner = document.createElement('div');
    logoInner.className = 'logo-inner';

    const logoLink = document.createElement('a');
    logoLink.href = url;
    logoLink.target = '_blank';
    logoLink.rel = 'noopener noreferrer';
    logoLink.setAttribute('aria-label', `${title} website`);

    const img = document.createElement('img');
    img.className = 'logo';
    img.alt = `${title} logo`;
    img.loading = 'lazy';
    img.src = logoSrc || `https://ui-avatars.com/api/?name=${encodeURIComponent(title)}&background=0D1117&color=ffffff&size=128`;

    logoLink.appendChild(img);
    logoInner.appendChild(logoLink);

    const titleEl = document.createElement('div');
    titleEl.className = 'project-title';
    titleEl.textContent = title;

    const descEl = document.createElement('div');
    descEl.className = 'project-desc';
    descEl.textContent = desc;

    // social row (icons under title)
    const socialRow = document.createElement('div');
    socialRow.className = 'social-row';

    const socials = [
      { key: 'discord', url: item.discord || item.discord_url || item.discordLink },
      { key: 'twitter', url: item.twitter || item.twitter_url || item.twitterLink },
      { key: 'web', url: item.url || item.website || item.homepage || item.web }
    ];

    socials.forEach(s => {
      if (!s.url) return;
      const a = document.createElement('a');
      a.className = 'icon-btn';
      a.href = s.url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.setAttribute('aria-label', `${title} ${s.key}`);
      a.innerHTML = ICONS[s.key] || ICONS.web;
      socialRow.appendChild(a);
    });

    tile.appendChild(logoInner);
    tile.appendChild(titleEl);
    // only append description if exists (keeps tiles compact)
    if (desc) tile.appendChild(descEl);
    if (socialRow.children.length > 0) tile.appendChild(socialRow);

    return tile;
  }

  function renderCatalogue(title, items) {
    const section = document.createElement('section');
    section.className = 'catalogue';

    const h = document.createElement('h3');
    h.className = 'category-title';
    h.textContent = title;
    section.appendChild(h);

    const grid = document.createElement('div');
    grid.className = 'projects-grid';

    items.forEach(it => grid.appendChild(renderProjectTile(it)));

    section.appendChild(grid);
    return section;
  }

  function renderAllGrouped(data) {
    listEl.innerHTML = '';
    const container = document.createElement('div');
    container.className = 'catalogue-grid';
    Object.entries(data).forEach(([cat, arr]) => {
      if (!Array.isArray(arr) || arr.length === 0) return;
      container.appendChild(renderCatalogue(cat, arr));
    });
    listEl.appendChild(container);
  }

  function applyFiltersToArray(items, q, tag) {
    const s = (q || '').trim().toLowerCase();
    const tagVal = (tag || '').trim().toLowerCase();
    return items.filter(it => {
      if (tagVal) {
        const hasTag = (it.tags || []).some(t => t.toLowerCase() === tagVal);
        if (!hasTag) return false;
      }
      if (!s) return true;
      const hay = `${it.name || ''} ${(it.description || '')} ${(it.tags || []).join(' ')}`.toLowerCase();
      return hay.includes(s);
    });
  }

  function bindEvents(flatItems, originalData) {
    const onSearch = debounce(() => {
      const q = searchEl.value;
      const tag = tagFilterEl.value;
      localStorage.setItem('fogo_last_search', q);
      localStorage.setItem('fogo_last_tag', tag);

      if (originalData && typeof originalData === 'object' && !Array.isArray(originalData)) {
        // filter per category
        const grouped = {};
        Object.entries(originalData).forEach(([cat, arr]) => {
          if (!Array.isArray(arr)) return;
          const filtered = applyFiltersToArray(arr, q, tag);
          if (filtered.length) grouped[cat] = filtered;
        });
        if (Object.keys(grouped).length === 0) {
          setStatus('No matches found.');
          listEl.innerHTML = '';
          return;
        }
        renderAllGrouped(grouped);
        setStatus('');
      } else {
        // flat array render as one catalogue-like grid
        const filtered = applyFiltersToArray(flatItems, q, tag);
        if (!filtered.length) {
          setStatus('No matches found.');
          listEl.innerHTML = '';
          return;
        }
        // render single catalogue container to keep layout consistent
        const one = { 'Results': filtered };
        renderAllGrouped(one);
        setStatus('');
      }
    }, 180);

    searchEl.addEventListener('input', onSearch);
    tagFilterEl.addEventListener('change', onSearch);

    const lastQ = localStorage.getItem('fogo_last_search') || '';
    const lastTag = localStorage.getItem('fogo_last_tag') || '';
    if (lastQ) searchEl.value = lastQ;
    if (lastTag) tagFilterEl.value = lastTag;
    onSearch();
  }

  async function init() {
    try {
      setStatus('Loading ecosystem…');
      const data = await fetchWithCache(ECOSYSTEM_JSON);
      console.debug('ecosystem.json raw:', data);

      if (!data) {
        setStatus('No items found in ecosystem.json');
        return;
      }

      // If grouped object (categories), keep grouped rendering
      if (typeof data === 'object' && !Array.isArray(data)) {
        const flatItems = Object.values(data).flat().filter(Boolean);
        const tags = extractTags(flatItems);
        populateTagFilter(tags);
        renderAllGrouped(data);
        bindEvents(flatItems, data);
        setStatus('');
        return;
      }

      // if array or { items: [...] }
      let items;
      if (Array.isArray(data)) items = data;
      else if (data && Array.isArray(data.items)) items = data.items;
      else items = [];

      if (!items.length) {
        setStatus('No items found in ecosystem.json');
        return;
      }

      const tags = extractTags(items);
      populateTagFilter(tags);
      // render as single catalogue grid
      renderAllGrouped({ 'All': items });
      bindEvents(items, null);
      setStatus('');
    } catch (err) {
      console.error(err);
      setStatus('Failed to load ecosystem data.');
      listEl.innerHTML = `<div class="error">Unable to load data. Try refresh.</div>`;
    }
  }

  // helper to populate tag dropdown (kept from before)
  function populateTagFilter(tags) {
    if (!tagFilterEl) return;
    tagFilterEl.innerHTML = `<option value="">All tags</option>` + tags.map(t => `<option value="${escapeHtml(t)}">${escapeHtml(t)}</option>`).join('');
  }

  document.addEventListener('DOMContentLoaded', init);
})();
