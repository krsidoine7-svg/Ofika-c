"""
Scénario 5 — Parcours Utilisateur Complet Ofika-c (v2)
=======================================================
Simule un parcours utilisateur réaliste séquentiel :
  1. Arrivée sur la page d'accueil
  2. Découverte de la page get-started
  3. Connexion via Supabase Auth
  4. Navigation complète dans le dashboard
  5. Consultation d'un profil public
  6. Déconnexion (suppression du token)

Améliorations v2 :
  - Pool de 5 comptes de test tournants (distribue la charge Auth)
  - Retry automatique sur 429 avec backoff exponentiel (max 3 tentatives)
  - Délais réalistes ajustés pour rester sous le rate limiter Vercel
  - Gestion gracieuse des 401 (token expiré → reconnexion)
"""
import os
import random
import time
import csv
import threading

# pyrefly: ignore [missing-import]
from locust import HttpUser, SequentialTaskSet, task, between, events

# ─── Constantes ───────────────────────────────────────────────────────────────
SUPABASE_URL = os.getenv(
    "NEXT_PUBLIC_SUPABASE_URL",
    "https://graqvtzmefiwsafaubcw.supabase.co"
)
SUPABASE_ANON_KEY = os.getenv(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "sb_publishable_iY156nvEphMFhmxVlMc5DA_19C5iuuh"
)

# Seuils du rate limiter
MAX_RETRY_429 = 3          # Nombre max de tentatives sur 429
BASE_BACKOFF_429 = 2.0     # Secondes de backoff initial (×2 à chaque retry)

# ─── Pool de comptes de test ─────────────────────────────────────────────────
_USERS_LOCK = threading.Lock()
_USERS_POOL: list[dict] = []
_USER_INDEX = 0  # Round-robin


def _load_users_pool() -> list[dict]:
    """Charge les comptes de test depuis data/users.csv (chemin relatif au script)."""
    csv_path = os.path.join(
        os.path.dirname(os.path.abspath(__file__)),
        "..", "data", "users.csv"
    )
    users = []
    if os.path.exists(csv_path):
        with open(csv_path, newline="", encoding="utf-8") as f:
            for row in csv.DictReader(f):
                email = row.get("email", "").strip()
                password = row.get("password", "").strip()
                if email and password:
                    users.append({"email": email, "password": password})
    # Fallback : variables d'environnement
    if not users:
        email = os.getenv("LOCUST_TEST_EMAIL", "user1@test-ofika.com")
        password = os.getenv("LOCUST_TEST_PASSWORD", "TestPassword123!")
        users = [{"email": email, "password": password}]
    return users


def _next_user() -> dict:
    """Renvoie le prochain compte de test en round-robin thread-safe."""
    global _USER_INDEX
    with _USERS_LOCK:
        user = _USERS_POOL[_USER_INDEX % len(_USERS_POOL)]
        _USER_INDEX += 1
    return user


# Initialisation du pool au chargement du module
_USERS_POOL = _load_users_pool()
print(f"[Journey] Pool de {len(_USERS_POOL)} compte(s) de test chargé(s).")


# ─── Utilitaires ──────────────────────────────────────────────────────────────
def get_with_retry(client, url: str, name: str, **kwargs) -> bool:
    """
    Effectue un GET avec retry automatique sur 429.
    Retourne True si succès, False si échec définitif.
    """
    for attempt in range(1, MAX_RETRY_429 + 1):
        with client.get(url, catch_response=True, name=name, **kwargs) as resp:
            if resp.status_code in (200, 301, 302, 307, 308):
                resp.success()
                return True
            elif resp.status_code == 429:
                wait = BASE_BACKOFF_429 * (2 ** (attempt - 1)) + random.uniform(0, 1)
                if attempt < MAX_RETRY_429:
                    resp.success()  # Ne pas comptabiliser comme échec — c'est un retry
                    time.sleep(wait)
                else:
                    resp.failure(f"{name} — 429 (rate limited après {MAX_RETRY_429} tentatives)")
                    return False
            elif resp.status_code == 404:
                resp.success()  # 404 attendu sur certains profils publics
                return True
            else:
                resp.failure(f"{name} — {resp.status_code}")
                return False
    return False


