"""
Script de Stress Test — Détection automatique du point de rupture
==================================================================
Lance une montée de charge progressive de 10 à N utilisateurs,
analyse l'historique temporel pour détecter le point de rupture,
et génère un dashboard HTML interactif (Glassmorphism Neon Dark Mode).

Usage:
  python scripts/run_stress_test.py -f scenarios/ofika_public.py -u 1000 -r 10 -t 10m --host http://localhost:3000

Optimisations par rapport au template original :
  - Meilleure détection des en-têtes CSV Locust (compatibilité multi-versions)
  - Confirmation de rupture sur 3 points consécutifs (évite les faux positifs)
  - Ajout de p99, RPS moyen, et taux d'erreur global dans les KPIs
  - Section des erreurs détaillées dans le dashboard
  - Export automatique du résumé en Markdown en plus du CSV
"""
import os
import sys
import argparse
import subprocess
import csv
import json
from typing import Dict, Any, List, Optional


def parse_args():
    parser = argparse.ArgumentParser(
        description="Stress test Locust — Trouver le point de rupture et générer un dashboard."
    )
    parser.add_argument("-f", "--file", required=True,
                        help="Chemin du scénario de test (ex: scenarios/ofika_public.py)")
    parser.add_argument("-u", "--max-users", type=int, default=1000,
                        help="Nombre max d'utilisateurs à injecter (défaut: 1000)")
    parser.add_argument("-r", "--spawn-rate", type=int, default=10,
                        help="Taux d'apparition des utilisateurs par seconde (défaut: 10)")
    parser.add_argument("-t", "--run-time", default="10m",
                        help="Durée du test (défaut: 10m)")
    parser.add_argument("--host", required=True,
                        help="URL de l'application cible (ex: http://localhost:3000)")
    parser.add_argument("--max-latency", type=int, default=1500,
                        help="Latence p95 max tolérée en ms (défaut: 1500)")
    parser.add_argument("--max-error-rate", type=float, default=2.0,
                        help="Taux d'erreur max toléré en %% (défaut: 2.0)")
    parser.add_argument("--confirm-threshold", type=int, default=3,
                        help="Nombre de points consécutifs au-dessus du seuil pour confirmer la rupture (défaut: 3)")
    return parser.parse_args()


def get_csv_value(row: dict, *keys: str, default: Any = 0) -> str:
    """
    Récupère une valeur depuis un dict CSV en testant plusieurs clés possibles.
    Gère les différentes versions de Locust qui utilisent des en-têtes différents.
    """
    for key in keys:
        val = row.get(key)
        if val is not None and val != '':
            return val
    return str(default)


def _find_locust_exe() -> Optional[str]:
    """
    Cherche l'exécutable locust dans cet ordre :
      1. .venv/Scripts/locust.exe  (Windows)
      2. .venv/bin/locust          (Unix)
      3. Commande 'locust' dans le PATH
    """
    script_dir = os.path.dirname(os.path.abspath(__file__))
    root_dir   = os.path.dirname(script_dir)  # locust-load-tests/
    candidates = [
        os.path.join(root_dir, ".venv", "Scripts", "locust.exe"),
        os.path.join(root_dir, ".venv", "bin",     "locust"),
    ]
    for path in candidates:
        if os.path.isfile(path):
            return path
    return "locust"  # Fallback PATH


def run_locust_command(cmd: List[str]) -> bool:
    """
    Exécute la commande Locust.
    - Remplace la commande 'locust' par le chemin exact dans .venv
    - Traite l'exit code 1 comme un succès : Locust retourne 1 quand
      des requêtes HTTP échouent, ce qui est normal en stress test.
    """
    locust_exe = _find_locust_exe()
    # Remplacer 'locust' en tête de commande par le chemin résolu
    if cmd and cmd[0] == "locust":
        cmd = [locust_exe] + cmd[1:]
    else:
        cmd = [locust_exe] + cmd

    print(f"[+] Lancement : {' '.join(cmd[:3])} ...")
    try:
        result = subprocess.run(cmd)
        if result.returncode in (0, 1):
            # 0 = succès, 1 = locust terminé avec des erreurs HTTP (normal)
            if result.returncode == 1:
                print("[!] Locust a terminé avec des erreurs HTTP (comportement normal en stress test)")
            return True
        else:
            print(f"[-] Locust a retourné le code {result.returncode}")
            return False
    except FileNotFoundError:
        # Dernier recours : python -m locust
        print(f"[!] '{locust_exe}' introuvable, tentative avec python -m locust...")
        fallback_cmd = [sys.executable, "-m", "locust"] + cmd[1:]
        try:
            result = subprocess.run(fallback_cmd)
            return result.returncode in (0, 1)
        except Exception as e:
            print(f"[-] Erreur de lancement de Locust : {e}")
            return False
    except Exception as e:
        print(f"[-] Erreur inattendue : {e}")
        return False


