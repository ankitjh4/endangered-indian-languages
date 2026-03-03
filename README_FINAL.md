# Endangered Indian Languages Archive v5.0

**Complete digital resource discovery system for 143+ endangered and vulnerable Indian languages.**

---

## Overview

This is the main website and discovery system for documenting endangered Indian languages. It features:

- **143 Languages** from PIB, UNESCO, CIIL/SPPEL documentation
- **Adult Content Filtering** (3-layer system)
- **Semantic Validation** for relevance
- **Community Submission** system
- **CSV Export** functionality
- **Professional UI** (non-vibe-coded)

---

## Data Sources

### Primary Sources
1. **PIB (Press Information Bureau)** - 117 endangered languages identified by SPPEL
   - Source: https://www.pib.gov.in/FeaturesDeatils.aspx?NoteId=155013
   
2. **UNESCO Atlas of the World's Languages in Danger**

3. **CIIL (Central Institute of Indian Languages)** - Sanchika Portal
   - https://sanchika.ciil.org

4. **Ethnologue & Glottolog** - Linguistic databases

5. **Internet Archive** - Historical documentation

### Languages by Zone (from PIB)
| Zone | States | Languages | Examples |
|------|--------|-----------|----------|
| Northern | HP, UK, JK, Punjab | 25 | Spiti, Jad, Darmiya, Kanashi |
| Northeast | 8 states | 43 | Tangam, Sherdukpen, Tarao |
| East Central | UP, Bihar, WB, Odisha | 15 | Bhunjia, Birhor, Bondo, Toto |
| West Central | Gujarat, Maharashtra | 5 | Nihali, Baradi, Bharwad |
| Southern | 5 states | 20 | Toda, Soliga, Jenu Kurumba, Siddi |
| Andaman & Nicobar | Islands | 9 | Sentinelese, Onge, Shompen, Jarawa |

---

## Website Features

### Main Page (`index.html`)
- Clean, professional design
- Statistics dashboard
- Search functionality
- Language cards with resources

### Submit Resource
- Form to submit new resources for existing languages
- Fields: Language, Title, URL, Email
- Submissions stored for verification

### Submit New Language
- Form to add languages not in database
- Fields: Name, Region, Family, Email
- Review process for verification

### Download CSV
- Exports all resources to CSV format
- Columns: Language, Title, URL, Type, Has Sitemap, Relevance Score

---

## Enriched Search Keywords

The discovery agent uses 20+ search patterns per language:

```
{lang} language dictionary pdf
{lang} language endangered internet archive
{lang} language ethnologue
{lang} language grammar documentation
{lang} language CIIL SPPEL
{lang} language youtube tutorial
{lang} language government scheme
{lang} language UNESCO endangered
{lang} language glottolog
{lang} language research paper
{lang} language linguistic documentation
{lang} language community forum
{lang} language learning resources
{lang} language audio recordings
{lang} language bible translation
{lang} language folk songs stories
{lang} language trilingual dictionary
{lang} language primer textbook
{lang} language script orthography
{lang} language revitalization project
```

---

## File Structure

```
/home/exedev/analytics/languages/
├── index.html                      # Main website
├── app.js                          # Frontend JavaScript
├── language_data.js                # Language data (embedded JS)
├── language_dashboard.html         # Dashboard HTML (full)
├── language_dashboard_final.html   # Final dashboard
├── language_dashboard_pro.html     # Pro dashboard
├── agent_final.py                  # Discovery agent (143 languages) ← USE THIS
├── agent_v3.py                     # Agent v3 (legacy)
├── agent_v4_production.py          # Agent v4 production (legacy)
├── discovery_agent.py              # Discovery agent v1 (legacy)
├── discovery_agent_v2.py           # Discovery agent v2 (legacy)
├── language_db.json                # Legacy database (82 languages, 746 resources)
├── language_db_v4.json             # V4 database
├── language_discovery_db.json      # Discovery database
├── language_resources.json         # Resources JSON
├── complete_language_list.txt      # 143 languages from PIB/UNESCO
├── decoded_results.json            # Decoded discovery results
├── discovery_report.txt            # Discovery report
├── discovery_report_full.txt       # Full discovery report
├── language_resources_report.txt   # Resources report
├── language_discovery_report.txt   # Discovery report (v1)
├── language_discovery_report_v4.md # V4 discovery report
├── discovery_run.log               # Discovery run log
├── discovery_run_v3.log            # V3 run log
├── discovery_v4.log                # V4 run log
└── README_FINAL.md                 # This file
```

---

## Running the System

### Start Web Server
```bash
cd /home/exedev/analytics/languages
python3 -m http.server 8080
```

### Access Website
```
http://localhost:8080
```

### Run Discovery Agent
```bash
# Basic run
python3 agent_final.py

# With enriched keywords
python3 -c "
from agent_final import LanguageDiscoveryAgent
agent = LanguageDiscoveryAgent()
agent.discover('Bodo', max_patterns=20)
"
```

---

## Language Coverage (143 Total)

### Critically Endangered (15)
Aimol, Baghati, Bangani, Bellari, Birhor, Gadaba, Jarawa, Koraga, Kota, Kuruba, Onge, Toda, Purum, Sentinelese, Luro, Toto

### Definitely Endangered (25+)
Spiti, Jad, Darmiya, Gahri, Kanashi, Tangam, Byangsi, Chaudangsi, Nihali, Diwehi, Bhala, Jenu Kurumba, Aranadan, Kalanadi, Kunduvadi

### Vulnerable (100+)
[Full list in complete_language_list.txt]

### Additional Languages Added
- Rokdung
- Gurung
- Bhujel
- Roman Sherpa
- Sambhota Sherpa
- Magar
- And 40+ more from PIB documentation

---

## For Next LLM

### Tasks to Complete
1. **Merge Databases**: Combine legacy (82 langs) with new format (143 langs)
2. **Process Remaining Languages**: 60+ languages need resource discovery
3. **Implement Backend**: Add server-side submission handling
4. **Add Authentication**: Verify community submissions
5. **API Integration**: Add Twitter/X, YouTube APIs for social resources

### Quick Start
```python
from agent_final import LanguageDiscoveryAgent

agent = LanguageDiscoveryAgent()

# Process a batch of languages
for lang in agent.LANGUAGES[80:100]:  # Next 20
    result = agent.discover(lang, max_patterns=20)
    agent.db["languages"][lang] = result
    agent.save_db()

# Export to CSV
agent.export_csv()
```

### Adding More Search Keywords
Edit `SEARCH_PATTERNS` in `agent_final.py`:
```python
SEARCH_PATTERNS = [
    "{lang} language dictionary pdf",
    "{lang} language endangered internet archive",
    # Add more patterns here
]
```

---

## Statistics

| Metric | Value |
|--------|-------|
| Languages Cataloged | 143 |
| Digital Resources | 746+ |
| Sites with Sitemaps | 280 (37%) |
| Adult Content Blocked | Active |
| Search Patterns | 20 per language |

---

## License & Attribution

Research and Educational Use - Endangered Language Documentation

Data Sources:
- PIB (Press Information Bureau), Government of India
- UNESCO Atlas of the World's Languages in Danger
- CIIL/SPPEL (Central Institute of Indian Languages)
- Ethnologue (SIL International)
- Glottolog (Max Planck Institute)

---

*Generated: 2026-03-02 | Version: 5.0.0 | Languages: 143*
