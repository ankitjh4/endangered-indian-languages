// Endangered Indian Languages Archive - Main Application
// Version: 5.1.0 — uses LANGUAGE_DATA + LANGUAGE_STATS from language_data.js

// All 143 languages (some have full data, rest show as pending)
const ALL_LANGUAGES = [
    "Aimol","Angami","Ao","Aranadan","Baghati","Bangani","Baradi",
    "Bawm","Bellari","Bhala","Bharwad","Bhujel","Bhunjia","Biate","Birhor",
    "Bodo","Bondo","Byangsi","Chakhesang","Chang","Chaudangsi","Chin","Chiru",
    "Chothe","Darma","Darmiya","Deori","Dimasa","Diwehi","Falam","Gadaba",
    "Gahri","Gangte","Garo","Gorum","Gurung","Hmar","Ho","Jad","Jarawa",
    "Jenu Kurumba","Juang","Kadar","Kalanadi","Kanashi","Khampti","Khasi",
    "Khiamniungan","Khumi","Koch","Koda","Kolami","Kom","Konda","Konyak",
    "Koraga","Korku","Kota","Koya","Kuruba","Kurichiya","Kurumbar",
    "Lai","Lamongse","Lamkang","Limbu","Lotha","Luro","Magar","Maram",
    "Maring","Mara","Mate","Meitei","Mising","Monsang","Moyon","Mro",
    "Munda","Naiki","Newari","Nihali","Nocte","Ollari","Onge",
    "Paite","Parji","Phom","Pnar","Poumai","Purum","Rabha","Rai","Rajbangshi",
    "Ralte","Rengma","Rokdung","Roman Sherpa","Rongmei","Sambhota Sherpa",
    "Sangtam","Santali","Sema","Sentinelese","Shompen","Siddi","Simte",
    "Singpho","Soliga","Sora","Spiti","Sunwar","Tai Aiton","Tai Phake",
    "Tamang","Tangam","Tangkhul","Tangsa","Tarao","Thado","Thadou","Thangal",
    "Tiwa","Toto","Tulu","Tutsa","Urali","Vaiphei","War","Wancho",
    "Yerukala","Yimchunger","Zeme","Zomi","Zou","Sherdukpen","Khaloi"
];

// Build lookup from language_data.js (loaded before this script)
const DB = {};
(typeof LANGUAGE_DATA !== 'undefined' ? LANGUAGE_DATA : []).forEach(l => {
    DB[l.name] = l;
});

function getFullList() {
    return ALL_LANGUAGES.map(name => DB[name] || {
        name, region: 'India', family: 'Unknown',
        status: 'Endangered', resources: 0, sitemaps: 0, items: []
    });
}

// ── Stat card update ───────────────────────────────────────────────────────────
function updateStats() {
    const langs = getFullList();
    const totalResources = langs.reduce((s, l) => s + (l.resources || l.items.length), 0);
    const totalSitemaps  = langs.reduce((s, l) => s + (l.sitemaps  || 0), 0);
    const covered = langs.filter(l => l.resources > 0).length;

    document.getElementById('statLangs').textContent  = ALL_LANGUAGES.length;
    document.getElementById('statRes').textContent    = totalResources + '+';
    document.getElementById('statSitemaps').textContent = totalSitemaps;
    document.getElementById('statCoverage').textContent = Math.round(covered / ALL_LANGUAGES.length * 100) + '%';
}

