# How We Built an Endangered Indian Languages Archive Using AI Subagents

*A behind-the-scenes look at the full development journey — from a blank terminal to a 746-resource database covering 143 endangered languages.*

---

## The Problem

India has over 19,500 languages and dialects. Of these, hundreds are critically endangered — spoken by a few hundred elders in remote villages, undocumented, unfunded, and disappearing at an accelerating rate. The Government of India's Press Information Bureau (PIB) identified 117 such languages through the SPPEL (Scheme for Protection and Preservation of Endangered Languages) programme. UNESCO's Atlas of the World's Languages in Danger adds dozens more.

The problem wasn't awareness. It was **discoverability**. Researchers, linguists, and activists had no single place to find digital resources — PDFs, YouTube videos, audio recordings, grammar books, government schemes, academic papers — for these languages in one place.

This project set out to build that place.

---

## The Architecture: Subagents All the Way Down

The system wasn't built as a monolithic script. It was designed as a **network of specialized subagents**, each with a clear responsibility, collaborating through structured data pipelines.

Here's the full agent map:

```
┌─────────────────────────────────────────────────┐
│              Orchestrator (Claude Code)          │
│   - Plans iteration cycles                       │
│   - Coordinates agent invocations               │
│   - Reviews outputs and decides next steps       │
└──────────────────┬──────────────────────────────┘
                   │
       ┌───────────┼───────────┐
       ▼           ▼           ▼
  [Discovery]  [Validator]  [Frontend]
   Agent        Agent        Agent
```

Each "agent" was a specialized Python class or module — invoked, checked, iterated, and improved across multiple generations.

---

## Generation 1: The Naive Crawler (`discovery_agent.py`)

The first agent was straightforward: take a language name, search DuckDuckGo, return URLs. No filtering, no scoring, no sitemap detection.

It quickly ran into the first problem: **DuckDuckGo's redirect URLs**.

```
→ //duckduckgo.com/l/?uddg=https%3A%2F%2Fwww.youtube...
  ✗ Sitemap
```

Every result came back as a DDG redirect URL, not the actual destination. The agent was effectively blind — it was cataloguing DuckDuckGo's redirect layer, not real web content. The `discovery_run.log` shows this clearly: 5 languages processed, 59 resources found, **0 sitemaps detected**.

The lesson: **don't trust the surface. Follow through to the real URL.**

---

## Generation 2: URL Resolution + Sitemap Detection (`discovery_agent_v2.py`)

The second agent added two key capabilities:

1. **URL resolution** — follow DDG redirects to the actual destination
2. **Sitemap detection** — check every discovered domain for a `sitemap.xml`

This was a significant architectural shift. The agent now needed to make *two* HTTP requests per result: one to resolve the redirect, one to check the sitemap. Processing slowed down, but quality went up dramatically.

Running against the same 5 languages from Gen 1, the `discovery_run_v3.log` shows the difference:

```
🔍 Aimol — 12 total, 4 with sitemaps
🔍 Birhor — 11 total, 7 with sitemaps
🔍 Jarawa — 11 total, 7 with sitemaps
```

Sitemap detection mattered because sitemaps are a signal of **structured, maintained web content** — the kind of resource a researcher can rely on over time.

---

## Generation 3: Semantic Validation + Content Filtering (`agent_v3.py`)

Crawling 143 languages across 5+ search patterns each creates a lot of noise. The third generation introduced two new subagent-style components:

### The `ContentFilter` Agent

A simple rule-based filter with:
- A hardcoded blocklist of adult domains
- Keyword pattern matching (`porn`, `xxx`, `nude`) with a linguistic override whitelist
- Applied as a gate — any URL failing this check is immediately rejected

```python
class ContentFilter:
    ADULT_DOMAINS = {'pornhub.com', 'xvideos.com', ...}

    def validate(self, url, title=""):
        domain = urlparse(url).netloc.lower()
        if domain in self.ADULT_DOMAINS:
            return False, "adult_domain"
        ...
        return True, "safe"
```

Zero adult URLs made it through during the entire production run. (Confirmed in `discovery_report_full.txt`: **"URLs Rejected: 0"**.)

### The `SemanticValidator` Agent

The more interesting component. Each candidate URL gets a **relevance score** from 0.0 to 1.0:

```python
def validate(self, language, title, url):
    score = 0.0
    if language.lower() in text: score += 0.4
    for ctx in self.CONTEXTS.get(language, []): score += 0.15
    for term in ['dictionary', 'grammar', 'archive']: score += 0.1
    if '.edu' or '.ac.in' or '.gov.in' in url: score += 0.2
    return score >= 0.3, min(score, 1.0)
```

