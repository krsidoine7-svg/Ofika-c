"""
Scénario — Collecte d'Avis Clients Ofika
========================================
Simule l'accès public au formulaire de collecte d'avis clients et la soumission d'avis.
Vérifie la robustesse des API face au volume et le comportement du Rate Limiting (429).
"""
import random
import uuid
# pyrefly: ignore [missing-import]
from locust import HttpUser, task, between, on_start


class OfikaReviewsUser(HttpUser):
    """
    Simule des clients publics soumettant des avis sur un profil Ofika.
    """
    wait_time = between(1, 3)

    # Slug de test
    TEST_SLUGS = ["restaurant-test", "hotel-indigo", "garage-centre"]

    @task(3)
    def visit_reviews_page(self):
        """Simule la visite de la page de formulaire publique d'avis"""
        slug = random.choice(self.TEST_SLUGS)
        with self.client.get(f"/avis/{slug}", catch_response=True, name="/avis/[slug]") as response:
            if response.status_code in (200, 301, 302, 307, 308, 404, 429):
                # 404 est normal si le slug n'existe pas
                response.success()
            else:
                response.failure(f"Formulaire {slug} — code : {response.status_code}")

    @task(5)
    def submit_review(self):
        """Simule la soumission d'un avis client via l'API publique"""
        fake_id = str(uuid.uuid4())
        rating = random.randint(1, 5)
        
        payload = {
            "link_id": fake_id,
            "rating": rating,
            "client_name": f"Client Locust {random.randint(1, 1000)}",
            "client_email": f"client_locust_{random.randint(1, 10000)}@example.com",
            "comment": "Avis généré automatiquement pour le test de charge Locust.",
            "has_purchase": random.choice([True, False]),
            "fingerprint": f"fp_locust_{random.randint(1, 50)}" # Limité à 50 empreintes pour tester les conflits RLS / Doublons
        }

        headers = {
            "Content-Type": "application/json",
            "X-Forwarded-For": f"192.168.1.{random.randint(1, 20)}" # Simuler des IPs différentes pour le rate limiting
        }

        with self.client.post(
            "/api/reviews/submit",
            json=payload,
            headers=headers,
            catch_response=True,
            name="/api/reviews/submit"
        ) as response:
            if response.status_code in (201, 400, 404, 409, 429):
                # 201: Succès, 400: Mauvais UUID ou données, 404: Link non trouvé, 409: Doublon, 429: Rate Limit
                # Tous ces codes sont normaux sous charge avec des données semi-aléatoires
                response.success()
            else:
                response.failure(f"Soumission avis échouée — code : {response.status_code}")
