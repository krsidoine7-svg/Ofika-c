"""
Scénario 4 — APIs Intensives avec Charge DB — Ofika-c
=======================================================
Simule des requêtes authentifiées vers les endpoints API lourds
qui impliquent des opérations intensives en base de données :
lectures avec jointures, agrégations analytics, et écritures.
Calibré pour des tests de 10 à 1000 utilisateurs simultanés.
"""
import os
import random
import uuid
# pyrefly: ignore [missing-import]
from locust import HttpUser, task, between


SUPABASE_URL = os.getenv(
    "NEXT_PUBLIC_SUPABASE_URL",
    "https://graqvtzmefiwsafaubcw.supabase.co"
)
SUPABASE_ANON_KEY = os.getenv(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "sb_publishable_iY156nvEphMFhmxVlMc5DA_19C5iuuh"
)


class OfikaHeavyApiUser(HttpUser):
    """
    Utilisateur virtuel authentifié qui exerce une charge intensive
    sur les APIs nécessitant des opérations de base de données lourdes.
    """
    wait_time = between(2, 5)

    TEST_EMAIL = os.getenv("LOCUST_TEST_EMAIL", "user1@test-ofika.com")
    TEST_PASSWORD = os.getenv("LOCUST_TEST_PASSWORD", "TestPassword123!")

    # IDs de profils simulés pour les requêtes paramétriques
    TEST_PROFILE_IDS = [
        "test-profile-1", "test-profile-2", "test-profile-3",
        "test-profile-4", "test-profile-5"
    ]

    # Données pour les avis de test
    REVIEW_COMMENTS = [
        "Excellent service, carte NFC top !",
        "Professionnel et rapide, je recommande.",
        "Très pratique pour partager mes contacts.",
        "Design élégant et interface intuitive.",
        "Parfait pour mon activité freelance.",
        "Bonne qualité, livraison rapide !",
        "Test automatisé de charge — commentaire.",
        "Super produit, je suis très satisfait.",
    ]

    REVIEWER_NAMES = [
        "Jean Dupont", "Marie Claire", "Amadou Diallo",
        "Fatou Koné", "Yao Kouassi", "Aya Traoré",
        "Pierre Martin", "Sophie Bernard",
    ]

    def on_start(self):
        """
        Authentification Supabase au démarrage de chaque utilisateur virtuel.
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
            name="[Supabase] Auth Login (Heavy)"
        ) as response:
            if response.status_code == 200:
                data = response.json()
                access_token = data.get("access_token", "")
                if access_token:
                    self.client.headers.update({
                        "Authorization": f"Bearer {access_token}",
                    })
                    response.success()
                else:
                    response.failure("Auth OK mais access_token absent")
            else:
                error_msg = "Inconnu"
                try:
                    error_msg = response.json().get("error_description", response.text[:200])
                except Exception:
                    error_msg = response.text[:200]
                response.failure(f"Auth échouée ({response.status_code}): {error_msg}")

    @task(4)
    def get_profiles_list(self):
        """
        Récupération de la liste des profils de l'utilisateur.
        Requête impliquant des jointures (templates, liens, stats).
        """
        with self.client.get(
            "/api/profiles",
            catch_response=True,
            name="/api/profiles (GET)"
        ) as response:
            if response.status_code in (200, 401, 403):
                response.success()
            elif response.status_code == 429:
                response.success()
            else:
                response.failure(f"Profiles list — code : {response.status_code}")

    @task(3)
    def get_contacts(self):
        """
        Récupération des contacts collectés pour un profil donné.
        Charge DB : lecture avec pagination potentielle de nombreux contacts.
        """
        profile_id = random.choice(self.TEST_PROFILE_IDS)
        with self.client.get(
            f"/api/contacts/{profile_id}",
            catch_response=True,
            name="/api/contacts/[profileId]"
        ) as response:
            if response.status_code in (200, 401, 403, 404):
                response.success()
            elif response.status_code == 429:
                response.success()
            else:
                response.failure(f"Contacts — code : {response.status_code}")

    @task(5)
    def post_analytics_tracking(self):
        """
        Écriture massive d'événements analytics.
        C'est l'opération d'écriture la plus fréquente en production.
        Stress DB via INSERT en continu.
        """
        profile_id = random.choice(self.TEST_PROFILE_IDS)
        payload = {
            "profileId": profile_id,
            "event": random.choice([
                "profile_view", "link_click", "contact_saved",
                "qr_scan", "nfc_tap", "vcard_download"
            ]),
            "referrer": random.choice([
                "direct", "google", "instagram", "linkedin",
                "facebook", "qr_code", "nfc_card"
            ]),
            "sessionId": str(uuid.uuid4()),
        }

        with self.client.post(
            "/api/analytics/track",
            json=payload,
            catch_response=True,
            name="/api/analytics/track (POST Heavy)"
        ) as response:
            if response.status_code in (200, 201, 204):
                response.success()
            elif response.status_code == 429:
                response.success()
            else:
                response.failure(f"Analytics track — code : {response.status_code}")

    @task(2)
    def submit_review(self):
        """
        Soumission d'un avis client.
        Charge DB : INSERT avec validation + mise à jour de statistiques agrégées.
        """
        payload = {
            "profileId": random.choice(self.TEST_PROFILE_IDS),
            "rating": random.randint(1, 5),
            "comment": random.choice(self.REVIEW_COMMENTS),
            "reviewerName": random.choice(self.REVIEWER_NAMES),
            "reviewerEmail": f"reviewer-{random.randint(1, 999)}@test-load.com",
        }

        with self.client.post(
            "/api/reviews/submit",
            json=payload,
            catch_response=True,
            name="/api/reviews/submit (POST)"
        ) as response:
            if response.status_code in (200, 201, 400, 401, 403, 404, 422):
                # 400/422 = validation error (normal si champs manquants)
                response.success()
            elif response.status_code == 429:
                response.success()
            else:
                response.failure(f"Review submit — code : {response.status_code}")

    @task(1)
    def get_review_links(self):
        """
        Récupération des liens de collecte d'avis.
        """
        with self.client.get(
            "/api/reviews/links",
            catch_response=True,
            name="/api/reviews/links (GET)"
        ) as response:
            if response.status_code in (200, 401, 403, 404):
                response.success()
            elif response.status_code == 429:
                response.success()
            else:
                response.failure(f"Review links — code : {response.status_code}")
