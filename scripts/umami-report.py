#!/usr/bin/env python3
"""
Génère un rapport HTML d'analytics à partir d'un export CSV Umami.
La sortie imite la disposition du dashboard Umami Cloud.

Usage:
    python3 umami-report.py <input_csv> <output_html>
"""

import csv
import sys
import html
import json
from collections import Counter, defaultdict
from datetime import datetime, timedelta
from pathlib import Path

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def parse_csv(filepath):
    with open(filepath, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        return list(reader)


def format_duration(seconds):
    if seconds is None:
        return '0s'
    seconds = int(seconds)
    if seconds < 60:
        return f'{seconds}s'
    minutes = seconds // 60
    secs = seconds % 60
    if minutes < 60:
        return f'{minutes}m {secs}s'
    hours = minutes // 60
    mins = minutes % 60
    return f'{hours}h {mins}m'


def country_name(code):
    names = {
        'FR': 'France', 'DE': 'Allemagne', 'US': 'États-Unis', 'BE': 'Belgique',
        'SG': 'Singapour', 'GR': 'Grèce', 'FI': 'Finlande', 'GB': 'Royaume-Uni',
        'ES': 'Espagne', 'IT': 'Italie', 'NL': 'Pays-Bas', 'PT': 'Portugal',
        'CH': 'Suisse', 'CA': 'Canada', 'AU': 'Australie', 'JP': 'Japon',
        'BR': 'Brésil', 'CN': 'Chine', 'IN': 'Inde', 'RU': 'Russie',
        'PL': 'Pologne', 'SE': 'Suède', 'NO': 'Norvège', 'DK': 'Danemark',
        'IE': 'Irlande', 'AT': 'Autriche', 'CZ': 'Tchéquie', 'RO': 'Roumanie',
        'HU': 'Hongrie', 'BG': 'Bulgarie', 'HR': 'Croatie', 'SK': 'Slovaquie',
        'SI': 'Slovénie', 'EE': 'Estonie', 'LV': 'Lettonie', 'LT': 'Lituanie',
        'LU': 'Luxembourg', 'MT': 'Malte', 'CY': 'Chypre', 'IS': 'Islande',
        'TR': 'Turquie', 'UA': 'Ukraine', 'RS': 'Serbie', 'MX': 'Mexique',
        'AR': 'Argentine', 'CL': 'Chili', 'CO': 'Colombie', 'ZA': 'Afrique du Sud',
        'AE': 'Émirats arabes unis', 'SA': 'Arabie saoudite', 'TH': 'Thaïlande',
        'KR': 'Corée du Sud', 'TW': 'Taïwan', 'HK': 'Hong Kong', 'PH': 'Philippines',
        'VN': 'Vietnam', 'ID': 'Indonésie', 'MY': 'Malaisie', 'NZ': 'Nouvelle-Zélande',
        'IR': 'Iran', 'FA': 'Iran',
    }
    return names.get(code, code)


def browser_name(code):
    names = {
        'chrome': 'Chrome', 'firefox': 'Firefox', 'safari': 'Safari',
        'edge-chromium': 'Edge (Chromium)', 'edge': 'Edge',
        'opera': 'Opera', 'samsung': 'Samsung', 'ios': 'iOS',
        'ios-webview': 'iOS (webview)', 'crios': 'Chrome (iOS)',
        'facebook': 'Facebook', 'ucbrowser': 'UC Browser',
        'yandexbrowser': 'Yandex', 'vivaldi': 'Vivaldi',
        'brave': 'Brave', 'chromium': 'Chromium',
    }
    return names.get(code, code.capitalize() if code else 'Inconnu')


def os_name(code):
    names = {
        'Android OS': 'Android', 'Windows 10': 'Windows', 'Windows 11': 'Windows',
        'Windows 7': 'Windows 7', 'Linux': 'Linux', 'iOS': 'iOS',
        'Mac OS': 'macOS', 'Chrome OS': 'Chrome OS', 'Ubuntu': 'Linux',
        'Fedora': 'Linux', 'Debian': 'Linux', 'Arch': 'Linux',
    }
    return names.get(code, code or 'Inconnu')


def device_name(code):
    return {'mobile': 'Mobile', 'laptop': 'Portable', 'desktop': 'Ordinateur', 'tablet': 'Tablette'}.get(code, code or 'Inconnu')


def region_name(code):
    names = {
        'FR-IDF': 'Île-de-France', 'FR-BRE': 'Bretagne', 'FR-NOR': 'Normandie',
        'FR-HDF': 'Hauts-de-France', 'FR-GES': 'Grand Est', 'FR-PDL': 'Pays de la Loire',
        'FR-ARA': 'Auvergne-Rhône-Alpes', 'FR-OCC': 'Occitanie', 'FR-NAQ': 'Nouvelle-Aquitaine',
        'FR-BFC': 'Bourgogne-Franche-Comté', 'FR-CVL': 'Centre-Val de Loire',
        'FR-COR': 'Corse', 'FR-PAC': "Provence-Alpes-Côte d'Azur", 'FR-OCC': 'Occitanie',
        'FR-LRE': 'La Réunion', 'FR-GUA': 'Guadeloupe', 'FR-MQ': 'Martinique',
        'FR-GF': 'Guyane', 'FR-YT': 'Mayotte',
        'DE-BE': 'Berlin', 'DE-BY': 'Bavière', 'DE-HB': 'Brême', 'DE-HH': 'Hambourg',
        'DE-HE': 'Hesse', 'DE-NI': 'Basse-Saxe', 'DE-NW': 'Rhénanie-du-Nord-Westphalie',
        'DE-RP': 'Rhénanie-Palatinat', 'DE-SN': 'Saxe', 'DE-ST': 'Saxe-Anhalt',
        'DE-SH': 'Schleswig-Holstein', 'DE-TH': 'Thuringe', 'DE-BW': 'Bade-Wurtemberg',
        'DE-BB': 'Brandebourg', 'DE-MV': 'Mecklembourg-Poméranie-Occidentale',
        'DE-SL': 'Sarre',
        'BE-BRU': 'Bruxelles', 'BE-VLG': 'Flandre', 'BE-WAL': 'Wallonie',
        'US-CA': 'Californie', 'US-NY': 'New York', 'US-TX': 'Texas', 'US-FL': 'Floride',
        'US-IL': 'Illinois', 'US-PA': 'Pennsylvanie', 'US-OH': 'Ohio', 'US-GA': 'Géorgie',
        'US-NC': 'Caroline du Nord', 'US-MI': 'Michigan', 'US-NJ': 'New Jersey',
        'US-VA': 'Virginie', 'US-WA': 'Washington', 'US-AZ': 'Arizona', 'US-MA': 'Massachusetts',
        'US-TN': 'Tennessee', 'US-IN': 'Indiana', 'US-MO': 'Missouri', 'US-MD': 'Maryland',
        'US-WI': 'Wisconsin', 'US-CO': 'Colorado', 'US-MN': 'Minnesota', 'US-OR': 'Oregon',
        'US-NV': 'Nevada', 'US-UT': 'Utah', 'US-OK': 'Oklahoma', 'US-CT': 'Connecticut',
        'US-IA': 'Iowa', 'US-AR': 'Arkansas', 'US-LA': 'Louisiane', 'US-KY': 'Kentucky',
        'US-AL': 'Alabama', 'US-SC': 'Caroline du Sud', 'US-KS': 'Kansas', 'US-NM': 'Nouveau-Mexique',
        'US-NE': 'Nebraska', 'US-WV': 'Virginie-Occidentale', 'US-ID': 'Idaho',
        'US-HI': 'Hawaï', 'US-NH': 'New Hampshire', 'US-ME': 'Maine', 'US-MT': 'Montana',
        'US-RI': 'Rhode Island', 'US-DE': 'Delaware', 'US-SD': 'Dakota du Sud',
        'US-ND': 'Dakota du Nord', 'US-AK': 'Alaska', 'US-VT': 'Vermont', 'US-WY': 'Wyoming',
        'US-DC': 'District de Columbia',
        'GB-ENG': 'Angleterre', 'GB-SCT': 'Écosse', 'GB-WLS': 'Pays de Galles', 'GB-NIR': 'Irlande du Nord',
        'IT-52': 'Toscane', 'IT-25': 'Lombardie', 'IT-62': 'Lazio', 'IT-72': 'Campanie',
        'IT-88': 'Sardaigne', 'IT-82': 'Sicile', 'IT-36': 'Ligurie', 'IT-42': 'Marches',
        'IT-45': 'Émilie-Romagne', 'IT-08': 'Émilie-Romagne', 'IT-57': 'Ligurie',
        'ES-MD': 'Madrid', 'ES-CT': 'Catalogne', 'ES-AN': 'Andalousie', 'ES-PV': 'Pays basque',
        'ES-GA': 'Galice', 'ES-VC': 'Communauté valencienne', 'ES-AR': 'Aragon',
        'NL-NH': 'Hollande-Septentrionale', 'NL-ZH': 'Hollande-Méridionale',
        'NL-UT': 'Utrecht', 'NL-GE': 'Gelderland', 'NL-NB': 'Brabant-Septentrional',
        'CH-GE': 'Genève', 'CH-VD': 'Vaud', 'CH-ZH': 'Zurich', 'CH-BE': 'Berne',
        'CH-BS': 'Bâle-Ville', 'CH-BL': 'Bâle-Campagne', 'CH-TI': 'Tessin', 'CH-VS': 'Valais',
        'SG-01': 'Singapour Central',
    }
    return names.get(code, code or 'Inconnu')


def language_name(code):
    if not code:
        return 'Inconnu'
    # Language code can be like "fr", "fr-FR", "en-US", etc.
    parts = code.split('-')
    lang = parts[0].lower()
    region = parts[1].upper() if len(parts) > 1 else None

    lang_names = {
        'fr': 'Français', 'en': 'Anglais', 'de': 'Allemand', 'es': 'Espagnol',
        'it': 'Italien', 'pt': 'Portugais', 'nl': 'Néerlandais', 'ru': 'Russe',
        'pl': 'Polonais', 'sv': 'Suédois', 'no': 'Norvégien', 'da': 'Danois',
        'fi': 'Finnois', 'cs': 'Tchèque', 'ro': 'Roumain', 'hu': 'Hongrois',
        'el': 'Grec', 'tr': 'Turc', 'ar': 'Arabe', 'he': 'Hébreu',
        'ja': 'Japonais', 'ko': 'Coréen', 'zh': 'Chinois', 'th': 'Thaï',
        'vi': 'Vietnamien', 'id': 'Indonésien', 'ms': 'Malais', 'hi': 'Hindi',
        'bn': 'Bengali', 'fa': 'Persan', 'ur': 'Ourdou', 'ta': 'Tamoul',
        'uk': 'Ukrainien', 'bg': 'Bulgare', 'hr': 'Croate', 'sk': 'Slovaque',
        'sl': 'Slovène', 'lt': 'Lituanien', 'lv': 'Letton', 'et': 'Estonien',
        'is': 'Islandais', 'ga': 'Irlandais', 'cy': 'Gallois', 'eu': 'Basque',
        'ca': 'Catalan', 'gl': 'Galicien', 'mt': 'Maltais', 'mk': 'Macédonien',
        'sr': 'Serbe', 'sq': 'Albanais', 'az': 'Azerbaïdjanais', 'kk': 'Kazakh',
        'uz': 'Ouzbek', 'ky': 'Kirghiz', 'tg': 'Tadjik', 'tk': 'Turkmène',
        'mn': 'Mongol', 'my': 'Birman', 'km': 'Khmer', 'lo': 'Lao',
    }

    region_suffixes = {
        'FR': 'France', 'BE': 'Belgique', 'CA': 'Canada', 'CH': 'Suisse',
        'US': 'États-Unis', 'GB': 'Royaume-Uni', 'AU': 'Australie',
        'DE': 'Allemagne', 'AT': 'Autriche', 'IT': 'Italie', 'ES': 'Espagne',
        'PT': 'Portugal', 'NL': 'Pays-Bas', 'LU': 'Luxembourg',
        'MC': 'Monaco', 'MA': 'Maroc', 'DZ': 'Algérie', 'TN': 'Tunisie',
        'SN': 'Sénégal', 'CI': "Côte d'Ivoire", 'CM': 'Cameroun',
        'ML': 'Mali', 'BF': 'Burkina Faso', 'GN': 'Guinée', 'BJ': 'Bénin',
        'TG': 'Togo', 'CD': 'RD Congo', 'CG': 'Congo', 'GA': 'Gabon',
        'HT': 'Haïti', 'MG': 'Madagascar', 'RE': 'La Réunion',
        'CN': 'Chine', 'TW': 'Taïwan', 'HK': 'Hong Kong', 'SG': 'Singapour',
        'IN': 'Inde', 'PK': 'Pakistan', 'BD': 'Bangladesh', 'LK': 'Sri Lanka',
        'NP': 'Népal', 'BT': 'Bhoutan', 'MY': 'Malaisie', 'ID': 'Indonésie',
        'PH': 'Philippines', 'VN': 'Vietnam', 'TH': 'Thaïlande', 'LA': 'Laos',
        'KH': 'Cambodge', 'MM': 'Myanmar', 'KR': 'Corée du Sud', 'KP': 'Corée du Nord',
        'JP': 'Japon', 'MN': 'Mongolie', 'KZ': 'Kazakhstan', 'UZ': 'Ouzbékistan',
        'TR': 'Turquie', 'IR': 'Iran', 'IQ': 'Irak', 'SA': 'Arabie saoudite',
        'AE': 'Émirats arabes unis', 'EG': 'Égypte', 'LY': 'Libye',
        'BR': 'Brésil', 'PT': 'Portugal', 'AO': 'Angola', 'MZ': 'Mozambique',
        'MX': 'Mexique', 'CO': 'Colombie', 'AR': 'Argentine', 'CL': 'Chili',
        'PE': 'Pérou', 'VE': 'Venezuela', 'BO': 'Bolivie', 'EC': 'Équateur',
        'PY': 'Paraguay', 'UY': 'Uruguay', 'PR': 'Porto Rico', 'DO': 'République dominicaine',
        'CU': 'Cuba', 'GT': 'Guatemala', 'HN': 'Honduras', 'NI': 'Nicaragua',
        'PA': 'Panama', 'CR': 'Costa Rica', 'SV': 'Salvador', 'GQ': 'Guinée équatoriale',
        '419': 'Amérique latine', 'GB': 'Royaume-Uni',
    }

    base = lang_names.get(lang, lang.upper())
    if region and region in region_suffixes:
        # For French, use "France métropolitaine" for fr-FR
        if lang == 'fr' and region == 'FR':
            return f'{base} (Métropole)'
        return f'{base} ({region_suffixes[region]})'
    return base


def esc(value):
    return html.escape(str(value)) if value else ''


def bar_row(label, count, total, color='#2680eb'):
    percent = round(count / total * 100) if total > 0 else 0
    return f'''<div class="bar-row">
  <div class="bar-label" title="{esc(label)}">{esc(label)}</div>
  <div class="bar-track"><div class="bar-fill" style="width:{percent}%;background:{color}"></div></div>
  <div class="bar-count">{count}</div>
  <div class="bar-pct">{percent}%</div>
</div>'''


def table_section(title, rows_html, tooltip=''):
    tooltip_attr = f' data-tooltip="{esc(tooltip)}"' if tooltip else ''
    return f'''<div class="card section-card">
  <div class="section-header">
    <h2{tooltip_attr}>{title}</h2>
  </div>
  <div class="bar-list">{rows_html}</div>
</div>'''


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def generate_report(csv_path, output_path):
    rows = parse_csv(csv_path)

    # Parse all dates upfront for filtering
    for r in rows:
        try:
            r['_dt'] = datetime.fromisoformat(r['created_at'])
        except (ValueError, TypeError):
            r['_dt'] = None

    # Determine full date range from data
    valid_dates = [r['_dt'] for r in rows if r['_dt']]
    if valid_dates:
        data_start = min(valid_dates).date()
        data_end = max(valid_dates).date()
    else:
        data_start = datetime.now().date()
        data_end = datetime.now().date()

    # --- KPIs ---
    sessions = set(r['session_id'] for r in rows)
    visits = set(r['visit_id'] for r in rows)
    total_views = len(rows)

    # Bounce rate: sessions with only 1 view
    session_views = Counter(r['session_id'] for r in rows)
    bounced = sum(1 for v in session_views.values() if v == 1)
    bounce_rate = round(bounced / len(sessions) * 100) if sessions else 0

    # Average visit duration: time between first and last event per visit
    visit_times = defaultdict(list)
    for r in rows:
        if r['_dt']:
            visit_times[r['visit_id']].append(r['_dt'])
    durations = []
    for vtimes in visit_times.values():
        if len(vtimes) > 1:
            delta = (max(vtimes) - min(vtimes)).total_seconds()
            durations.append(delta)
    avg_duration = sum(durations) / len(durations) if durations else 0

    # --- Time series (daily) ---
    daily_visitors = defaultdict(set)
    daily_views = defaultdict(int)
    for r in rows:
        if r['_dt']:
            day = r['_dt'].date().isoformat()
            daily_visitors[day].add(r['session_id'])
            daily_views[day] += 1

    # Build complete date range
    all_days = []
    d = datetime.combine(data_start, datetime.min.time())
    end = datetime.combine(data_end, datetime.min.time())
    while d <= end:
        all_days.append(d.date().isoformat())
        d += timedelta(days=1)

    chart_visitors = [len(daily_visitors.get(d, set())) for d in all_days]
    chart_views = [daily_views.get(d, 0) for d in all_days]
    max_chart = max(max(chart_visitors, default=1), max(chart_views, default=1))

    # --- Pages ---
    page_visitors = defaultdict(set)
    for r in rows:
        page_visitors[r['url_path']].add(r['session_id'])
    pages_sorted = sorted(page_visitors.items(), key=lambda x: len(x[1]), reverse=True)
    total_visitors = len(sessions)
    pages_html = ''.join(bar_row(path, len(vis), total_visitors) for path, vis in pages_sorted[:10])

    # --- Referrers (exclude self-referrals = internal navigation) ---
    ref_visitors = defaultdict(set)
    for r in rows:
        ref = r['referrer_domain']
        if not ref:
            ref = 'Accès direct'
        # Skip self-referrals (internal navigation, not an external source)
        if ref in ('cmd.bzh', 'www.cmd.bzh'):
            continue
        ref_visitors[ref].add(r['session_id'])
    refs_sorted = sorted(ref_visitors.items(), key=lambda x: len(x[1]), reverse=True)
    # Total = sum of all referrer visitors (each visitor counted once per source)
    ref_total = sum(len(vis) for _, vis in refs_sorted)
    refs_html = ''.join(bar_row(ref, len(vis), ref_total, '#e8a838') for ref, vis in refs_sorted[:10])

    # --- Browsers ---
    browser_visitors = defaultdict(set)
    for r in rows:
        browser_visitors[r['browser']].add(r['session_id'])
    browsers_sorted = sorted(browser_visitors.items(), key=lambda x: len(x[1]), reverse=True)
    browsers_html = ''.join(bar_row(browser_name(b), len(vis), total_visitors, '#8b5cf6') for b, vis in browsers_sorted[:10])

    # --- OS ---
    os_visitors = defaultdict(set)
    for r in rows:
        os_visitors[r['os']].add(r['session_id'])
    os_sorted = sorted(os_visitors.items(), key=lambda x: len(x[1]), reverse=True)
    os_html = ''.join(bar_row(os_name(o), len(vis), total_visitors, '#10b981') for o, vis in os_sorted[:10])

    # --- Devices ---
    device_visitors = defaultdict(set)
    for r in rows:
        device_visitors[r['device']].add(r['session_id'])
    devices_sorted = sorted(device_visitors.items(), key=lambda x: len(x[1]), reverse=True)
    devices_html = ''.join(bar_row(device_name(d), len(vis), total_visitors, '#f59e0b') for d, vis in devices_sorted[:10])

    # --- Countries ---
    country_visitors = defaultdict(set)
    for r in rows:
        if r['country']:
            country_visitors[r['country']].add(r['session_id'])
    countries_sorted = sorted(country_visitors.items(), key=lambda x: len(x[1]), reverse=True)
    countries_html = ''.join(bar_row(country_name(c), len(vis), total_visitors, '#ef4444') for c, vis in countries_sorted[:10])

    # --- Regions (with country) ---
    region_visitors = defaultdict(set)
    region_country = {}
    for r in rows:
        if r['region']:
            region_visitors[r['region']].add(r['session_id'])
            if r['country']:
                region_country[r['region']] = r['country']
    regions_sorted = sorted(region_visitors.items(), key=lambda x: len(x[1]), reverse=True)
    regions_html = ''.join(
        bar_row(
            f'{region_name(r)} ({country_name(region_country.get(r, ""))})' if region_country.get(r) else region_name(r),
            len(vis), total_visitors, '#ec4899'
        ) for r, vis in regions_sorted[:10]
    )

    # --- Cities ---
    city_visitors = defaultdict(set)
    for r in rows:
        if r['city']:
            city_visitors[r['city']].add(r['session_id'])
    cities_sorted = sorted(city_visitors.items(), key=lambda x: len(x[1]), reverse=True)
    cities_html = ''.join(bar_row(c, len(vis), total_visitors, '#6366f1') for c, vis in cities_sorted[:10])

    # --- Languages ---
    lang_visitors = defaultdict(set)
    for r in rows:
        if r['language']:
            lang_visitors[r['language']].add(r['session_id'])
    langs_sorted = sorted(lang_visitors.items(), key=lambda x: len(x[1]), reverse=True)
    langs_html = ''.join(bar_row(language_name(l), len(vis), total_visitors, '#14b8a6') for l, vis in langs_sorted[:10])

    # --- Traffic heatmap (day of week x hour) — count unique visitors like Umami ---
    traffic_grid = defaultdict(set)  # (dow, hour) -> set of session_ids
    for r in rows:
        if r['_dt']:
            dow = r['_dt'].weekday()  # 0=Monday, 6=Sunday
            hour = r['_dt'].hour
            traffic_grid[(dow, hour)].add(r['session_id'])

    traffic_counts = {k: len(v) for k, v in traffic_grid.items()}
    max_traffic = max(traffic_counts.values()) if traffic_counts else 1
    # Days: Mon=0 .. Sun=6, display as Lun..Dim
    day_labels_fr = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
    hour_labels_fr = []
    for h in range(24):
        if h == 0:
            hour_labels_fr.append('0h')
        elif h <= 12:
            hour_labels_fr.append(f'{h}h')
        else:
            hour_labels_fr.append(f'{h}h')

    # Build heatmap grid HTML using CSS grid (columns: hour label + 7 days)
    # Row 0: day headers
    heatmap_grid = '<div class="heatmap-dow-spacer"></div>'
    for d in range(7):
        heatmap_grid += f'<div class="heatmap-dow">{day_labels_fr[d]}</div>'
    # Rows 1-24: hour label + 7 cells
    for hour in range(24):
        heatmap_grid += f'<div class="heatmap-hour">{hour_labels_fr[hour]}</div>'
        for dow in range(7):
            count = traffic_counts.get((dow, hour), 0)
            intensity = (count / max_traffic) if max_traffic > 0 and count > 0 else 0
            scale = max(0.15, intensity) if count > 0 else 0
            heatmap_grid += (
                f'<div class="heatmap-cell-wrapper" title="{day_labels_fr[dow]} {hour_labels_fr[hour]} : {count} vue(s)">'
                f'<div class="heatmap-bg-circle"></div>'
                f'<div class="heatmap-fg-circle" style="--scale:{scale}"></div>'
                f'</div>'
            )

    # --- Build chart bars ---
    # Only show a label every N days to avoid clutter
    num_days = len(all_days)
    if num_days <= 7:
        label_interval = 1
    elif num_days <= 31:
        label_interval = max(1, num_days // 7)
    elif num_days <= 90:
        label_interval = max(1, num_days // 10)
    else:
        label_interval = max(1, num_days // 12)

    # Calculate which interval labels to skip (too close to the last label)
    last_idx = num_days - 1
    last_interval_idx = (last_idx // label_interval) * label_interval  # last regular interval label
    skip_near_end = label_interval > 1 and (last_idx - last_interval_idx) < (label_interval / 2)

    chart_bars = ''
    for i, day in enumerate(all_days):
        v = chart_visitors[i]
        w = chart_views[i]
        v_h = (v / max_chart) * 100 if max_chart else 0
        w_h = (w / max_chart) * 100 if max_chart else 0
        dt = datetime.fromisoformat(day)
        full_label = dt.strftime('%d %b %Y')
        short_label = dt.strftime('%d %b')
        is_last = i == last_idx
        is_interval_label = i % label_interval == 0
        show_label = is_interval_label or is_last
        # Skip interval labels too close to the last label
        if skip_near_end and i == last_interval_idx and not is_last:
            show_label = False
        label_html = f'<div class="chart-label">{short_label}</div>' if show_label else ''
        chart_bars += f'''<div class="chart-bar-group" title="{full_label} : {v} visiteurs, {w} vues">
  <div class="chart-bars">
    <div class="chart-bar visitors" style="height:{v_h}%"></div>
    <div class="chart-bar views" style="height:{w_h}%"></div>
  </div>
  {label_html}
</div>'''

    # --- Date range ---
    date_range_str = f'{data_start.isoformat()} → {data_end.isoformat()}'

    # --- Assemble HTML ---
    html_doc = f'''<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>CMD Breizh — Rapport d'analytics</title>
<style>
  :root {{
    --bg: #f8f9fa;
    --surface: #ffffff;
    --border: #e5e7eb;
    --text: #1f2937;
    --text-muted: #6b7280;
    --primary: #2680eb;
    --radius: 12px;
    --gap: 16px;
  }}
  @media (prefers-color-scheme: dark) {{
    :root {{
      --bg: #0f1115;
      --surface: #1a1d24;
      --border: #2a2d35;
      --text: #e5e7eb;
      --text-muted: #9ca3af;
    }}
  }}
  * {{ margin: 0; padding: 0; box-sizing: border-box; }}
  body {{
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    background: var(--bg);
    color: var(--text);
    line-height: 1.5;
  }}
  .container {{
    max-width: 1320px;
    margin: 0 auto;
    padding: 24px;
  }}

  /* Header */
  .header {{
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24px 0;
    border-bottom: 1px solid var(--border);
    margin-bottom: 24px;
    flex-wrap: wrap;
    gap: 16px;
  }}
  .header-left {{
    display: flex;
    align-items: center;
    gap: 16px;
  }}
  .header h1 {{
    font-size: 28px;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 12px;
  }}
  .header .favicon {{
    width: 24px;
    height: 24px;
    border-radius: 4px;
  }}

  /* Date picker — inline presets + custom calendar */
  .date-picker {{
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }}
  .date-presets {{
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
  }}
  .preset-btn {{
    padding: 6px 14px;
    font-size: 13px;
    font-weight: 500;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--text-muted);
    cursor: pointer;
    transition: all 0.15s;
  }}
  .preset-btn:hover {{
    border-color: var(--primary);
    color: var(--primary);
  }}
  .preset-btn.active {{
    background: var(--primary);
    color: white;
    border-color: var(--primary);
  }}
  /* Custom date selector */
  .date-selector {{
    position: relative;
    display: flex;
    align-items: center;
    gap: 6px;
  }}
  .date-field {{
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    font-size: 13px;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: var(--surface);
    color: var(--text);
    cursor: pointer;
    transition: all 0.15s;
    white-space: nowrap;
  }}
  .date-field:hover {{
    border-color: var(--primary);
  }}
  .date-field .field-label {{
    color: var(--text-muted);
    font-size: 11px;
    font-weight: 600;
  }}
  .date-field .field-value {{
    font-weight: 500;
  }}
  .date-arrow {{
    color: var(--text-muted);
    font-size: 14px;
  }}
  /* Custom calendar popup */
  .calendar-popup {{
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.15);
    padding: 16px;
    z-index: 300;
    display: none;
    width: 320px;
  }}
  .calendar-popup.open {{
    display: block;
  }}
  .calendar-header {{
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }}
  .calendar-title {{
    font-size: 15px;
    font-weight: 600;
  }}
  .calendar-nav {{
    display: flex;
    gap: 4px;
  }}
  .calendar-nav-btn {{
    width: 28px;
    height: 28px;
    border: 1px solid var(--border);
    border-radius: 6px;
    background: var(--surface);
    color: var(--text);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    transition: all 0.15s;
  }}
  .calendar-nav-btn:hover {{
    border-color: var(--primary);
    color: var(--primary);
  }}
  .calendar-grid {{
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 2px;
  }}
  .calendar-dow {{
    text-align: center;
    font-size: 11px;
    font-weight: 600;
    color: var(--text-muted);
    padding: 4px 0;
  }}
  .calendar-day {{
    text-align: center;
    font-size: 13px;
    padding: 6px 0;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.1s;
    user-select: none;
  }}
  .calendar-day:hover {{
    background: var(--bg);
  }}
  .calendar-day.other-month {{
    color: var(--text-muted);
    opacity: 0.4;
  }}
  .calendar-day.today {{
    font-weight: 700;
    color: var(--primary);
  }}
  .calendar-day.selected {{
    background: var(--primary);
    color: white;
    font-weight: 600;
  }}
  .calendar-day.in-range {{
    background: rgba(38, 128, 235, 0.15);
  }}
  .calendar-day.disabled {{
    color: var(--text-muted);
    opacity: 0.3;
    cursor: not-allowed;
  }}
  .calendar-footer {{
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid var(--border);
  }}
  .calendar-btn {{
    padding: 6px 16px;
    font-size: 13px;
    font-weight: 500;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    transition: all 0.15s;
  }}
  .calendar-btn.cancel {{
    background: transparent;
    color: var(--text-muted);
  }}
  .calendar-btn.cancel:hover {{
    background: var(--bg);
  }}
  .calendar-btn.apply {{
    background: var(--primary);
    color: white;
  }}
  .calendar-btn.apply:hover {{
    opacity: 0.9;
  }}

  /* KPI cards */
  .kpi-grid {{
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--gap);
    margin-bottom: var(--gap);
  }}
  .kpi-card {{
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    position: relative;
  }}
  .kpi-label {{
    font-size: 16px;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 6px;
    width: fit-content;
    max-width: 100%;
  }}
  .kpi-value {{
    font-size: 36px;
    font-weight: 700;
    white-space: nowrap;
  }}

  /* Tooltip */
  [data-tooltip] {{
    position: relative;
    cursor: help;
    border-bottom: 1px dashed var(--text-muted);
    width: fit-content;
  }}
  .tooltip-popup {{
    position: fixed;
    background: #1f2937;
    color: #fff;
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 400;
    white-space: normal;
    width: max-content;
    max-width: 280px;
    text-align: center;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s;
    z-index: 9999;
    line-height: 1.4;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }}
  .tooltip-popup.visible {{
    opacity: 1;
  }}

  /* Chart card */
  .chart-card {{
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 24px;
    margin-bottom: var(--gap);
  }}
  .chart-container {{
    display: flex;
    flex-direction: column;
    gap: 24px;
  }}
  .chart-area {{
    height: 400px;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 1px;
    padding-bottom: 40px;
    border-bottom: 1px solid var(--border);
    overflow: hidden;
  }}
  .chart-bar-group {{
    flex: 1;
    min-width: 6px;
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
    position: relative;
  }}
  .chart-bars {{
    display: flex;
    gap: 2px;
    align-items: flex-end;
    height: 100%;
    width: 100%;
    justify-content: center;
  }}
  .chart-bar {{
    width: 6px;
    min-height: 2px;
    border-radius: 3px 3px 0 0;
    transition: height 0.3s ease;
  }}
  .chart-bar.visitors {{
    background: rgba(38, 128, 235, 0.8);
  }}
  .chart-bar.views {{
    background: rgba(38, 128, 235, 0.4);
  }}
  .chart-label {{
    position: absolute;
    bottom: -28px;
    font-size: 11px;
    color: var(--text-muted);
    white-space: nowrap;
    left: 50%;
    transform: translateX(-50%);
  }}
  .chart-bar-group:last-child .chart-label {{
    left: auto;
    right: 0;
    transform: none;
  }}
  .chart-bar-group:first-child .chart-label {{
    left: 0;
    transform: none;
  }}
  .chart-legend {{
    display: flex;
    justify-content: center;
    gap: 24px;
    flex-wrap: wrap;
  }}
  .legend-item {{
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
  }}
  .legend-dot {{
    width: 12px;
    height: 12px;
    border-radius: 50%;
  }}

  /* Section grid — 2 columns on desktop */
  .section-grid {{
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--gap);
    margin-bottom: var(--gap);
  }}
  @media (min-width: 768px) {{
    .section-grid {{
      grid-template-columns: repeat(2, 1fr);
    }}
  }}

  /* Section card */
  .card {{
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 24px;
  }}
  .section-card {{
    display: flex;
    flex-direction: column;
    gap: var(--gap);
  }}
  .section-header {{
    display: flex;
    align-items: center;
    justify-content: space-between;
  }}
  .section-header h2 {{
    font-size: 22px;
    font-weight: 600;
  }}

  /* Bar list */
  .bar-list {{
    display: flex;
    flex-direction: column;
    gap: 8px;
  }}
  .bar-row {{
    display: grid;
    grid-template-columns: 1fr 120px 50px 50px;
    align-items: center;
    gap: 12px;
    padding: 8px 12px;
    border-radius: 8px;
    transition: background 0.15s;
  }}
  .bar-row:hover {{
    background: var(--bg);
  }}
  .bar-label {{
    font-size: 14px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }}
  .bar-track {{
    height: 8px;
    background: var(--border);
    border-radius: 4px;
    overflow: hidden;
  }}
  .bar-fill {{
    height: 100%;
    border-radius: 4px;
    transition: width 0.3s ease;
  }}
  .bar-count {{
    font-size: 14px;
    font-weight: 600;
    text-align: right;
  }}
  .bar-pct {{
    font-size: 13px;
    color: var(--text-muted);
    text-align: right;
  }}

  /* Footer */
  .footer {{
    text-align: center;
    padding: 24px;
    color: var(--text-muted);
    font-size: 13px;
  }}

  /* Traffic heatmap — Umami style with grey background circles */
  .heatmap-card {{
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 20px;
  }}
  .heatmap-container {{
    display: flex;
    flex-direction: column;
    gap: 4px;
  }}
  .heatmap-grid {{
    display: grid;
    grid-template-columns: 24px repeat(7, 1fr);
    gap: 4px;
    align-items: center;
  }}
  .heatmap-dow {{
    text-align: center;
    font-size: 10px;
    font-weight: 600;
    color: var(--text-muted);
    line-height: 1;
    padding-bottom: 2px;
  }}
  .heatmap-dow-spacer {{
  }}
  .heatmap-hour {{
    text-align: right;
    font-size: 9px;
    color: var(--text-muted);
    line-height: 18px;
    padding-right: 2px;
  }}
  .heatmap-cell-wrapper {{
    display: flex;
    align-items: center;
    justify-content: center;
    height: 18px;
    position: relative;
  }}
  .heatmap-bg-circle {{
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--border);
    position: absolute;
  }}
  .heatmap-fg-circle {{
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--primary);
    position: absolute;
    transform: scale(var(--scale, 0));
    transition: transform 0.2s;
    cursor: pointer;
  }}
  .heatmap-fg-circle:hover {{
    outline: 2px solid var(--primary);
    outline-offset: 2px;
  }}
  .heatmap-legend {{
    display: flex;
    align-items: center;
    gap: 6px;
    justify-content: flex-end;
    font-size: 10px;
    color: var(--text-muted);
    margin-top: 4px;
  }}
  .heatmap-legend-cells {{
    display: flex;
    gap: 4px;
    align-items: center;
  }}
  .heatmap-legend-cell {{
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--border);
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }}
  .heatmap-legend-cell::after {{
    content: '';
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--primary);
    position: absolute;
    transform: scale(var(--s, 0));
  }}
</style>
</head>
<body>
<div class="container">

  <!-- Header -->
  <div class="header">
    <div class="header-left">
      <h1>
        <img class="favicon" src="https://icons.duckduckgo.com/ip3/www.cmd.bzh.ico" alt="">
        CMD Breizh
      </h1>
    </div>
    <div class="date-picker">
      <div class="date-presets">
        <button class="preset-btn" data-preset="today">Aujourd'hui</button>
        <button class="preset-btn" data-preset="yesterday">Hier</button>
        <button class="preset-btn" data-preset="7d">7 jours</button>
        <button class="preset-btn" data-preset="30d">30 jours</button>
        <button class="preset-btn" data-preset="90d">90 jours</button>
        <button class="preset-btn active" data-preset="all">Tout</button>
      </div>
      <div class="date-selector">
        <div class="date-field" id="start-field">
          <span class="field-label">Du</span>
          <span class="field-value" id="start-display">{data_start.strftime('%d/%m/%Y')}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        </div>
        <span class="date-arrow">→</span>
        <div class="date-field" id="end-field">
          <span class="field-label">Au</span>
          <span class="field-value" id="end-display">{data_end.strftime('%d/%m/%Y')}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        </div>
        <div class="calendar-popup" id="calendar-popup">
          <div class="calendar-header">
            <button class="calendar-nav-btn" id="cal-prev">‹</button>
            <span class="calendar-title" id="cal-title"></span>
            <button class="calendar-nav-btn" id="cal-next">›</button>
          </div>
          <div class="calendar-grid" id="cal-grid"></div>
          <div class="calendar-footer">
            <button class="calendar-btn cancel" id="cal-cancel">Annuler</button>
            <button class="calendar-btn apply" id="cal-apply">Appliquer</button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- KPI cards -->
  <div class="kpi-grid">
    <div class="kpi-card">
      <span class="kpi-label" data-tooltip="Nombre d'utilisateurs uniques ayant visité le site (identifiés par leur session de navigateur)">Visiteurs uniques</span>
      <span class="kpi-value">{len(sessions)}</span>
    </div>
    <div class="kpi-card">
      <span class="kpi-label" data-tooltip="Nombre total de visites. Un visiteur peut faire plusieurs visites (sessions) au fil du temps.">Visites</span>
      <span class="kpi-value">{len(visits)}</span>
    </div>
    <div class="kpi-card">
      <span class="kpi-label" data-tooltip="Nombre total de pages vues, soit chaque fois qu'une page a été chargée par un visiteur">Vues</span>
      <span class="kpi-value">{total_views}</span>
    </div>
    <div class="kpi-card">
      <span class="kpi-label" data-tooltip="Pourcentage de visites où le visiteur n'a consulté qu'une seule page avant de quitter le site. Un taux élevé peut indiquer que les visiteurs ne trouvent pas ce qu'ils cherchent.">Taux de rebond</span>
      <span class="kpi-value">{bounce_rate}%</span>
    </div>
    <div class="kpi-card">
      <span class="kpi-label" data-tooltip="Durée moyenne d'une visite, calculée comme le temps écoulé entre la première et la dernière action du visiteur sur le site">Durée moyenne de visite</span>
      <span class="kpi-value">{format_duration(avg_duration)}</span>
    </div>
  </div>

  <!-- Chart -->
  <div class="card chart-card">
    <div class="chart-container">
      <div class="chart-area">
        {chart_bars}
      </div>
      <div class="chart-legend">
        <div class="legend-item">
          <div class="legend-dot" style="background: rgba(38, 128, 235, 0.8);"></div>
          <span>Visiteurs uniques</span>
        </div>
        <div class="legend-item">
          <div class="legend-dot" style="background: rgba(38, 128, 235, 0.4);"></div>
          <span>Vues</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Sources + Languages -->
  <div class="section-grid">
    {table_section('Sources', refs_html, 'Sites d\'où proviennent vos visiteurs (moteurs de recherche, liens, ou accès direct en tapant l\'URL')}
    {table_section('Langues', langs_html, 'Langues configurées dans le navigateur de vos visiteurs (indique leur préférence linguistique, pas nécessairement leur nationalité)')}
  </div>

  <!-- OS / Devices -->
  <div class="section-grid">
    {table_section('Systèmes d\'exploitation', os_html, 'Répartition des systèmes d\'exploitation utilisés par vos visiteurs (Windows, macOS, Android, iOS, Linux, etc.)')}
    {table_section('Appareils', devices_html, 'Type d\'appareil utilisé : mobile (smartphone), portable (ordinateur portable), ordinateur (fixe) ou tablette')}
  </div>

  <!-- Countries / Regions / Cities + Traffic heatmap -->
  <div class="section-grid">
    {table_section('Pays', countries_html, 'Pays d\'origine de vos visiteurs, déterminé à partir de leur adresse IP')}
    {table_section('Régions', regions_html, 'Régions d\'origine de vos visiteurs, déterminées à partir de leur adresse IP')}
    {table_section('Villes', cities_html, 'Villes d\'origine de vos visiteurs, déterminées à partir de leur adresse IP')}
    <div class="card heatmap-card">
      <div class="section-header" style="margin-bottom: 12px;">
        <h2 data-tooltip="Répartition du trafic par jour de la semaine et heure de la journée. Le cercle gris représente le maximum possible, et le cercle bleu grandit selon le nombre de visites.">Trafic par jour et heure</h2>
      </div>
      <div class="heatmap-container">
        <div class="heatmap-grid">
          {heatmap_grid}
        </div>
      </div>
    </div>
  </div>

  <div class="footer">
    Rapport généré à partir d'un export CSV Umami • {datetime.now().strftime('%d/%m/%Y à %H:%M')}
  </div>

</div>
<script>
(function() {{
  const data = {json.dumps({
    'days': all_days,
    'visitors': chart_visitors,
    'views': chart_views,
    'max': max_chart,
  })};

  // --- Tooltip positioning (prevents edge overflow) ---
  const tooltipEl = document.createElement('div');
  tooltipEl.className = 'tooltip-popup';
  document.body.appendChild(tooltipEl);

  document.querySelectorAll('[data-tooltip]').forEach(el => {{
    el.addEventListener('mouseenter', () => {{
      const text = el.getAttribute('data-tooltip');
      tooltipEl.textContent = text;
      tooltipEl.classList.add('visible');
      const rect = el.getBoundingClientRect();
      const tipRect = tooltipEl.getBoundingClientRect();
      let left = rect.left + rect.width / 2 - tipRect.width / 2;
      // Clamp within viewport
      left = Math.max(12, Math.min(left, window.innerWidth - tipRect.width - 12));
      let top = rect.top - tipRect.height - 8;
      // If not enough space above, show below
      if (top < 12) top = rect.bottom + 8;
      tooltipEl.style.left = left + 'px';
      tooltipEl.style.top = top + 'px';
    }});
    el.addEventListener('mouseleave', () => {{
      tooltipEl.classList.remove('visible');
    }});
  }});

  const dataStart = '{data_start.isoformat()}';
  const dataEnd = '{data_end.isoformat()}';
  const chartArea = document.querySelector('.chart-area');
  const presets = document.querySelectorAll('.preset-btn');

  // Custom calendar state
  let calCurrentMonth = new Date(dataStart + 'T00:00:00');
  let calSelecting = null; // 'start' or 'end'
  let calTempStart = dataStart;
  let calTempEnd = dataEnd;

  const startField = document.getElementById('start-field');
  const endField = document.getElementById('end-field');
  const startDisplay = document.getElementById('start-display');
  const endDisplay = document.getElementById('end-display');
  const calPopup = document.getElementById('calendar-popup');
  const calTitle = document.getElementById('cal-title');
  const calGrid = document.getElementById('cal-grid');
  const calPrev = document.getElementById('cal-prev');
  const calNext = document.getElementById('cal-next');
  const calCancel = document.getElementById('cal-cancel');
  const calApply = document.getElementById('cal-apply');

  function formatDate(dt) {{
    const months = ['jan', 'fév', 'mar', 'avr', 'mai', 'juin', 'juil', 'août', 'sep', 'oct', 'nov', 'déc'];
    return dt.getDate() + ' ' + months[dt.getMonth()];
  }}

  function formatDateFr(dateStr) {{
    const dt = new Date(dateStr + 'T00:00:00');
    const d = String(dt.getDate()).padStart(2, '0');
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    return d + '/' + m + '/' + dt.getFullYear();
  }}

  function isoDate(dt) {{
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const d = String(dt.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + d;
  }}

  function renderCalendar() {{
    const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    const dows = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
    calTitle.textContent = months[calCurrentMonth.getMonth()] + ' ' + calCurrentMonth.getFullYear();

    let html = '';
    for (const dow of dows) {{
      html += '<div class="calendar-dow">' + dow + '</div>';
    }}

    const firstDay = new Date(calCurrentMonth.getFullYear(), calCurrentMonth.getMonth(), 1);
    const lastDay = new Date(calCurrentMonth.getFullYear(), calCurrentMonth.getMonth() + 1, 0);
    const startDow = (firstDay.getDay() + 6) % 7; // Monday = 0
    const todayStr = isoDate(new Date());

    // Previous month days
    for (let i = 0; i < startDow; i++) {{
      const d = new Date(firstDay);
      d.setDate(d.getDate() - (startDow - i));
      html += '<div class="calendar-day other-month" data-date="' + isoDate(d) + '">' + d.getDate() + '</div>';
    }}

    // Current month days
    for (let day = 1; day <= lastDay.getDate(); day++) {{
      const dt = new Date(calCurrentMonth.getFullYear(), calCurrentMonth.getMonth(), day);
      const ds = isoDate(dt);
      let classes = 'calendar-day';
      if (ds === todayStr) classes += ' today';
      if (ds === calTempStart || ds === calTempEnd) classes += ' selected';
      if (calTempStart && calTempEnd && ds > calTempStart && ds < calTempEnd) classes += ' in-range';
      if (ds < dataStart || ds > dataEnd) classes += ' disabled';
      html += '<div class="' + classes + '" data-date="' + ds + '">' + day + '</div>';
    }}

    // Next month days to fill the grid
    const totalCells = startDow + lastDay.getDate();
    const remaining = (7 - (totalCells % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {{
      const d = new Date(lastDay);
      d.setDate(d.getDate() + i);
      html += '<div class="calendar-day other-month" data-date="' + isoDate(d) + '">' + d.getDate() + '</div>';
    }}

    calGrid.innerHTML = html;

    // Add click handlers — single click selects the date and applies immediately
    calGrid.querySelectorAll('.calendar-day:not(.disabled)').forEach(el => {{
      el.addEventListener('click', () => {{
        const ds = el.dataset.date;
        if (calSelecting === 'start') {{
          calTempStart = ds;
          if (ds > calTempEnd) calTempEnd = ds;
        }} else {{
          calTempEnd = ds;
          if (ds < calTempStart) calTempStart = ds;
        }}
        // Apply immediately
        startDisplay.textContent = formatDateFr(calTempStart);
        startDisplay.dataset.value = calTempStart;
        endDisplay.textContent = formatDateFr(calTempEnd);
        endDisplay.dataset.value = calTempEnd;
        renderChart(calTempStart, calTempEnd);
        setActivePreset('');
        renderCalendar();
      }});
    }});
  }}

  function openCalendar(selecting) {{
    calSelecting = selecting;
    calTempStart = startDisplay.dataset.value || dataStart;
    calTempEnd = endDisplay.dataset.value || dataEnd;
    // Open on the month of the field being edited
    const refDate = selecting === 'end' ? calTempEnd : calTempStart;
    calCurrentMonth = new Date(refDate + 'T00:00:00');
    renderCalendar();
    calPopup.classList.add('open');
  }}

  startField.addEventListener('click', () => openCalendar('start'));
  endField.addEventListener('click', () => openCalendar('end'));

  calPrev.addEventListener('click', (e) => {{
    e.stopPropagation();
    calCurrentMonth.setMonth(calCurrentMonth.getMonth() - 1);
    renderCalendar();
  }});
  calNext.addEventListener('click', (e) => {{
    e.stopPropagation();
    calCurrentMonth.setMonth(calCurrentMonth.getMonth() + 1);
    renderCalendar();
  }});

  calCancel.addEventListener('click', () => {{
    calPopup.classList.remove('open');
  }});

  calApply.addEventListener('click', () => {{
    startDisplay.textContent = formatDateFr(calTempStart);
    startDisplay.dataset.value = calTempStart;
    endDisplay.textContent = formatDateFr(calTempEnd);
    endDisplay.dataset.value = calTempEnd;
    renderChart(calTempStart, calTempEnd);
    calPopup.classList.remove('open');
    setActivePreset('');
  }});

  document.addEventListener('click', (e) => {{
    if (!calPopup.contains(e.target) && !startField.contains(e.target) && !endField.contains(e.target)) {{
      calPopup.classList.remove('open');
    }}
  }});

  function renderChart(startDate, endDate) {{
    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T00:00:00');
    const days = [];
    const visitors = [];
    const views = [];
    let d = new Date(start);
    while (d <= end) {{
      const ds = d.toISOString().slice(0, 10);
      const idx = data.days.indexOf(ds);
      days.push(ds);
      visitors.push(idx >= 0 ? data.visitors[idx] : 0);
      views.push(idx >= 0 ? data.views[idx] : 0);
      d.setDate(d.getDate() + 1);
    }}
    const maxVal = Math.max(Math.max(...visitors, 1), Math.max(...views, 1));
    const numDays = days.length;

    let labelInterval;
    if (numDays <= 7) labelInterval = 1;
    else if (numDays <= 31) labelInterval = Math.max(1, Math.floor(numDays / 7));
    else if (numDays <= 90) labelInterval = Math.max(1, Math.floor(numDays / 10));
    else labelInterval = Math.max(1, Math.floor(numDays / 12));

    const lastIdx = numDays - 1;
    const lastIntervalIdx = Math.floor(lastIdx / labelInterval) * labelInterval;
    const skipNearEnd = labelInterval > 1 && (lastIdx - lastIntervalIdx) < (labelInterval / 2);

    let html = '';
    for (let i = 0; i < numDays; i++) {{
      const v = visitors[i];
      const w = views[i];
      const vH = (v / maxVal) * 100;
      const wH = (w / maxVal) * 100;
      const dt = new Date(days[i] + 'T00:00:00');
      const fullLabel = dt.toLocaleDateString('fr-FR');
      const isLast = i === lastIdx;
      const isIntervalLabel = i % labelInterval === 0;
      let showLabel = isIntervalLabel || isLast;
      if (skipNearEnd && i === lastIntervalIdx && !isLast) {{
        showLabel = false;
      }}
      const labelHtml = showLabel ? '<div class="chart-label">' + formatDate(dt) + '</div>' : '';
      html += '<div class="chart-bar-group" title="' + fullLabel + ' : ' + v + ' visiteurs, ' + w + ' vues">' +
        '<div class="chart-bars">' +
        '<div class="chart-bar visitors" style="height:' + vH + '%"></div>' +
        '<div class="chart-bar views" style="height:' + wH + '%"></div>' +
        '</div>' + labelHtml + '</div>';
    }}
    chartArea.innerHTML = html;
  }}

  function setActivePreset(name) {{
    presets.forEach(b => b.classList.toggle('active', b.dataset.preset === name));
  }}

  function applyPreset(name) {{
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    let start, end;
    end = todayStr;
    switch(name) {{
      case 'today':
        start = todayStr;
        break;
      case 'yesterday':
        const y = new Date(today); y.setDate(y.getDate() - 1);
        start = y.toISOString().slice(0, 10);
        end = start;
        break;
      case '7d':
        const d7 = new Date(today); d7.setDate(d7.getDate() - 6);
        start = d7.toISOString().slice(0, 10);
        break;
      case '30d':
        const d30 = new Date(today); d30.setDate(d30.getDate() - 29);
        start = d30.toISOString().slice(0, 10);
        break;
      case '90d':
        const d90 = new Date(today); d90.setDate(d90.getDate() - 89);
        start = d90.toISOString().slice(0, 10);
        break;
      case 'all':
        start = dataStart;
        end = dataEnd;
        break;
    }}
    // Clamp to data range
    if (start < dataStart) start = dataStart;
    if (end > dataEnd) end = dataEnd;
    if (start > dataEnd) start = dataStart;
    if (end < dataStart) end = dataEnd;
    startDisplay.dataset.value = start;
    endDisplay.dataset.value = end;
    renderChart(start, end);
  }}

  presets.forEach(btn => {{
    btn.addEventListener('click', () => {{
      setActivePreset(btn.dataset.preset);
      applyPreset(btn.dataset.preset);
      startDisplay.textContent = formatDateFr(startDisplay.dataset.value || dataStart);
      endDisplay.textContent = formatDateFr(endDisplay.dataset.value || dataEnd);
    }});
  }});

  // Initial render
  startDisplay.dataset.value = dataStart;
  endDisplay.dataset.value = dataEnd;
  renderChart(dataStart, dataEnd);
}})();
</script>
</body>
</html>'''

    Path(output_path).write_text(html_doc, encoding='utf-8')
    print(f'Rapport généré : {output_path}')
    print(f'  Visiteurs uniques : {len(sessions)}')
    print(f'  Visites : {len(visits)}')
    print(f'  Vues : {total_views}')
    print(f'  Taux de rebond : {bounce_rate}%')
    print(f'  Durée moyenne : {format_duration(avg_duration)}')


if __name__ == '__main__':
    if len(sys.argv) != 3:
        print(f'Usage: {sys.argv[0]} <input_csv> <output_html>')
        sys.exit(1)
    generate_report(sys.argv[1], sys.argv[2])