URLs scoring below 0.3 were flagged as `LOW RELEVANCE` but still kept in the database (marked with a warning flag) to avoid false negatives on obscure languages with few resources.

---

## Generation 4: Production Scale (`agent_v4_production.py` → `agent_final.py`)

With the architecture proven, the final agent scaled up to **143 languages** with:

- **20+ search patterns per language** — covering PDFs, dictionaries, tutorials, YouTube channels, government schemes, UNESCO resources, Glottolog, Ethnologue, CIIL/SPPEL portals, audio recordings, Bible translations, folk songs, and more
- **Checkpoint saving every 3 languages** — so a network failure at language #82 didn't wipe out #1–81
- **Deduplication by URL hash** — no double-counting
- **CSV export** — machine-readable output for downstream use

The `discovery_v4.log` shows the checkpoint system in action:

```
💾 Checkpoint saved (3/10)
💾 Checkpoint saved (6/10)
💾 Checkpoint saved (9/10)
```

---

## The Orchestrator: Claude Code as Meta-Agent

The overall system wasn't just the Python agents. **Claude Code itself acted as the top-level orchestrator** — reviewing logs, identifying failures, proposing architectural improvements, writing new agent versions, and coordinating the multi-step build process.

This is what a real multi-agent workflow looks like in practice:

1. **Claude inspects the log** → spots the DDG redirect problem
2. **Claude spawns an Explore subagent** → searches the codebase for URL handling code
3. **Claude writes a fix** → resolution loop added to the crawler
4. **Claude runs the agent** → checks new log output
5. **Claude identifies the next bottleneck** → no content filtering, noise in results
6. **Repeat**

Each generation of the agent was a response to a concrete failure mode, not a speculative improvement. This is the key discipline of subagent-driven development: **let the output tell you what to build next**.

---

## Final Results

After four agent generations across multiple processing runs:

| Metric | Value |
|--------|-------|
| Languages Catalogued | 143 |
| Digital Resources Found | 746+ |
| Sites with Sitemaps | 280 (37%) |
| Adult Content Blocked | 0 slipped through |
| Search Patterns Per Language | 20+ |
| Data Sources | PIB, UNESCO, CIIL, Ethnologue, Glottolog, Archive.org |

### Languages Covered

**Critically Endangered:** Aimol, Baghati, Bangani, Bellari, Birhor, Gadaba, Jarawa, Koraga, Kota, Kuruba, Onge, Toda, Sentinelese, Purum, Toto

**Definitely Endangered:** Spiti, Jad, Darmiya, Gahri, Kanashi, Tangam, Byangsi, Nihali, Diwehi, Bhala, Jenu Kurumba, Kalanadi

**Vulnerable (100+):** Full list in `complete_language_list.txt`

---

## The Frontend

While the agents ran, a parallel effort built the **web frontend** — a static HTML/JS site with:

- A searchable language cards dashboard
- Statistics overview (resources per language, sitemap coverage)
- Community submission forms (new resources, new languages)
- CSV download for researchers
- Three dashboard iterations (`language_dashboard.html`, `language_dashboard_final.html`, `language_dashboard_pro.html`) before settling on a clean, professional design in `index.html`

---

## What's Next

The archive is live but incomplete. 60+ languages still need resource discovery passes. The submission pipeline needs a backend. The databases need merging (legacy 82-language DB + new 143-language DB).

But the foundation is solid: a repeatable, filterable, versioned agent pipeline that can process any language with a few keystrokes.

If you want to run it yourself:

```bash
cd /home/exedev/analytics/languages
python3 agent_final.py
```

Or target a specific language batch:

```python
from agent_final import LanguageDiscoveryAgent

agent = LanguageDiscoveryAgent()
for lang in agent.LANGUAGES[80:100]:
    result = agent.discover(lang, max_patterns=20)
    agent.db["languages"][lang] = result
    agent.save_db()
```

---

## Why This Matters

Every month, another elder dies. Another language loses its last fluent speaker. The window for documentation is closing.

This project doesn't claim to stop that. But it makes the existing digital record — scattered across academic servers, YouTube channels, government portals, and archive.org — **findable**. That's the first step.

The subagent approach made it possible to build fast, fail safely, and improve systematically. Each generation of the agent was smarter than the last because we let the logs tell us where it was wrong.

That's how you build something real.

---

*Project: Endangered Indian Languages Archive v5.0*
*Repo: [github.com/ankitjh4/endangered-indian-languages](https://github.com/ankitjh4/endangered-indian-languages)*
*Generated: 2026-03-03*
