// Improved script.js with logo hover social popup
(() => {
  const ECOSYSTEM_JSON = 'ecosystem.json';
  const CACHE_KEY = 'fogo_ecosystem_cache_v1';
  const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour

  const $ = sel => document.querySelector(sel);
  const statusEl = $('#status');
  const listEl = $('#list');
  const searchEl = $('#search');
  const tagFilterEl = $('#tagFilter');

  function setStatus(text) { statusEl.textContent = text; }

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

  function escapeHtml(str='') {
    return String(str).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
  }

  function extractTags(items) {
    const set = new Set();
    items.forEach(it => (it.tags || []).forEach(t => set.add(t)));
    return Array.from(set).sort();
  }

  // Inline SVG icons
  const ICONS = {
    discord: `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M20.317 4.369a19.791 19.791 0 00-4.885-1.515.07.07 0 00-.075.035c-.21.375-.444.864-.608 1.249-1.844-.277-3.68-.277-5.486 0-.164-.405-.418-.874-.63-1.249a.066.066 0 00-.075-.035 19.736 19.736 0 00-4.885 1.515.061.061 0 00-.028.021C2.52 9.045 1.67 13.579 2.1 18.057c.001.014.01.027.02.036a.077.077 0 00.032.012c2.052.315 4.06.473 6.012.473 1.98 0 3.92-.15 5.81-.44a.075.075 0 00.033-.012.045.045 0 00.02-.036c.5-4.396-.38-8.94-3.548-13.666a.036.036 0 00-.028-.02zM8.02 15.331c-1.182 0-2.156-1.085-2.156-2.419 0-1.333.95-2.418 2.156-2.418 1.22 0 2.197 1.1 2.156 2.418 0 1.334-.95 2.419-2.156 2.419zm7.974 0c-1.182 0-2.156-1.085-2.156-2.419 0-1.333.95-2.418 2.156-2.418 1.22 0 2.197 1.1 2.156 2.418 0 1.334-.936 2.419-2.156 2.419z"></path></svg>`,
    twitter: `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M22.46 6.011c-.77.341-1.6.573-2.47.676a4.29 4.29 0 001.88-2.37 8.59 8.59 0 01-2.72 1.04 4.28 4.28 0 00-7.3 3.9A12.14 12.14 0 013 4.89a4.28 4.28 0 001.32 5.71c-.6-.02-1.17-.18-1.66-.45v.04a4.28 4.28 0 003.44 4.2c-.5.13-1.03.15-1.57.06a4.29 4.29 0 004 2.98A8.58 8.58 0 012 19.54a12.1 12.1 0 006.56 1.92c7.88 0 12.2-6.53 12.2-12.2 0-.19 0-.39-.01-.58a8.7 8.7 0 002.14-2.22l.01-.01z"></path></svg>`,
    web: `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm6.9 6h-2.2a15.4 15.4 0 00-1.1-3.2A8 8 0 0118.9 8zM12 4.1c.9 1.4 1.6 3 2 4.9h-4c.4-1.9 1.1-3.5 2-4.9zM4.1 10a15.4 15.4 0 00.4 2H2.3A8 8 0 014.1 10zM6.1 16a15.4 15.4 0 011.1-3.2 8 8 0 01-3 .4A8 8 0 006.1 16zM12 19.9c-.9-1.4-1.6-3-2-4.9h4c-.4 1.9-1.1 3.5-2 4.9zm4.4-1.6c1.3-.9 2.3-2 3-3.4h-3.6c-.1 1.3-.3 2.6-.6 3.9.4-.2.8-.4 1.2-.5z"></path></svg>`
  };

  function renderCard(item) {
    const title = item.name || 'Untitled';
    const desc = item.description || '';
    const url = item.url || item.website || '#';
    const logoSrc = item.logo || item.image || '';

    const card = document.createElement('article');
    card.className = 'card';

    // top area with logo and title
    const top = document.createElement('div');
    top.className = 'card-top';

    // logo wrap
    const logoWrap = document.createElement('div');
    logoWrap.className = 'logo-wrap';
    logoWrap.setAttribute('aria-hidden', 'false');

    // clickable logo (goes to project website in new tab)
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
    logoWrap.appendChild(logoLink);

    // social popup (only add icons with links)
    const popup = document.createElement('div');
    popup.className = 'social-popup';
    popup.setAttribute('role', 'group');
    popup.setAttribute('aria-label', `${title} social links`);

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
      popup.appendChild(a);
    });

    // append popup only if it has children
    if (popup.children.length > 0) {
      logoWrap.appendChild(popup);
    }

    const titleWrap = document.createElement('div');
    titleWrap.className = 'title-wrap';
    titleWrap.innerHTML = `<div class="title"><a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(title)}</a></div>`;

    top.appendChild(logoWrap);
    top.appendChild(titleWrap);

    const descEl = document.createElement('div');
    descEl.className = 'desc';
    descEl.textContent = desc;

    const meta = document.createElement('div');
    meta.className = 'meta';
    (item.tags || []).forEach(t => {
      const s = document.createElement('span');
      s.className = 'badge';
      s.textContent = t;
      meta.appendChild(s);
    });

    card.appendChild(top);
    card.appendChild(descEl);
    card.appendChild(meta);

    return card;
  }

  function renderList(items) {
    listEl.innerHTML = '';
    if (!items || items.length === 0) {
      setStatus('No matches found.');
      return;
    }
    setStatus('');
    const frag = document.createDocumentFragment();
    items.forEach(it => frag.appendChild(renderCard(it)));
    listEl.appendChild(frag);
  }

  function applyFilters(items, searchValue, tag) {
    const s = (searchValue || '').trim().toLowerCase();
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

  function populateTagFilter(tags) {
    tagFilterEl.innerHTML = `<option value="">All tags</option>` + tags.map(t => `<option value="${escapeHtml(t)}">${escapeHtml(t)}</option>`).join('');
  }

  function bindEvents(items) {
    const onSearch = debounce(() => {
      const q = searchEl.value;
      const tag = tagFilterEl.value;
      localStorage.setItem('fogo_last_search', q);
      localStorage.setItem('fogo_last_tag', tag);
      renderList(applyFilters(items, q, tag));
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
      const items = Array.isArray(data) ? data : (data.items || []);
      if (!items.length) {
        setStatus('No items found in ecosystem.json');
        return;
      }
      setStatus('');
      const tags = extractTags(items);
      populateTagFilter(tags);
      bindEvents(items);
      const q = searchEl.value || localStorage.getItem('fogo_last_search') || '';
      const tag = tagFilterEl.value || localStorage.getItem('fogo_last_tag') || '';
      renderList(applyFilters(items, q, tag));
    } catch (err) {
      console.error(err);
      setStatus('Failed to load ecosystem data.');
      listEl.innerHTML = `<div class="error">Unable to load data. Try refresh.</div>`;
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
