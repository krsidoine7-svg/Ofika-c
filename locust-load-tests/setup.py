"""
Script d'installation automatique pour les tests de charge Locust — Ofika-c
=============================================================================
Crée un environnement virtuel (.venv), installe Locust et ses dépendances.
Usage : python setup.py
"""
import os
import sys
import subprocess
import venv


def log(message):
    print(f"\n[+] {message}")


def log_error(message):
    print(f"\n[-] ERROR: {message}", file=sys.stderr)


def main():
    log("Vérification de la version de Python...")
    if sys.version_info < (3, 10):
        log_error("Locust nécessite Python 3.10 ou supérieur. Veuillez installer une version plus récente.")
        sys.exit(1)

    log(f"Python {sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro} détecté ✓")

    template_dir = os.path.dirname(os.path.abspath(__file__))
    log(f"Configuration dans : {template_dir}")

    # 1. Création de l'environnement virtuel (.venv)
    venv_dir = os.path.join(template_dir, ".venv")
    if not os.path.exists(venv_dir):
        log("Création de l'environnement virtuel (.venv)...")
        try:
            venv.create(venv_dir, with_pip=True)
            log("Environnement virtuel créé avec succès ✓")
        except Exception as e:
            log_error(f"Impossible de créer le venv : {e}")
            sys.exit(1)
    else:
        log("L'environnement virtuel (.venv) existe déjà. Étape ignorée ✓")

    # Résolution des exécutables selon l'OS
    is_windows = os.name == 'nt'
    python_exe = os.path.join(venv_dir, "Scripts", "python.exe") if is_windows else os.path.join(venv_dir, "bin", "python")
    pip_exe = os.path.join(venv_dir, "Scripts", "pip.exe") if is_windows else os.path.join(venv_dir, "bin", "pip")

    # 2. Mise à jour de pip
    log("Mise à jour de pip...")
    try:
        subprocess.run([python_exe, "-m", "pip", "install", "--upgrade", "pip"], check=True, capture_output=True)
        log("pip mis à jour ✓")
    except Exception:
        log("Mise à jour de pip ignorée (non critique)")

    # 3. Installation des dépendances depuis requirements.txt
    req_file = os.path.join(template_dir, "requirements.txt")
    if os.path.exists(req_file):
        log("Installation des dépendances depuis requirements.txt...")
        try:
            subprocess.run([pip_exe, "install", "-r", req_file], check=True)
            log("Dépendances installées avec succès ✓")
        except subprocess.CalledProcessError as e:
            log_error(f"Échec de l'installation des dépendances : {e}")
            sys.exit(1)
    else:
        log("Installation de locust en direct (requirements.txt non trouvé)...")
        try:
            subprocess.run([pip_exe, "install", "locust"], check=True)
            log("Locust installé avec succès ✓")
        except Exception as e:
            log_error(f"Erreur d'installation : {e}")
            sys.exit(1)

    # 4. Créer le dossier results/ s'il n'existe pas
    results_dir = os.path.join(template_dir, "results")
    os.makedirs(results_dir, exist_ok=True)

    # 5. Vérifier que Locust est correctement installé
    locust_exe = os.path.join(venv_dir, "Scripts", "locust.exe") if is_windows else os.path.join(venv_dir, "bin", "locust")
    if os.path.exists(locust_exe):
        log("Locust est correctement installé ✓")
    else:
        log("Locust installé via le module Python (python -m locust)")

    print("\n" + "=" * 60)
    print(" CONFIGURATION COMPLÈTE AVEC SUCCÈS ! ✓".center(60))
    print("=" * 60)

    print("\n📋 Pour commencer à tester Ofika-c :\n")

    if is_windows:
        print("  1. Activez l'environnement virtuel :")
        print("     .venv\\Scripts\\Activate.ps1\n")
    else:
        print("  1. Activez l'environnement virtuel :")
        print("     source .venv/bin/activate\n")

    print("  2. Lancez un des scénarios :\n")
    print("     📄 Pages publiques     : locust -f scenarios/ofika_public.py")
    print("     🔐 Auth + Dashboard    : locust -f scenarios/ofika_auth.py")
    print("     🌐 APIs Publiques      : locust -f scenarios/ofika_api_public.py")
    print("     💾 APIs Intensives DB  : locust -f scenarios/ofika_api_heavy.py")
    print("     🚶 Parcours Complet    : locust -f scenarios/ofika_full_journey.py\n")
    print("  3. Ouvrez http://localhost:8089 dans votre navigateur.\n")
    print("  4. Ou lancez en mode headless (automatique) :")
    print("     python scripts/run_headless.py -f scenarios/ofika_public.py -u 10 -r 2 -t 2m --host http://localhost:3000\n")
    print("  5. Stress test (10 → 1000 users) :")
    print("     python scripts/run_stress_test.py -f scenarios/ofika_public.py -u 1000 -r 10 -t 10m --host http://localhost:3000\n")
    print("=" * 60 + "\n")


if __name__ == "__main__":
    main()
