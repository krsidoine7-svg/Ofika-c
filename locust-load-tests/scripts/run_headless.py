"""
Script Headless — Test de charge Locust (Mode non interactif)
==============================================================
Lance un test de charge en mode headless (sans interface web),
analyse les résultats CSV et génère un rapport Markdown.

Usage:
  python scripts/run_headless.py -f scenarios/ofika_public.py -u 10 -r 2 -t 2m --host http://localhost:3000
"""
import os
import sys
import argparse
import subprocess
import csv


def parse_args():
    parser = argparse.ArgumentParser(
        description="Lancer un test de charge en mode headless et analyser le CSV généré."
    )
    parser.add_argument("-f", "--file", required=True,
                        help="Chemin du scénario de test (ex: scenarios/ofika_public.py)")
    parser.add_argument("-u", "--users", type=int, default=10,
                        help="Nombre d'utilisateurs simulés")
    parser.add_argument("-r", "--spawn-rate", type=int, default=2,
                        help="Taux d'apparition des utilisateurs par seconde")
    parser.add_argument("-t", "--run-time", default="30s",
                        help="Durée du test (ex: 30s, 2m, 1h)")
    parser.add_argument("--host", required=True,
                        help="URL de l'application cible (ex: http://localhost:3000)")
    parser.add_argument("-o", "--output",
                        help="Chemin du fichier Markdown pour écrire le résumé")
    return parser.parse_args()


def _find_locust_exe() -> str:
    """Cherche locust.exe dans .venv, sinon fallback PATH."""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    root_dir   = os.path.dirname(script_dir)
    candidates = [
        os.path.join(root_dir, ".venv", "Scripts", "locust.exe"),
        os.path.join(root_dir, ".venv", "bin",     "locust"),
    ]
    for path in candidates:
        if os.path.isfile(path):
            return path
    return "locust"


def run_locust_command(cmd):
    """
    Exécute la commande Locust.
    - Résout le chemin vers locust dans .venv
    - Accepte exit code 1 (erreurs HTTP = comportement normal en load test)
    """
    locust_exe = _find_locust_exe()
    if cmd and cmd[0] == "locust":
        cmd = [locust_exe] + cmd[1:]
    else:
        cmd = [locust_exe] + cmd

    print(f"[+] Lancement : {' '.join(cmd[:3])} ...")
    try:
        result = subprocess.run(cmd)
        if result.returncode in (0, 1):
            if result.returncode == 1:
                print("[!] Locust terminé avec des erreurs HTTP (normal en load test)")
            return True
        print(f"[-] Locust a retourné le code {result.returncode}")
        return False
    except FileNotFoundError:
        print(f"[!] '{locust_exe}' introuvable, tentative avec python -m locust...")
        fallback_cmd = [sys.executable, "-m", "locust"] + cmd[1:]
        try:
            result = subprocess.run(fallback_cmd)
            return result.returncode in (0, 1)
        except Exception as e:
            print(f"[-] Erreur lors du lancement de Locust : {e}")
            return False
    except Exception as e:
        print(f"[-] Erreur inattendue : {e}")
        return False


