from locust import HttpUser, task, between

class PushNotificationTester(HttpUser):
    # Attendre 2 à 4 secondes entre chaque envoi simulé
    wait_time = between(2, 4)

    @task
    def trigger_push_all(self):
        # On simule un appel admin pour envoyer un push de test
        payload = {
            "title": "🔔 Test de Charge Locust",
            "body": "Ceci est un test de performance du système Push !",
            "url": "/dashboard"
        }
        
        with self.client.post("/api/admin/push-all", json=payload, name="/api/admin/push-all", catch_response=True) as response:
            if response.status_code == 200:
                json_data = response.json()
                if json_data.get("success"):
                    response.success()
                else:
                    response.failure(f"Erreur logique API: {json_data.get('error')}")
            else:
                response.failure(f"Erreur HTTP {response.status_code}")