def analyze_history(history_file: str, args) -> tuple:
    """
    Analyse l'historique temporel pour détecter le point de rupture.
    Retourne (history_data, kpis).
    """
    history_data = []
    consecutive_failures = 0  # Compteur de points consécutifs au-dessus du seuil

    kpis: Dict[str, Any] = {
        "max_rps": 0.0,
        "avg_rps": 0.0,
        "break_users": None,
        "break_rps": None,
        "safe_users": int(args.max_users),
        "safe_rps": 0.0,
        "total_requests": 0,
        "total_failures": 0,
        "max_p95": 0.0,
    }

    rps_sum = 0.0
    rps_count = 0

    try:
        with open(history_file, mode='r', encoding='utf-8') as f:
            reader = csv.DictReader(f)

            for row in reader:
                timestamp_raw = get_csv_value(row, 'Timestamp')
                user_count_raw = get_csv_value(row, 'User Count', 'User count')

                if not timestamp_raw or not user_count_raw:
                    continue

                try:
                    user_count = int(float(user_count_raw))
                    rps = float(get_csv_value(row, 'Requests/s', 'Current RPS', default=0))
                    failures_s = float(get_csv_value(row, 'Failures/s', 'Current Failures/s', default=0))
                    p50 = float(get_csv_value(row, '50%', 'Median Response Time', default=0))
                    p95 = float(get_csv_value(row, '95%', '95% Response Time', default=0))
                    p99 = float(get_csv_value(row, '99%', '99% Response Time', default=0))
                except (ValueError, KeyError):
                    continue

                # Métriques globales
                if rps > kpis["max_rps"]:
                    kpis["max_rps"] = rps
                if p95 > kpis["max_p95"]:
                    kpis["max_p95"] = p95

                rps_sum += rps
                rps_count += 1

                # Taux d'erreur sur ce pas de temps
                error_rate = (failures_s / rps * 100) if rps > 0 else 0.0

                # Formatage du timestamp
                raw_time = str(timestamp_raw)
                if " " in raw_time:
                    time_label = raw_time.split(" ")[1].split(".")[0]
                else:
                    import datetime
                    try:
                        time_label = datetime.datetime.fromtimestamp(float(raw_time)).strftime('%H:%M:%S')
                    except (ValueError, OSError):
                        time_label = raw_time

                history_data.append({
                    "timestamp": time_label,
                    "users": user_count,
                    "rps": round(rps, 2),
                    "failures_s": round(failures_s, 2),
                    "p50": round(p50, 1),
                    "p95": round(p95, 1),
                    "p99": round(p99, 1),
                    "error_rate": round(error_rate, 2),
                })

                # Détection de rupture avec confirmation sur N points consécutifs
                is_broken = (error_rate > args.max_error_rate) or (p95 > args.max_latency)

                if is_broken:
                    consecutive_failures += 1
                else:
                    consecutive_failures = 0

                if consecutive_failures >= args.confirm_threshold and kpis["break_users"] is None:
                    # La rupture est confirmée
                    # Le point de rupture est le premier point de la séquence
                    break_index = len(history_data) - args.confirm_threshold
                    if break_index >= 0:
                        kpis["break_users"] = history_data[break_index]["users"]
                        kpis["break_rps"] = history_data[break_index]["rps"]

                        # La limite de sécurité est le dernier point stable avant la séquence de rupture
                        if break_index > 0:
                            kpis["safe_users"] = history_data[break_index - 1]["users"]
                            kpis["safe_rps"] = history_data[break_index - 1]["rps"]
                        else:
                            kpis["safe_users"] = 0
                            kpis["safe_rps"] = 0.0

        # Si le point de rupture n'a pas été atteint
        if kpis["break_users"] is None and history_data:
            last_step = history_data[-1]
            kpis["safe_users"] = int(last_step["users"])
            kpis["safe_rps"] = float(last_step["rps"])

        # RPS moyen
        if rps_count > 0:
            kpis["avg_rps"] = round(rps_sum / rps_count, 2)

    except Exception as e:
        print(f"[-] Erreur lors de l'analyse de l'historique : {e}")
        import traceback
        traceback.print_exc()

    return history_data, kpis