def parse_stats_csv(stats_file):
    """
    Parse le fichier CSV de statistiques Locust et retourne les données agrégées.
    """
    if not os.path.exists(stats_file):
        return None

    try:
        with open(stats_file, mode='r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                if row.get('Name') == 'Aggregated' or row.get('Type') == '':
                    return row
    except Exception as e:
        print(f"[-] Impossible de lire les statistiques : {e}")

    return None


def main():
    args = parse_args()

    # Créer le dossier de sortie
    output_dir = "results"
    os.makedirs(output_dir, exist_ok=True)
    csv_prefix = os.path.join(output_dir, "headless_results")
    html_report = os.path.join(output_dir, "headless_report.html")

    cmd = [
        "locust",
        "-f", args.file,
        "--headless",
        "-u", str(args.users),
        "-r", str(args.spawn_rate),
        "-t", args.run_time,
        "--host", args.host,
        f"--csv={csv_prefix}",
        f"--html={html_report}"
    ]

    print(f"\n{'='*60}")
    print(f" LANCEMENT DU TEST DE CHARGE ".center(60, "="))
    print(f"{'='*60}")
    print(f"  Hôte        : {args.host}")
    print(f"  Scénario    : {args.file}")
    print(f"  Utilisateurs: {args.users}")
    print(f"  Spawn Rate  : {args.spawn_rate}/s")
    print(f"  Durée       : {args.run_time}")
    print(f"{'='*60}\n")

    success = run_locust_command(cmd)
    if not success:
        print("[-] Le test de charge a échoué. Vérifiez la configuration.")
        sys.exit(1)

    print("\n[+] Test de charge terminé. Analyse des résultats...")

    # Analyser les résultats
    stats_file = f"{csv_prefix}_stats.csv"
    summary_data = parse_stats_csv(stats_file)

    if not summary_data:
        print(f"[-] Fichier de résultats introuvable ou vide : {stats_file}")
        print("[!] Le test s'est peut-être terminé trop rapidement pour générer des stats.")
        sys.exit(1)

    # Extraire les métriques
    req_count = summary_data.get('Request Count', '0')
    fail_count = summary_data.get('Failure Count', '0')
    median_latency = summary_data.get('50%', '0')
    p95_latency = summary_data.get('95%', '0')
    p99_latency = summary_data.get('99%', '0')
    avg_latency = summary_data.get('Average Response Time', '0')
    min_latency = summary_data.get('Min Response Time', '0')
    max_latency = summary_data.get('Max Response Time', '0')
    rps_avg = summary_data.get('Current RPS', summary_data.get('Requests/s', '0'))

    # Calculer le taux d'erreur
    try:
        reqs = int(req_count)
        fails = int(fail_count)
        fail_rate = (fails / reqs * 100) if reqs > 0 else 0
    except (ValueError, ZeroDivisionError):
        fail_rate = 0.0

    # Construire le rapport Markdown
    summary_md = (
        f"# 📊 Résumé du Test de Charge Locust — Ofika-c\n\n"
        f"| Métrique | Valeur |\n"
        f"| --- | --- |\n"
        f"| **Hôte testé** | {args.host} |\n"
        f"| **Scénario exécuté** | {args.file} |\n"
        f"| **Utilisateurs simulés** | {args.users} |\n"
        f"| **Durée du test** | {args.run_time} |\n"
        f"| **Requêtes totales** | {req_count} |\n"
        f"| **Requêtes en échec** | {fail_count} ({fail_rate:.2f}%) |\n"
        f"| **RPS Moyen** | {rps_avg} req/s |\n"
        f"| **Temps de réponse Moyen** | {avg_latency} ms |\n"
        f"| **Temps de réponse Min** | {min_latency} ms |\n"
        f"| **Temps de réponse p50** | {median_latency} ms |\n"
        f"| **Temps de réponse p95** | {p95_latency} ms |\n"
        f"| **Temps de réponse p99** | {p99_latency} ms |\n"
        f"| **Temps de réponse Max** | {max_latency} ms |\n\n"
    )

    # Évaluation du résultat
    status = "✅ SUCCÈS"
    notes = []

    if fail_rate > 2.0:
        status = "❌ ÉCHEC"
        notes.append(f"Taux d'erreur critique ({fail_rate:.2f}%) — seuil : 2%")
    elif fail_rate > 1.0:
        status = "⚠️ ATTENTION"
        notes.append(f"Taux d'erreur élevé ({fail_rate:.2f}%) — seuil recommandé : 1%")

    try:
        p95_val = float(p95_latency)
        if p95_val > 2000:
            status = "❌ ÉCHEC"
            notes.append(f"p95 critique ({p95_latency} ms) — seuil : 2000 ms")
        elif p95_val > 1500:
            if status != "❌ ÉCHEC":
                status = "⚠️ ATTENTION"
            notes.append(f"p95 élevé ({p95_latency} ms) — seuil recommandé : 1500 ms")
    except (ValueError, TypeError):
        pass

    summary_md += f"## Statut Global : **{status}**\n\n"
    if notes:
        summary_md += "### Remarques :\n"
        for note in notes:
            summary_md += f"* ⚠️ {note}\n"
    else:
        summary_md += "Le système a supporté la charge avec succès sans erreur significative. 🎉\n"

    summary_md += f"\n---\n\n📁 Fichiers générés :\n"
    summary_md += f"* CSV détaillé : `{stats_file}`\n"
    summary_md += f"* Rapport HTML : `{html_report}`\n"

    # Afficher le résultat dans le terminal
    print(f"\n{'='*60}")
    print(f" RÉSULTATS DU TEST ".center(60, "="))
    print(f"{'='*60}")
    print(f"  Hôte          : {args.host}")
    print(f"  Requêtes      : {req_count} | Échecs : {fail_count} ({fail_rate:.2f}%)")
    print(f"  RPS           : {rps_avg} req/s")
    print(f"  Latence Moy.  : {avg_latency} ms")
    print(f"  Latence p50   : {median_latency} ms")
    print(f"  Latence p95   : {p95_latency} ms")
    print(f"  Latence p99   : {p99_latency} ms")
    print(f"  Latence Max   : {max_latency} ms")
    print(f"  Statut        : {status}")
    print(f"{'='*60}\n")

    # Sauvegarder le rapport Markdown
    if args.output:
        output_path = args.output
    else:
        output_path = os.path.join(output_dir, "headless_summary.md")

    try:
        with open(output_path, 'w', encoding='utf-8') as out_f:
            out_f.write(summary_md)
        print(f"[+] Résumé Markdown enregistré : {output_path}")
    except Exception as e:
        print(f"[-] Impossible d'enregistrer le résumé : {e}")

    print(f"[+] Rapport HTML disponible   : {html_report}")


if __name__ == "__main__":
    main()
