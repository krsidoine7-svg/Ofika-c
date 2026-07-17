"""
Script de création des comptes de test Locust dans Supabase
===========================================================
Crée les utilisateurs définis dans data/users.csv via l'Admin API Supabase.
Nécessite la SUPABASE_SERVICE_ROLE_KEY.

Usage :
    python scripts/create_test_users.py
"""
import sys
import csv
import json
import os
import urllib.request
import urllib.error

# ─── Configuration ────────────────────────────────────────────────────────────
SUPABASE_URL = "https://graqvtzmefiwsafaubcw.supabase.co"
SERVICE_ROLE_KEY = "sb_secret__PHfikHw86k3-8HbUiRajQ_yd7Ssjbu"
USERS_CSV = os.path.join(os.path.dirname(__file__), "..", "data", "users.csv")

HEADERS = {
    "Content-Type": "application/json",
    "apikey": SERVICE_ROLE_KEY,
    "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
}


def http_request(method: str, url: str, data: dict | None = None) -> tuple[int, dict]:
    """Effectue une requête HTTP simple sans dépendances externes."""
    body = json.dumps(data).encode("utf-8") if data else None
    req = urllib.request.Request(url, data=body, headers=HEADERS, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        try:
            return e.code, json.loads(e.read().decode("utf-8"))
        except Exception:
            return e.code, {"error": str(e)}


def load_users() -> list[dict]:
    """Charge la liste des utilisateurs depuis data/users.csv."""
    users = []
    with open(USERS_CSV, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            email = row.get("email", "").strip()
            password = row.get("password", "").strip()
            if email and password:
                users.append({"email": email, "password": password})
    return users


def create_user(email: str, password: str) -> tuple[bool, str]:
    """
    Crée un utilisateur via l'API Admin Supabase.
    Si l'utilisateur existe déjà, tente de mettre à jour son mot de passe.
    """
    url = f"{SUPABASE_URL}/auth/v1/admin/users"
    payload = {
        "email": email,
        "password": password,
        "email_confirm": True,       # Confirme l'email automatiquement
        "user_metadata": {
            "display_name": f"Test User ({email.split('@')[0]})",
            "is_test_account": True,
        },
    }

    status, body = http_request("POST", url, payload)

    if status == 200 or status == 201:
        return True, f"✅ Créé — {email}"

    if status == 422:
        # Utilisateur déjà existant → mise à jour du mot de passe
        user_id = body.get("user", {}).get("id")
        if not user_id:
            # On liste les utilisateurs pour trouver l'ID
            list_status, list_body = http_request(
                "GET", f"{SUPABASE_URL}/auth/v1/admin/users?email={email}"
            )
            users_list = list_body.get("users", [])
            if users_list:
                user_id = users_list[0].get("id")

        if user_id:
            upd_status, upd_body = http_request(
                "PUT",
                f"{SUPABASE_URL}/auth/v1/admin/users/{user_id}",
                {"password": password, "email_confirm": True},
            )
            if upd_status == 200:
                return True, f"🔄 Mis à jour — {email}"
            return False, f"❌ Mise à jour échouée ({upd_status}) — {upd_body}"

        return True, f"⚠️  Déjà existant (ID inconnu) — {email}"

    return False, f"❌ Erreur {status} — {body.get('msg') or body.get('message') or body}"


def verify_login(email: str, password: str) -> bool:
    """Vérifie que le compte créé peut bien se connecter."""
    url = f"{SUPABASE_URL}/auth/v1/token?grant_type=password"
    headers_auth = {
        "Content-Type": "application/json",
        "apikey": SERVICE_ROLE_KEY,
    }
    payload = {"email": email, "password": password}
    body_bytes = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=body_bytes, headers=headers_auth, method="POST")
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return bool(data.get("access_token"))
    except Exception:
        return False


def main():
    print("=" * 60)
    print("  CRÉATION DES COMPTES DE TEST LOCUST — OFIKA-C")
    print("=" * 60)
    print(f"\n  Supabase URL : {SUPABASE_URL}")
    print(f"  Fichier CSV  : {os.path.abspath(USERS_CSV)}\n")

    users = load_users()
    if not users:
        print("[-] Aucun utilisateur trouvé dans data/users.csv")
        sys.exit(1)

    print(f"[+] {len(users)} utilisateur(s) à créer\n")

    success_count = 0
    for user in users:
        ok, msg = create_user(user["email"], user["password"])
        print(f"  {msg}")
        if ok:
            success_count += 1

    print(f"\n{'=' * 60}")
    print(f"  {success_count}/{len(users)} comptes prêts")

    # Vérification de login pour chaque compte créé avec succès
    print("\n[+] Vérification des connexions...\n")
    verified = 0
    for user in users:
        ok = verify_login(user["email"], user["password"])
        status = "✅ Login OK" if ok else "❌ Login ECHEC"
        print(f"  {status} — {user['email']}")
        if ok:
            verified += 1

    print(f"\n  {verified}/{len(users)} comptes vérifiés avec succès")
    print("=" * 60)

    if verified < len(users):
        print("\n⚠️  Certains comptes ne peuvent pas se connecter.")
        print("   Vérifiez que SUPABASE_SERVICE_ROLE_KEY est correcte.")
        sys.exit(1)
    else:
        print("\n✅ Tous les comptes sont prêts pour les tests de charge !")
        print("=" * 60 + "\n")


if __name__ == "__main__":
    main()
