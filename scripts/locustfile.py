from locust import HttpUser, task, between
import random

class VCardTestUser(HttpUser):
    # Simuler une charge avec des requêtes espacées de 3 à 4 secondes comme demandé
    wait_time = between(3, 4)

    # Liste de profils à tester (on utilise notre profil de test)
    profile_ids = ["test-vcard-user"]

    # Liste de User-Agents pour simuler différents téléphones
    user_agents = [
        "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1", # iOS Safari
        "Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36 OPR/76.2.4027.73374", # Samsung
        "Mozilla/5.0 (Linux; Android 12; VOG-L29) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36", # Huawei
        "Mozilla/5.0 (Linux; Android 13; Pixel 7 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36" # Android Google
    ]

    @task
    def download_vcard(self):
        profile_id = random.choice(self.profile_ids)
        headers = {
            "User-Agent": random.choice(self.user_agents),
            "Accept": "text/vcard"
        }
        
        # Le nom (name="...") sert à regrouper les statistiques dans Locust
        with self.client.get(f"/api/contacts/{profile_id}", headers=headers, name="/api/contacts/[profileId]", catch_response=True) as response:
            if response.status_code == 200:
                if "BEGIN:VCARD" in response.text and "END:VCARD" in response.text:
                    response.success()
                else:
                    response.failure("Contenu vCard invalide (manque BEGIN ou END)")
            else:
                response.failure(f"Erreur HTTP {response.status_code}")