def parse_endpoints(stats_file: str) -> List[dict]:
    """Parse les statistiques par endpoint depuis le CSV."""
    endpoints_data = []
    if not os.path.exists(stats_file):
        return endpoints_data

    try:
        with open(stats_file, mode='r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                name = row.get('Name', '')
                req_type = row.get('Type', '')
                if name == 'Aggregated' or req_type == '':
                    continue
                endpoints_data.append({
                    "method": req_type or 'GET',
                    "name": name or '/',
                    "requests": get_csv_value(row, 'Request Count', default='0'),
                    "failures": get_csv_value(row, 'Failure Count', default='0'),
                    "avg_response_time": get_csv_value(row, 'Average Response Time', default='0'),
                    "min_response_time": get_csv_value(row, 'Min Response Time', default='0'),
                    "max_response_time": get_csv_value(row, 'Max Response Time', default='0'),
                    "p50": get_csv_value(row, '50%', 'Median Response Time', default='0'),
                    "p95": get_csv_value(row, '95%', default='0'),
                    "p99": get_csv_value(row, '99%', default='0'),
                    "current_rps": get_csv_value(row, 'Requests/s', 'Current RPS', default='0.0'),
                })
    except Exception as e:
        print(f"[-] Erreur lors de la lecture des stats endpoints : {e}")

    return endpoints_data


def parse_failures(failures_file: str) -> List[dict]:
    """Parse les erreurs détaillées depuis le CSV."""
    failures_data = []
    if not os.path.exists(failures_file):
        return failures_data

    try:
        with open(failures_file, mode='r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                failures_data.append({
                    "method": row.get('Method', 'GET'),
                    "name": row.get('Name', '/'),
                    "error": row.get('Error', 'Timeout'),
                    "occurrences": row.get('Occurrences', '1'),
                })
    except Exception as e:
        print(f"[-] Erreur lors de la lecture des erreurs : {e}")

    return failures_data


