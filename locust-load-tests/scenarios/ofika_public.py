"""
Scénario 1 — Navigation Publique Ofika-c
=========================================
Simule la visite des pages publiques accessibles sans authentification.
Couvre la page d'accueil, les pages statiques et les profils publics.
Calibré pour des tests de 10 à 1000 utilisateurs simultanés.
"""
import random
# pyrefly: ignore [missing-import]
from locust import HttpUser, task, between


class OfikaPublicUser(HttpUser):
    """
    Utilisateur virtuel qui navigue sur les pages publiques d'Ofika-c.
    Pondération basée sur le trafic réel estimé.
    """
    # Temps de réflexion réaliste entre chaque action (1 à 4 secondes)
    wait_time = between(1, 4)

    # Liste de usernames de test pour simuler la consultation de profils publics
    TEST_USERNAMES = [
        "krsidoine", "demo", "test-user", "ofika-team",
        "john-doe", "jane-doe", "startup-ci", "entrepreneur"
    ]

    @task(5)
    def homepage(self):
        """Visite de la page d'accueil — trafic le plus élevé"""
        with self.client.get("/", catch_response=True, name="/ (Accueil)") as response:
            if response.status_code in (200, 429):
                response.success()
            elif response.status_code in (301, 302, 307, 308):
                # Les redirections Next.js sont normales
                response.success()
            else:
                response.failure(f"Page d'accueil — code inattendu : {response.status_code}")

    @task(3)
    def get_started_page(self):
        """Page d'inscription / onboarding — trafic élevé (conversion)"""
        with self.client.get("/get-started", catch_response=True, name="/get-started") as response:
            if response.status_code in (200, 301, 302, 307, 308, 429):
                response.success()
            else:
                response.failure(f"Get-started — code : {response.status_code}")

    @task(2)
    def alternatives_page(self):
        """Page alternatives concurrentielles"""
        with self.client.get("/alternatives", catch_response=True, name="/alternatives") as response:
            if response.status_code in (200, 301, 302, 307, 308, 429):
                response.success()
            else:
                response.failure(f"Alternatives — code : {response.status_code}")

    @task(2)
    def avis_page(self):
        """Page des avis clients publics"""
        with self.client.get("/avis", catch_response=True, name="/avis") as response:
            if response.status_code in (200, 301, 302, 307, 308, 429):
                response.success()
            else:
                response.failure(f"Avis — code : {response.status_code}")

    @task(3)
    def public_profile(self):
        """Consultation d'un profil public utilisateur (route dynamique [username])"""
        username = random.choice(self.TEST_USERNAMES)
        with self.client.get(
            f"/{username}",
            catch_response=True,
            name="/[username] (Profil public)"
        ) as response:
            if response.status_code in (200, 301, 302, 307, 308, 404, 429):
                # 404 est normal si le username n'existe pas, 429 est le rate limiting
                response.success()
            else:
                response.failure(f"Profil {username} — code : {response.status_code}")

    @task(1)
    def privacy_page(self):
        """Politique de confidentialité"""
        with self.client.get("/privacy", catch_response=True, name="/privacy") as response:
            if response.status_code in (200, 301, 302, 307, 308, 429):
                response.success()
            else:
                response.failure(f"Privacy — code : {response.status_code}")

    @task(1)
    def terms_page(self):
        """Conditions d'utilisation"""
        with self.client.get("/terms", catch_response=True, name="/terms") as response:
            if response.status_code in (200, 301, 302, 307, 308, 429):
                response.success()
            else:
                response.failure(f"Terms — code : {response.status_code}")

    @task(1)
    def card_page(self):
        """Page de commande de carte NFC"""
        with self.client.get("/card", catch_response=True, name="/card") as response:
            if response.status_code in (200, 301, 302, 307, 308, 429):
                response.success()
            else:
                response.failure(f"Card — code : {response.status_code}")