// ── Language grid ──────────────────────────────────────────────────────────────
function renderLanguages(filterTerm) {
    const term = (filterTerm || document.getElementById('searchInput').value || '').toLowerCase();
    const langs = getFullList().filter(l => !term || l.name.toLowerCase().includes(term));
    const grid  = document.getElementById('languageGrid');

    grid.innerHTML = langs.map(lang => {
        const count  = lang.resources || lang.items.length;
        const items  = lang.items || [];
        const topItems = items.slice(0, 3).map(r => `
            <div class="resource ${r.hasSitemap ? 'sitemap' : ''}">
                <div class="resource-type">${r.type || ''}</div>
                <a href="${r.url}" target="_blank" rel="noopener noreferrer">${r.title}</a>
            </div>`).join('');

        const moreLink = items.length > 3
            ? `<div class="view-more" onclick="openResourcesModal('${esc(lang.name)}')">View all ${items.length} resources →</div>`
            : '';

        const body = items.length
            ? `<div class="resources">${topItems}${moreLink}</div>`
            : `<div class="resources"><p class="pending-msg">⏳ Discovery pending…</p></div>`;

        return `
        <div class="card" data-name="${lang.name.toLowerCase()}" id="card-${slug(lang.name)}">
            <div class="card-header">
                <h3>${lang.name}</h3>
                <div class="tags">
                    <span class="tag tag-region">${lang.region}</span>
                    <span class="tag tag-family">${lang.family}</span>
                    <span class="tag tag-status">${lang.status}</span>
                </div>
            </div>
            <div class="card-stats">
                ${count > 0
                    ? `<span class="clickable-stat" onclick="openResourcesModal('${esc(lang.name)}')"><strong>${count}</strong> resources ↗</span>`
                    : `<span><strong>0</strong> resources</span>`}
                <span><strong>${lang.sitemaps || 0}</strong> with sitemaps</span>
            </div>
            ${body}
        </div>`;
    }).join('');
}

function filterLanguages() { renderLanguages(); }

// ── List modal (generic) ───────────────────────────────────────────────────────
function showListModal(title, html) {
    document.getElementById('listModalTitle').textContent = title;
    document.getElementById('listModalBody').innerHTML = html;
    document.getElementById('listModalSearch').value = '';
    document.getElementById('listModal').classList.add('active');
}

function closeListModal() {
    document.getElementById('listModal').classList.remove('active');
}

// Filter inside the list modal
function filterListModal() {
    const term = document.getElementById('listModalSearch').value.toLowerCase();
    document.querySelectorAll('#listModalBody .filterable').forEach(el => {
        el.style.display = el.dataset.key.includes(term) ? '' : 'none';
    });
}

// ── "143 Languages" stat ───────────────────────────────────────────────────────
function openLanguagesModal() {
    const langs = getFullList();
    const pills = langs.map(l => {
        const cls = l.resources > 0 ? 'lang-pill has-data' : 'lang-pill no-data';
        const badge = l.resources > 0 ? `<small>${l.resources}</small>` : '';
        return `<span class="${cls} filterable" data-key="${l.name.toLowerCase()}"
                      onclick="jumpToCard('${esc(l.name)}')">${l.name}${badge}</span>`;
    }).join('');

    showListModal(`All ${ALL_LANGUAGES.length} Endangered Languages of India`,
        `<div class="lang-grid">${pills}</div>`);
}

// ── "746+ Resources" stat ──────────────────────────────────────────────────────
function openAllResourcesModal() {
    const rows = [];
    getFullList().forEach(lang => {
        (lang.items || []).forEach(r => rows.push({ ...r, language: lang.name }));
    });

    const html = rows.map(r => `
        <div class="modal-resource filterable" data-key="${(r.language + ' ' + r.title).toLowerCase()}">
            <div class="modal-resource-meta">
                <span class="lang-tag">${r.language}</span>
                <span class="res-type-tag">${r.type || ''}</span>
                ${r.hasSitemap ? '<span class="sitemap-badge">SITEMAP</span>' : ''}
            </div>
            <a href="${r.url}" target="_blank" rel="noopener noreferrer">${r.title}</a>
        </div>`).join('');

    showListModal(`All ${rows.length} Resources`, html);
}