def generate_html_dashboard(output_path, host, scenario, max_users, run_time,
                            kpis, history_data, endpoints_data, failures_data):
    """
    Génère un dashboard HTML5 interactif avec Glassmorphism + Neon Dark Mode.
    Inclut : KPI Cards, Line Chart, Donut Chart, Pivot Table avec filtres,
    et une section Erreurs détaillées.
    """
    html_template = f"""<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Stress Test Ofika-c — Dashboard</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        :root {{
            --bg-color: #0B0F19;
            --card-bg: rgba(17, 24, 39, 0.7);
            --card-border: rgba(255, 255, 255, 0.08);
            --text-primary: #F3F4F6;
            --text-secondary: #9CA3AF;
            --neon-blue: #00F0FF;
            --neon-purple: #9D4EDD;
            --neon-pink: #FF007F;
            --neon-green: #39FF14;
            --neon-orange: #FF8C00;
            --danger-red: #FF3333;
        }}

        * {{ margin: 0; padding: 0; box-sizing: border-box; }}

        body {{
            background-color: var(--bg-color);
            color: var(--text-primary);
            font-family: 'Outfit', sans-serif;
            padding: 40px 20px;
            background-image: radial-gradient(circle at 10% 20%, rgba(90, 40, 200, 0.15) 0%, transparent 40%),
                              radial-gradient(circle at 90% 80%, rgba(0, 240, 255, 0.12) 0%, transparent 45%);
            background-attachment: fixed;
        }}

        .container {{ max-width: 1200px; margin: 0 auto; }}

        header {{ text-align: center; margin-bottom: 40px; }}

        header h1 {{
            font-size: 2.8rem; font-weight: 800;
            background: linear-gradient(135deg, var(--neon-blue), var(--neon-purple));
            -webkit-background-clip: text; -webkit-text-fill-color: transparent;
            margin-bottom: 10px; letter-spacing: -1px;
        }}

        header p {{ color: var(--text-secondary); font-size: 1.1rem; }}

        .meta-bar {{
            display: flex; justify-content: center; gap: 20px; flex-wrap: wrap;
            margin-top: 12px;
        }}

        .meta-badge {{
            background: rgba(31, 41, 55, 0.6); border: 1px solid var(--card-border);
            padding: 6px 14px; border-radius: 8px; font-size: 0.85rem;
            color: var(--text-secondary);
        }}

        .meta-badge strong {{ color: #FFF; }}

        /* KPI Grid */
        .kpi-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px; margin-bottom: 40px;
        }}

        .kpi-card {{
            background: var(--card-bg); border: 1px solid var(--card-border);
            border-radius: 16px; padding: 20px; text-align: center;
            backdrop-filter: blur(12px);
            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
            transition: transform 0.3s ease, border-color 0.3s ease;
        }}

        .kpi-card:hover {{ transform: translateY(-5px); border-color: rgba(0, 240, 255, 0.3); }}

        .kpi-card h3 {{
            color: var(--text-secondary); font-size: 0.8rem;
            text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;
        }}

        .kpi-card .value {{
            font-size: 1.8rem; font-weight: 800; color: #FFF;
            text-shadow: 0 0 10px rgba(255, 255, 255, 0.2);
        }}

        .kpi-card.breaking-point .value {{
            color: var(--neon-pink); text-shadow: 0 0 15px rgba(255, 0, 127, 0.4);
        }}

        .kpi-card.safe-limit .value {{
            color: var(--neon-green); text-shadow: 0 0 15px rgba(57, 255, 20, 0.4);
        }}

        .kpi-card.warning .value {{
            color: var(--neon-orange); text-shadow: 0 0 15px rgba(255, 140, 0, 0.4);
        }}

        .kpi-card .unit {{
            font-size: 0.85rem; font-weight: 400;
            color: var(--text-secondary); margin-left: 4px;
        }}

        /* Charts */
        .chart-row {{
            display: grid; grid-template-columns: 2fr 1fr;
            gap: 20px; margin-bottom: 40px;
        }}

        @media (max-width: 900px) {{ .chart-row {{ grid-template-columns: 1fr; }} }}

        .card {{
            background: var(--card-bg); border: 1px solid var(--card-border);
            border-radius: 16px; padding: 24px; backdrop-filter: blur(12px);
            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
        }}

        .card h2 {{
            font-size: 1.3rem; font-weight: 600; margin-bottom: 20px;
            border-left: 4px solid var(--neon-blue); padding-left: 12px;
        }}

        .chart-container {{ position: relative; height: 350px; width: 100%; }}

        .donut-container {{
            display: flex; justify-content: center; align-items: center; height: 350px;
        }}

        /* Pivot Table */
        .pivot-section {{ margin-bottom: 40px; }}

        .pivot-controls {{
            display: flex; gap: 15px; margin-bottom: 15px; flex-wrap: wrap;
        }}

        .pivot-controls select, .pivot-controls input {{
            background: rgba(31, 41, 55, 0.8); border: 1px solid var(--card-border);
            color: #FFF; padding: 10px 16px; border-radius: 8px;
            font-family: inherit; outline: none;
        }}

        .pivot-table-container {{
            width: 100%; overflow-x: auto; border-radius: 12px;
            border: 1px solid var(--card-border);
        }}

        table {{
            width: 100%; border-collapse: collapse; text-align: left;
            font-size: 0.9rem; background: rgba(17, 24, 39, 0.4);
        }}

        th, td {{ padding: 12px 16px; border-bottom: 1px solid var(--card-border); }}

        th {{
            background: rgba(31, 41, 55, 0.7); color: var(--text-secondary);
            font-weight: 600; text-transform: uppercase; font-size: 0.75rem;
            letter-spacing: 0.5px; cursor: pointer; user-select: none;
        }}

        th:hover {{ color: #FFF; }}
        tr:hover td {{ background: rgba(255, 255, 255, 0.02); }}

        td.code {{ font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; }}

        .badge {{
            display: inline-block; padding: 3px 7px;
            border-radius: 6px; font-size: 0.7rem; font-weight: 600;
        }}

        .badge.get {{ background: rgba(0, 240, 255, 0.15); color: var(--neon-blue); }}
        .badge.post {{ background: rgba(157, 78, 221, 0.15); color: var(--neon-purple); }}
        .badge.put {{ background: rgba(57, 255, 20, 0.15); color: var(--neon-green); }}
        .badge.delete {{ background: rgba(255, 0, 127, 0.15); color: var(--neon-pink); }}

        .text-right {{ text-align: right; }}

        /* Error Section */
        .error-section {{ margin-bottom: 40px; }}

        .error-row {{
            background: rgba(255, 51, 51, 0.05); border: 1px solid rgba(255, 51, 51, 0.2);
            border-radius: 10px; padding: 14px 18px; margin-bottom: 10px;
            font-size: 0.85rem;
        }}

        .error-row .error-method {{ color: var(--neon-pink); font-weight: 600; }}
        .error-row .error-name {{ color: var(--text-primary); font-family: 'JetBrains Mono', monospace; }}
        .error-row .error-msg {{ color: var(--text-secondary); margin-top: 4px; font-size: 0.8rem; }}
        .error-row .error-count {{ color: var(--danger-red); font-weight: 700; float: right; }}

        footer {{
            text-align: center; color: var(--text-secondary); font-size: 0.8rem;
            margin-top: 40px; padding-top: 20px; border-top: 1px solid var(--card-border);
        }}
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>🚀 Rapport de Stress Test — Ofika-c</h1>
            <p>Analyse automatique de la capacité et du point de rupture</p>
            <div class="meta-bar">
                <span class="meta-badge">🌐 Hôte : <strong>{host}</strong></span>
                <span class="meta-badge">📄 Scénario : <strong>{scenario}</strong></span>
                <span class="meta-badge">👥 Max Users : <strong>{max_users}</strong></span>
                <span class="meta-badge">⏱️ Durée : <strong>{run_time}</strong></span>
            </div>
        </header>

        <!-- KPI Cards -->
        <div class="kpi-grid">
            <div class="kpi-card safe-limit">
                <h3>Limite de Sécurité</h3>
                <div class="value">{kpis['safe_users']}<span class="unit">users</span></div>
                <p style="color: var(--text-secondary); font-size: 0.8rem; margin-top: 6px;">Max supporté sans erreur</p>
            </div>
            <div class="kpi-card safe-limit">
                <h3>RPS Stable</h3>
                <div class="value">{kpis['safe_rps']}<span class="unit">req/s</span></div>
                <p style="color: var(--text-secondary); font-size: 0.8rem; margin-top: 6px;">Débit maximal stabilisé</p>
            </div>
            <div class="kpi-card breaking-point">
                <h3>Point de Rupture</h3>
                <div class="value">{kpis['break_users'] if kpis['break_users'] else 'Non atteint'}<span class="unit">{'users' if kpis['break_users'] else ''}</span></div>
                <p style="color: var(--text-secondary); font-size: 0.8rem; margin-top: 6px;">Début de la dégradation</p>
            </div>
            <div class="kpi-card">
                <h3>RPS Maximum</h3>
                <div class="value">{kpis['max_rps']}<span class="unit">req/s</span></div>
                <p style="color: var(--text-secondary); font-size: 0.8rem; margin-top: 6px;">Pic de débit brut</p>
            </div>
            <div class="kpi-card">
                <h3>RPS Moyen</h3>
                <div class="value">{kpis['avg_rps']}<span class="unit">req/s</span></div>
                <p style="color: var(--text-secondary); font-size: 0.8rem; margin-top: 6px;">Débit moyen sur toute la durée</p>
            </div>
            <div class="kpi-card warning">
                <h3>p95 Max</h3>
                <div class="value">{kpis['max_p95']}<span class="unit">ms</span></div>
                <p style="color: var(--text-secondary); font-size: 0.8rem; margin-top: 6px;">Latence p95 maximale atteinte</p>
            </div>
        </div>

        <!-- Charts Row -->
        <div class="chart-row">
            <div class="card">
                <h2>📈 Courbe de Performance Globale</h2>
                <div class="chart-container">
                    <canvas id="performanceChart"></canvas>
                </div>
            </div>
            <div class="card">
                <h2>🍩 Statut des Requêtes</h2>
                <div class="donut-container">
                    <canvas id="statusChart"></canvas>
                </div>
            </div>
        </div>

        <!-- Pivot Table -->
        <div class="card pivot-section">
            <h2>📊 Tableau Croisé Dynamique des Requêtes</h2>
            <div class="pivot-controls">
                <input type="text" id="endpointSearch" placeholder="🔍 Rechercher une route..." onkeyup="filterPivot()">
                <select id="methodFilter" onchange="filterPivot()">
                    <option value="">Toutes les méthodes</option>
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                </select>
            </div>
            <div class="pivot-table-container">
                <table id="pivotTable">
                    <thead>
                        <tr>
                            <th onclick="sortTable(0)">Méthode</th>
                            <th onclick="sortTable(1)">Endpoint</th>
                            <th onclick="sortTable(2)" class="text-right">Requêtes</th>
                            <th onclick="sortTable(3)" class="text-right">Échecs</th>
                            <th onclick="sortTable(4)" class="text-right">Moy. (ms)</th>
                            <th onclick="sortTable(5)" class="text-right">p95 (ms)</th>
                            <th onclick="sortTable(6)" class="text-right">p99 (ms)</th>
                            <th onclick="sortTable(7)" class="text-right">Max (ms)</th>
                            <th onclick="sortTable(8)" class="text-right">RPS</th>
                        </tr>
                    </thead>
                    <tbody id="pivotBody"></tbody>
                </table>
            </div>
        </div>

        <!-- Errors Section -->
        <div class="card error-section" id="errorsSection" style="display:none;">
            <h2>❌ Erreurs Détaillées</h2>
            <div id="errorsContainer"></div>
        </div>

        <footer>
            <p>Rapport généré automatiquement par Locust Stress Test — Ofika-c | ChefsOfika Orchestration</p>
        </footer>
    </div>

    <script>
        const history = {json.dumps(history_data)};
        const endpoints = {json.dumps(endpoints_data)};
        const failures = {json.dumps(failures_data)};

        // 1. Performance Chart
        const perfCtx = document.getElementById('performanceChart').getContext('2d');
        new Chart(perfCtx, {{
            type: 'line',
            data: {{
                labels: history.map(row => row.timestamp),
                datasets: [
                    {{
                        label: 'Utilisateurs',
                        data: history.map(row => row.users),
                        borderColor: '#9D4EDD',
                        backgroundColor: 'rgba(157, 78, 221, 0.1)',
                        yAxisID: 'y-users',
                        borderWidth: 2, tension: 0.3, fill: true
                    }},
                    {{
                        label: 'RPS',
                        data: history.map(row => row.rps),
                        borderColor: '#00F0FF',
                        yAxisID: 'y-rps',
                        borderWidth: 2, tension: 0.3
                    }},
                    {{
                        label: 'p95 (ms)',
                        data: history.map(row => row.p95),
                        borderColor: '#FF007F',
                        yAxisID: 'y-latency',
                        borderWidth: 1.5, borderDash: [5, 5], tension: 0.3
                    }},
                    {{
                        label: 'Erreur %',
                        data: history.map(row => row.error_rate),
                        borderColor: '#FF3333',
                        yAxisID: 'y-errors',
                        borderWidth: 1, borderDash: [2, 4], tension: 0.3
                    }}
                ]
            }},
            options: {{
                responsive: true,
                maintainAspectRatio: false,
                interaction: {{ mode: 'index', intersect: false }},
                scales: {{
                    'y-users': {{
                        type: 'linear', position: 'left',
                        grid: {{ color: 'rgba(255,255,255,0.05)' }},
                        ticks: {{ color: '#9CA3AF' }},
                        title: {{ display: true, text: 'Users', color: '#9CA3AF' }}
                    }},
                    'y-rps': {{
                        type: 'linear', position: 'right',
                        grid: {{ drawOnChartArea: false }},
                        ticks: {{ color: '#9CA3AF' }},
                        title: {{ display: true, text: 'RPS', color: '#9CA3AF' }}
                    }},
                    'y-latency': {{
                        type: 'linear', position: 'right',
                        grid: {{ drawOnChartArea: false }},
                        ticks: {{ color: '#9CA3AF' }}
                    }},
                    'y-errors': {{
                        type: 'linear', position: 'right',
                        grid: {{ drawOnChartArea: false }},
                        ticks: {{ color: '#9CA3AF' }},
                        display: false
                    }},
                    x: {{
                        ticks: {{ color: '#9CA3AF', maxTicksLimit: 20 }}
                    }}
                }},
                plugins: {{
                    legend: {{
                        labels: {{ color: '#F3F4F6', font: {{ family: 'Outfit' }} }}
                    }}
                }}
            }}
        }});

        // 2. Donut Chart
        const totalReqs = endpoints.reduce((s, r) => s + parseInt(r.requests || 0), 0);
        const totalFails = endpoints.reduce((s, r) => s + parseInt(r.failures || 0), 0);
        const totalSuccess = totalReqs - totalFails;

        const statusCtx = document.getElementById('statusChart').getContext('2d');
        new Chart(statusCtx, {{
            type: 'doughnut',
            data: {{
                labels: ['Succès', 'Échecs'],
                datasets: [{{
                    data: [totalSuccess, totalFails],
                    backgroundColor: ['#39FF14', '#FF3333'],
                    borderColor: '#0B0F19', borderWidth: 3
                }}]
            }},
            options: {{
                responsive: true, maintainAspectRatio: false,
                plugins: {{
                    legend: {{
                        position: 'bottom',
                        labels: {{ color: '#F3F4F6', font: {{ family: 'Outfit' }} }}
                    }}
                }},
                cutout: '70%'
            }}
        }});

        // 3. Pivot Table
        const tableBody = document.getElementById('pivotBody');

        function renderTable(data) {{
            tableBody.innerHTML = '';
            data.forEach(row => {{
                const tr = document.createElement('tr');
                const badgeClass = (row.method || 'get').toLowerCase();
                const failColor = parseInt(row.failures || 0) > 0 ? 'var(--danger-red)' : 'inherit';
                tr.innerHTML = `
                    <td><span class="badge ${{badgeClass}}">${{row.method}}</span></td>
                    <td class="code">${{row.name}}</td>
                    <td class="text-right">${{parseInt(row.requests || 0).toLocaleString()}}</td>
                    <td class="text-right" style="color: ${{failColor}}">${{parseInt(row.failures || 0).toLocaleString()}}</td>
                    <td class="text-right">${{parseFloat(row.avg_response_time || 0).toFixed(1)}}</td>
                    <td class="text-right">${{row.p95 || 0}}</td>
                    <td class="text-right">${{row.p99 || 0}}</td>
                    <td class="text-right">${{row.max_response_time || 0}}</td>
                    <td class="text-right">${{parseFloat(row.current_rps || 0).toFixed(1)}}</td>
                `;
                tableBody.appendChild(tr);
            }});
        }}

        renderTable(endpoints);

        function filterPivot() {{
            const searchVal = document.getElementById('endpointSearch').value.toLowerCase();
            const methodVal = document.getElementById('methodFilter').value;
            const filtered = endpoints.filter(row => {{
                const matchesSearch = (row.name || '').toLowerCase().includes(searchVal);
                const matchesMethod = methodVal === '' || row.method === methodVal;
                return matchesSearch && matchesMethod;
            }});
            renderTable(filtered);
        }}

        let sortDirection = false;
        function sortTable(colIdx) {{
            sortDirection = !sortDirection;
            const keys = ['method', 'name', 'requests', 'failures', 'avg_response_time', 'p95', 'p99', 'max_response_time', 'current_rps'];
            const key = keys[colIdx];
            const numKeys = ['requests', 'failures', 'avg_response_time', 'p95', 'p99', 'max_response_time', 'current_rps'];

            endpoints.sort((a, b) => {{
                let valA = a[key] || '';
                let valB = b[key] || '';
                if (numKeys.includes(key)) {{ valA = parseFloat(valA) || 0; valB = parseFloat(valB) || 0; }}
                if (valA < valB) return sortDirection ? -1 : 1;
                if (valA > valB) return sortDirection ? 1 : -1;
                return 0;
            }});
            filterPivot();
        }}

        // 4. Errors Section
        if (failures.length > 0) {{
            document.getElementById('errorsSection').style.display = 'block';
            const container = document.getElementById('errorsContainer');
            failures.forEach(f => {{
                const div = document.createElement('div');
                div.className = 'error-row';
                div.innerHTML = `
                    <span class="error-count">${{f.occurrences}}x</span>
                    <span class="error-method">${{f.method}}</span>
                    <span class="error-name">${{f.name}}</span>
                    <div class="error-msg">${{f.error}}</div>
                `;
                container.appendChild(div);
            }});
        }}
    </script>
</body>
</html>
"""
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(html_template)
    print(f"[+] Dashboard HTML interactif généré : {output_path}")