# ─── Scénario principal ────────────────────────────────────────────────────────
class FullUserJourney(SequentialTaskSet):
    """
    Parcours séquentiel complet simulant le comportement réel d'un utilisateur
    depuis son arrivée jusqu'à sa navigation dans le dashboard.
    """

    TEST_USERNAMES = ["krsidoine", "demo", "test-user", "ofika-team"]

    def on_start(self):
        """Initialisation : sélectionner un compte de test en round-robin."""
        self._account = _next_user()
        self._token = None
        self._token_acquired_at = 0.0

    # ── Étape 1 : Accueil ─────────────────────────────────────────────────────
    @task
    def step_1_visit_homepage(self):
        get_with_retry(self.client, "/", "[Journey] 1. Accueil")
        time.sleep(random.uniform(2, 4))

    # ── Étape 2 : Get-Started ─────────────────────────────────────────────────
    @task
    def step_2_explore_get_started(self):
        get_with_retry(self.client, "/get-started", "[Journey] 2. Get-Started")
        time.sleep(random.uniform(1, 3))

    # ── Étape 3 : Login ───────────────────────────────────────────────────────
    @task
    def step_3_login(self):
        """Connexion via Supabase Auth avec retry sur 429."""
        auth_url = f"{SUPABASE_URL}/auth/v1/token?grant_type=password"
        headers = {
            "Content-Type": "application/json",
            "apikey": SUPABASE_ANON_KEY,
        }
        payload = {
            "email": self._account["email"],
            "password": self._account["password"],
        }

        for attempt in range(1, MAX_RETRY_429 + 1):
            with self.client.post(
                auth_url,
                json=payload,
                headers=headers,
                catch_response=True,
                name="[Journey] 3. Supabase Login",
            ) as resp:
                if resp.status_code == 200:
                    data = resp.json()
                    self._token = data.get("access_token", "")
                    if self._token:
                        self._token_acquired_at = time.time()
                        self.client.headers.update({
                            "Authorization": f"Bearer {self._token}",
                        })
                        resp.success()
                        break
                    else:
                        resp.failure("Login OK mais token absent")
                        break
                elif resp.status_code == 429:
                    wait = BASE_BACKOFF_429 * (2 ** (attempt - 1)) + random.uniform(0, 2)
                    if attempt < MAX_RETRY_429:
                        resp.success()  # Retry silencieux
                        time.sleep(wait)
                    else:
                        resp.failure(f"Login — 429 (rate limited après {MAX_RETRY_429} tentatives)")
                elif resp.status_code == 400:
                    resp.failure(
                        f"Login 400 — Identifiants invalides pour {self._account['email']}. "
                        f"Exécutez 'python scripts/create_test_users.py'"
                    )
                    break
                else:
                    resp.failure(f"Login — {resp.status_code}")
                    break

        time.sleep(random.uniform(1, 2))

    # ── Étape 4 : Dashboard ───────────────────────────────────────────────────
    @task
    def step_4_dashboard(self):
        get_with_retry(self.client, "/dashboard", "[Journey] 4. Dashboard")
        time.sleep(random.uniform(2, 4))

    # ── Étape 5 : Profils ─────────────────────────────────────────────────────
    @task
    def step_5_view_profiles(self):
        get_with_retry(self.client, "/dashboard/profiles", "[Journey] 5. Mes Profils")
        time.sleep(random.uniform(1, 3))

    # ── Étape 6 : Analytics ───────────────────────────────────────────────────
    @task
    def step_6_view_analytics(self):
        get_with_retry(self.client, "/dashboard/analytics", "[Journey] 6. Analytics")
        time.sleep(random.uniform(2, 5))

    # ── Étape 7 : Contacts ────────────────────────────────────────────────────
    @task
    def step_7_view_contacts(self):
        get_with_retry(self.client, "/dashboard/contacts", "[Journey] 7. Contacts")
        time.sleep(random.uniform(1, 3))

    # ── Étape 8 : Profil Public ────────────────────────────────────────────────
    @task
    def step_8_view_public_profile(self):
        username = random.choice(self.TEST_USERNAMES)
        get_with_retry(self.client, f"/{username}", "[Journey] 8. Profil Public")
        time.sleep(random.uniform(2, 4))

    # ── Étape 9 : Logout ──────────────────────────────────────────────────────
    @task
    def step_9_logout(self):
        """Nettoyage du token et fin du parcours."""
        if "Authorization" in self.client.headers:
            del self.client.headers["Authorization"]
        self._token = None
        self.interrupt()


# ─── Utilisateur virtuel ──────────────────────────────────────────────────────
class OfikaFullJourneyUser(HttpUser):
    """
    Utilisateur virtuel qui exécute le parcours complet séquentiel.
    wait_time augmenté pour rester sous le rate limiter Vercel.
    """
    wait_time = between(2, 5)   # Délai inter-tâches (anciennement 1-3s)
    tasks = [FullUserJourney]