// ── "280 Sitemaps" stat ────────────────────────────────────────────────────────
function openSitemapsModal() {
    const rows = [];
    getFullList().forEach(lang => {
        (lang.items || []).filter(r => r.hasSitemap).forEach(r =>
            rows.push({ ...r, language: lang.name })
        );
    });

    const html = rows.map(r => `
        <div class="modal-resource filterable" data-key="${(r.language + ' ' + r.title).toLowerCase()}">
            <div class="modal-resource-meta">
                <span class="lang-tag">${r.language}</span>
                <span class="res-type-tag">${r.type || ''}</span>
                <span class="sitemap-badge">SITEMAP</span>
            </div>
            <a href="${r.url}" target="_blank" rel="noopener noreferrer">${r.title}</a>
        </div>`).join('');

    showListModal(`${rows.length} Resources with Sitemaps`, html);
}

// ── Per-language resources popup ───────────────────────────────────────────────
function openResourcesModal(langName) {
    const lang = DB[langName];
    if (!lang || !lang.items.length) {
        showListModal(`${langName} — No resources yet`,
            `<p style="padding:20px;color:#718096">This language hasn't been processed yet by the discovery agent.</p>`);
        return;
    }

    const html = lang.items.map(r => `
        <div class="modal-resource filterable" data-key="${r.title.toLowerCase()}">
            <div class="modal-resource-meta">
                <span class="res-type-tag">${r.type || ''}</span>
                ${r.hasSitemap ? '<span class="sitemap-badge">SITEMAP</span>' : ''}
                ${r.quality >= 0.8 ? '<span class="quality-badge">HIGH QUALITY</span>' : ''}
            </div>
            <a href="${r.url}" target="_blank" rel="noopener noreferrer">${r.title}</a>
        </div>`).join('');

    showListModal(`${langName} — ${lang.items.length} Resources`, html);
}

// ── Jump to card ───────────────────────────────────────────────────────────────
function jumpToCard(langName) {
    closeListModal();
    document.getElementById('searchInput').value = '';
    renderLanguages('');
    setTimeout(() => {
        const card = document.getElementById('card-' + slug(langName));
        if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 80);
}

// ── Submit modals ──────────────────────────────────────────────────────────────
function openModal(id) {
    document.getElementById(id).classList.add('active');
    if (id === 'submitResource') populateLanguageDropdown();
}
function closeModal(id) { document.getElementById(id).classList.remove('active'); }

function populateLanguageDropdown() {
    document.getElementById('resourceLanguage').innerHTML =
        ALL_LANGUAGES.map(l => `<option>${l}</option>`).join('');
}

function submitResource() {
    const data = {
        language: document.getElementById('resourceLanguage').value,
        title: document.getElementById('resourceTitle').value,
        url:   document.getElementById('resourceURL').value,
        email: document.getElementById('resourceEmail').value
    };
    if (!data.title || !data.url) { alert('Please fill in all required fields'); return; }
    alert('Thank you! Your resource submission has been received and will be reviewed.');
    closeModal('submitResource');
    document.getElementById('resourceTitle').value = '';
    document.getElementById('resourceURL').value   = '';
}

function submitLanguage() {
    const data = {
        name:   document.getElementById('langName').value,
        region: document.getElementById('langRegion').value,
        family: document.getElementById('langFamily').value,
        email:  document.getElementById('langEmail').value
    };
    if (!data.name || !data.region) { alert('Please fill in all required fields'); return; }
    alert('Thank you! Your language submission has been received and will be reviewed.');
    closeModal('submitLanguage');
    document.getElementById('langName').value   = '';
    document.getElementById('langRegion').value = '';
}

// ── CSV Export ─────────────────────────────────────────────────────────────────
function downloadCSV() {
    const rows = [['Language','Title','URL','Type','Has Sitemap','Quality']];
    getFullList().forEach(lang => {
        (lang.items || []).forEach(r => {
            rows.push([lang.name, r.title, r.url, r.type || '', r.hasSitemap ? 'Yes' : 'No', r.quality || '']);
        });
    });
    const csv  = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement('a'), { href: url, download: 'endangered_languages_resources.csv' });
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function esc(s)  { return s.replace(/'/g, "\\'"); }
function slug(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-'); }

// Close any modal on backdrop click
window.addEventListener('click', e => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});

// ── Init ───────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    updateStats();
    renderLanguages();
});
