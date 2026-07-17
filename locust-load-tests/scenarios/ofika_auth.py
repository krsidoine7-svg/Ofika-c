"""
Scénario 2 — Authentification Supabase + Dashboard Ofika-c
===========================================================
Simule la connexion d'un utilisateur via l'API Supabase Auth
(grant_type=password), puis la navigation dans les pages protégées
du tableau de bord (dashboard).
Calibré pour des tests de 10 à 1000 utilisateurs simultanés.
"""
import os
# pyrefly: ignore [missing-import]
from locust import HttpUser, task, between


# Récupération de l'URL Supabase depuis les variables d'environnement
# En fallback, utilise l'URL du fichier .env.local du projet
SUPABASE_URL = os.getenv(
    "NEXT_PUBLIC_SUPABASE_URL",
    "https://graqvtzmefiwsafaubcw.supabase.co"
)
SUPABASE_ANON_KEY = os.getenv(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "sb_publishable_iY156nvEphMFhmxVlMc5DA_19C5iuuh"
)


class OfikaAuthUser(HttpUser):
    """
    Utilisateur virtuel qui se connecte via Supabase Auth
    et navigue dans le dashboard protégé.
    """
    wait_time = between(2, 5)

    # Identifiants de test — remplacez par un vrai compte de test Supabase
    TEST_EMAIL = os.getenv("LOCUST_TEST_EMAIL", "user1@test-ofika.com")
    TEST_PASSWORD = os.getenv("LOCUST_TEST_PASSWORD", "TestPassword123!")

    def on_start(self):
        """
        Authentification au démarrage de chaque utilisateur virtuel.
        Utilise l'API Supabase GoTrue directement pour obtenir un JWT.
        """
        auth_url = f"{SUPABASE_URL}/auth/v1/token?grant_type=password"

        headers = {
            "Content-Type": "application/json",
            "apikey": SUPABASE_ANON_KEY,
        }

        payload = {
            "email": self.TEST_EMAIL,
            "password": self.TEST_PASSWORD,
        }

        with self.client.post(
            auth_url,
            json=payload,
            headers=headers,
            catch_response=True,
            name="[Supabase] Auth Login"
        ) as response:
            if response.status_code == 200:
                data = response.json()
                access_token = data.get("access_token", "")
                if access_token:
                    # Injecter le token JWT dans tous les headers HTTP futurs
                    self.client.headers.update({
                        "Authorization": f"Bearer {access_token}",
                    })
                    response.success()
                else:
                    response.failure("Auth réussie mais access_token absent dans la réponse")
            else:
                error_msg = "Inconnu"
                try:
                    error_msg = response.json().get("error_description", response.text[:200])
                except Exception:
                    error_msg = response.text[:200]
                response.failure(f"Auth échouée ({response.status_code}): {error_msg}")

    @task(4)
    def dashboard_home(self):
        """Page principale du tableau de bord"""
        with self.client.get("/dashboard", catch_response=True, name="/dashboard") as response:
            if response.status_code in (200, 301, 302, 307, 308):
                response.success()
            else:
                response.failure(f"Dashboard — code : {response.status_code}")

    @task(3)
    def dashboard_profiles(self):
        """Gestion des profils (cards numériques)"""
        with self.client.get(
            "/dashboard/profiles",
            catch_response=True,
            name="/dashboard/profiles"
        ) as response:
            if response.status_code in (200, 301, 302, 307, 308):
                response.success()
            else:
                response.failure(f"Profiles — code : {response.status_code}")

    @task(3)
    def dashboard_analytics(self):
        """Page d'analytics et statistiques"""
        with self.client.get(
            "/dashboard/analytics",
            catch_response=True,
            name="/dashboard/analytics"
        ) as response:
            if response.status_code in (200, 301, 302, 307, 308):
                response.success()
            else:
                response.failure(f"Analytics — code : {response.status_code}")

    @task(2)
    def dashboard_contacts(self):
        """Carnet de contacts collectés"""
        with self.client.get(
            "/dashboard/contacts",
            catch_response=True,
            name="/dashboard/contacts"
        ) as response:
            if response.status_code in (200, 301, 302, 307, 308):
                response.success()
            else:
                response.failure(f"Contacts — code : {response.status_code}")

    @task(2)
    def dashboard_orders(self):
        """Historique des commandes"""
        with self.client.get(
            "/dashboard/orders",
            catch_response=True,
            name="/dashboard/orders"
        ) as response:
            if response.status_code in (200, 301, 302, 307, 308):
                response.success()
            else:
                response.failure(f"Orders — code : {response.status_code}")

    @task(2)
    def dashboard_qr_codes(self):
        """Gestion des QR codes"""
        with self.client.get(
            "/dashboard/qr-codes",
            catch_response=True,
            name="/dashboard/qr-codes"
        ) as response:
            if response.status_code in (200, 301, 302, 307, 308):
                response.success()
            else:
                response.failure(f"QR Codes — code : {response.status_code}")

    @task(1)
    def dashboard_settings(self):
        """Paramètres du compte"""
        with self.client.get(
            "/dashboard/settings",
            catch_response=True,
            name="/dashboard/settings"
        ) as response:
            if response.status_code in (200, 301, 302, 307, 308):
                response.success()
            else:
                response.failure(f"Settings — code : {response.status_code}")

    @task(1)
    def dashboard_avis_clients(self):
        """Gestion des avis clients"""
        with self.client.get(
            "/dashboard/avis-clients",
            catch_response=True,
            name="/dashboard/avis-clients"
        ) as response:
            if response.status_code in (200, 301, 302, 307, 308):
                response.success()
            else:
                response.failure(f"Avis clients — code : {response.status_code}")
