"""
Scénario 3 — APIs Publiques Ofika-c
=====================================
Simule les requêtes vers les endpoints API publics (sans authentification).
Couvre le tracking analytics, la lecture de profils publics et les avis.
Calibré pour des tests de 10 à 1000 utilisateurs simultanés.
"""
import random
import uuid
# pyrefly: ignore [missing-import]
from locust import HttpUser, task, between


class OfikaPublicApiUser(HttpUser):
    """
    Utilisateur virtuel qui appelle les APIs publiques d'Ofika-c.
    Simule les appels effectués par les visiteurs anonymes consultant
    des profils publics et déclenchant des événements de tracking.
    """
    wait_time = between(1, 3)

    # IDs de profils de test (UUIDs aléatoires ou existants)
    TEST_PROFILE_IDS = [
        "test-profile-1", "test-profile-2", "test-profile-3",
        "test-profile-4", "test-profile-5"
    ]

    # IDs de liens de reviews (simulés)
    TEST_REVIEW_LINK_IDS = [
        "review-link-1", "review-link-2", "review-link-3"
    ]

    @task(5)
    def track_profile_view(self):
        """
        Tracking d'événement de vue de profil.
        C'est l'API la plus sollicitée car chaque visite de profil
        déclenche un appel de tracking.
        """
        profile_id = random.choice(self.TEST_PROFILE_IDS)
        payload = {
            "profileId": profile_id,
            "event": "profile_view",
            "referrer": random.choice([
                "direct", "google", "instagram", "linkedin",
                "facebook", "qr_code", "nfc_card", "whatsapp"
            ]),
            "userAgent": "Mozilla/5.0 (Load Test Locust)",
            "sessionId": str(uuid.uuid4()),
        }

        with self.client.post(
            "/api/analytics/track",
            json=payload,
            catch_response=True,
            name="/api/analytics/track"
        ) as response:
            if response.status_code in (200, 201, 204):
                response.success()
            elif response.status_code == 429:
                # Rate limiting — c'est normal sous forte charge
                response.success()
            else:
                response.failure(f"Track — code : {response.status_code}")

    @task(4)
    def track_link_click(self):
        """
        Tracking d'un clic sur un lien dans un profil public.
        Deuxième API la plus sollicitée.
        """
        payload = {
            "profileId": random.choice(self.TEST_PROFILE_IDS),
            "linkType": random.choice([
                "whatsapp", "instagram", "linkedin", "website",
                "phone", "email", "facebook", "tiktok"
            ]),
            "sessionId": str(uuid.uuid4()),
        }

        with self.client.post(
            "/api/analytics/link-click",
            json=payload,
            catch_response=True,
            name="/api/analytics/link-click"
        ) as response:
            if response.status_code in (200, 201, 204):
                response.success()
            elif response.status_code == 429:
                response.success()
            else:
                response.failure(f"Link-click — code : {response.status_code}")

    @task(3)
    def get_public_profile(self):
        """
        Récupération des données d'un profil public via l'API.
        """
        profile_id = random.choice(self.TEST_PROFILE_IDS)
        with self.client.get(
            f"/api/public/profiles/{profile_id}",
            catch_response=True,
            name="/api/public/profiles/[id]"
        ) as response:
            if response.status_code in (200, 404):
                # 404 est normal pour un ID de test inexistant
                response.success()
            elif response.status_code == 429:
                response.success()
            else:
                response.failure(f"Public profile — code : {response.status_code}")

    @task(2)
    def get_reviews(self):
        """
        Lecture des avis publics d'un profil.
        """
        link_id = random.choice(self.TEST_REVIEW_LINK_IDS)
        with self.client.get(
            f"/api/reviews/{link_id}",
            catch_response=True,
            name="/api/reviews/[linkId]"
        ) as response:
            if response.status_code in (200, 404):
                response.success()
            elif response.status_code == 429:
                response.success()
            else:
                response.failure(f"Reviews — code : {response.status_code}")

    @task(1)
    def get_templates(self):
        """
        Récupération de la liste des templates de cartes.
        """
        with self.client.get(
            "/api/templates",
            catch_response=True,
            name="/api/templates"
        ) as response:
            if response.status_code in (200, 404):
                response.success()
            elif response.status_code == 429:
                response.success()
            else:
                response.failure(f"Templates — code : {response.status_code}")