def main():
    args = parse_args()

    output_dir = "results"
    os.makedirs(output_dir, exist_ok=True)
    csv_prefix = os.path.join(output_dir, "stress_results")
    html_report = os.path.join(output_dir, "locust_raw_report.html")
    dashboard_path = os.path.join(output_dir, "stress_dashboard.html")
    summary_csv = os.path.join(output_dir, "kpi_rupture_stats.csv")
    summary_md = os.path.join(output_dir, "stress_summary.md")

    cmd = [
        "locust",
        "-f", args.file,
        "--headless",
        "-u", str(args.max_users),
        "-r", str(args.spawn_rate),
        "-t", args.run_time,
        "--host", args.host,
        f"--csv={csv_prefix}",
        f"--html={html_report}"
    ]

    print(f"\n{'='*60}")
    print(f" STRESS TEST LOCUST — OFIKA-C ".center(60, "="))
    print(f"{'='*60}")
    print(f"  Cible          : {args.host}")
    print(f"  Charge max     : {args.max_users} utilisateurs")
    print(f"  Spawn rate     : {args.spawn_rate} users/sec")
    print(f"  Durée          : {args.run_time}")
    print(f"  Seuil p95      : {args.max_latency} ms")
    print(f"  Seuil erreur   : {args.max_error_rate}%")
    print(f"  Confirmation   : {args.confirm_threshold} points consécutifs")
    print(f"{'='*60}\n")

    success = run_locust_command(cmd)
    if not success:
        print("[-] Le stress test a échoué. Vérifiez la configuration.")
        sys.exit(1)

    print("\n[+] Analyse de la courbe de charge et calcul du point de rupture...")

    # Analyse
    history_file = f"{csv_prefix}_stats_history.csv"
    stats_file = f"{csv_prefix}_stats.csv"
    failures_file = f"{csv_prefix}_failures.csv"

    if not os.path.exists(history_file):
        print(f"[-] Fichier d'historique introuvable : {history_file}")
        print("[!] Le test s'est peut-être terminé trop rapidement.")
        sys.exit(1)

    history_data, kpis = analyze_history(history_file, args)
    endpoints_data = parse_endpoints(stats_file)
    failures_data = parse_failures(failures_file)

    # Générer le Dashboard HTML
    generate_html_dashboard(
        dashboard_path, args.host, args.file, args.max_users, args.run_time,
        kpis, history_data, endpoints_data, failures_data
    )

    # Enregistrer le CSV de rupture
    try:
        with open(summary_csv, mode='w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(["Métrique de Rupture", "Valeur", "Description"])
            writer.writerow(["Hôte testé", args.host, "Serveur web analysé"])
            writer.writerow(["Scénario", args.file, "Scénario Locust exécuté"])
            writer.writerow(["Charge max demandée", args.max_users, "Utilisateurs max injectés"])
            writer.writerow(["RPS Max brut", f"{kpis['max_rps']:.2f}", "Débit maximal brut"])
            writer.writerow(["RPS Moyen", f"{kpis['avg_rps']:.2f}", "Débit moyen"])
            writer.writerow([
                "Point de rupture (Users)",
                kpis['break_users'] if kpis['break_users'] else "Non atteint",
                "Nombre d'utilisateurs à la rupture"
            ])
            writer.writerow([
                "Point de rupture (RPS)",
                f"{kpis['break_rps']:.2f}" if kpis['break_rps'] else "Non atteint",
                "RPS à la rupture"
            ])
            writer.writerow(["Limite de sécurité (Users)", kpis['safe_users'], "Charge max stable"])
            writer.writerow(["Limite de sécurité (RPS)", f"{kpis['safe_rps']:.2f}", "Débit max stable"])
            writer.writerow(["p95 Max atteint", f"{kpis['max_p95']:.1f} ms", "Latence p95 maximale"])
        print(f"[+] CSV de rupture enregistré : {summary_csv}")
    except Exception as e:
        print(f"[-] Impossible d'enregistrer le CSV : {e}")

    # Enregistrer le résumé Markdown
    try:
        md_content = (
            f"# 🚀 Résumé du Stress Test — Ofika-c\n\n"
            f"| Métrique | Valeur |\n"
            f"| --- | --- |\n"
            f"| **Hôte testé** | {args.host} |\n"
            f"| **Scénario** | {args.file} |\n"
            f"| **Charge max** | {args.max_users} users |\n"
            f"| **Durée** | {args.run_time} |\n"
            f"| **Limite de sécurité** | {kpis['safe_users']} users |\n"
            f"| **RPS stable** | {kpis['safe_rps']:.2f} req/s |\n"
            f"| **Point de rupture** | {kpis['break_users'] if kpis['break_users'] else 'Non atteint'} users |\n"
            f"| **RPS Max** | {kpis['max_rps']:.2f} req/s |\n"
            f"| **RPS Moyen** | {kpis['avg_rps']:.2f} req/s |\n"
            f"| **p95 Max** | {kpis['max_p95']:.1f} ms |\n\n"
        )
        if kpis['break_users']:
            md_content += f"> ⚠️ **Point de rupture détecté** à {kpis['break_users']} utilisateurs simultanés.\n\n"
        else:
            md_content += f"> ✅ **Le système a supporté la charge complète** de {args.max_users} utilisateurs sans rupture.\n\n"

        with open(summary_md, 'w', encoding='utf-8') as f:
            f.write(md_content)
        print(f"[+] Résumé Markdown enregistré : {summary_md}")
    except Exception as e:
        print(f"[-] Impossible d'enregistrer le résumé Markdown : {e}")

    # Afficher le résultat
    print(f"\n{'='*60}")
    print(f" ANALYSE DE LA LIMITE COMPLÈTE ".center(60, "="))
    print(f"{'='*60}")
    print(f"  Cible                  : {args.host}")
    print(f"  Limite stable (Users)  : {kpis['safe_users']} utilisateurs")
    print(f"  Limite stable (RPS)    : {kpis['safe_rps']:.2f} req/s")
    print(f"  RPS Max brut           : {kpis['max_rps']:.2f} req/s")
    print(f"  RPS Moyen              : {kpis['avg_rps']:.2f} req/s")
    print(f"  p95 Max                : {kpis['max_p95']:.1f} ms")
    if kpis['break_users']:
        print(f"  ⚠️  RUPTURE à           : {kpis['break_users']} users ({kpis['break_rps']:.2f} RPS)")
    else:
        print(f"  ✅  RUPTURE              : Non atteinte (tout a tenu)")
    print(f"{'='*60}")
    print(f"\n📁 Fichiers générés :")
    print(f"   📊 Dashboard HTML  : {dashboard_path}")
    print(f"   📋 CSV KPIs        : {summary_csv}")
    print(f"   📝 Résumé Markdown : {summary_md}")
    print(f"   📄 Rapport Locust  : {html_report}")
    print()


if __name__ == "__main__":
    main()
