"""
Scénario 6 — Test de Charge de l'Onboarding NFC Ofika-c
======================================================
Simule le parcours séquentiel complet d'un visiteur qui :
  1. Charge la page d'accueil de l'onboarding NFC
  2. Remplit le formulaire de coordonnées (API save-temp)
  3. Choisit son design et sa couleur (API save-temp)
  4. Renseigne ses infos de profil (API save-temp)
  5. Crée un compte utilisateur via Supabase Auth
  6. Finalise et active sa carte NFC (API finalize -> écriture profiles et digital_nfc_cards)
"""

import os
import uuid
import random
# pyrefly: ignore [missing-import]
from locust import HttpUser, SequentialTaskSet, task, between

# Récupération des clés Supabase
SUPABASE_URL = os.getenv(
    "NEXT_PUBLIC_SUPABASE_URL",
    "https://graqvtzmefiwsafaubcw.supabase.co"
)
SUPABASE_ANON_KEY = os.getenv(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "sb_publishable_iY156nvEphMFhmxVlMc5DA_19C5iuuh"
)

class OnboardingFlowTasks(SequentialTaskSet):
    def on_start(self):
        # Générer des données uniques pour cet utilisateur virtuel
        self.session_id = str(uuid.uuid4())
        self.test_id = random.randint(100000, 999999)
        self.email = f"load_test_onboarding_{self.test_id}@ofika-load.com"
        self.password = "LoadTestPassword123!"
        self.username = f"koffi_load_{self.test_id}"
        self.custom_url = f"koffi-load-test-{self.test_id}"
        
        # Conserver les headers de base pour Supabase
        self.supabase_headers = {
            "Content-Type": "application/json",
            "apikey": SUPABASE_ANON_KEY,
        }
        
    @task
    def load_intro_page(self):
        """1. Charger l'intro de l'onboarding."""
        with self.client.get("/onboarding/nfc-card", catch_response=True, name="[PAGE] NFC Intro") as resp:
            if resp.status_code == 200:
                resp.success()
            else:
                resp.failure(f"Échec de chargement de la page intro ({resp.status_code})")

    @task
    def save_step_form(self):
        """2. Enregistrer le formulaire de coordonnées (Étape 2)."""
        payload = {
            "session_id": self.session_id,
            "flow_type": "nfc_card",
            "step": 2,
            "user_email": self.email,
            "data": {
                "fullName": f"Koffi Load {self.test_id}",
                "phone": "+22500000000",
                "email": self.email,
                "company": "Ofika Test Company",
                "jobTitle": "Load Tester",
                "consentTerms": True
            }
        }
        with self.client.post(
            "/api/onboarding/save-temp",
            json=payload,
            catch_response=True,
            name="[API] Save Form Coords"
        ) as resp:
            if resp.status_code in (200, 201):
                resp.success()
            else:
                resp.failure(f"Échec enregistrement coordonnées ({resp.status_code}): {resp.text}")

    @task
    def save_step_design(self):
        """3. Enregistrer le design de la carte (Étape 3)."""
        payload = {
            "session_id": self.session_id,
            "flow_type": "nfc_card",
            "step": 3,
            "user_email": self.email,
            "data": {
                "design_choice": "design1",
                "color_theme": "black"
            }
        }
        with self.client.post(
            "/api/onboarding/save-temp",
            json=payload,
            catch_response=True,
            name="[API] Save Card Design"
        ) as resp:
            if resp.status_code in (200, 201):
                resp.success()
            else:
                resp.failure(f"Échec enregistrement design ({resp.status_code})")

    @task
    def save_step_profile_selection(self):
        """4. Enregistrer les informations du profil (Étape 4)."""
        payload = {
            "session_id": self.session_id,
            "flow_type": "nfc_card",
            "step": 4,
            "user_email": self.email,
            "data": {
                "profileName": f"Koffi Load {self.test_id}",
                "bio": "Ceci est une bio simulée par Locust",
                "customUrl": self.custom_url,
                "username": self.username,
                "createdCardData": {
                    "selectedOption": "new",
                    "newProfileData": {
                        "name": f"Koffi Load {self.test_id}",
                        "bio": "Ceci est une bio simulée par Locust",
                        "customUrl": self.custom_url,
                        "username": self.username,
                        "designChoice": "design1"
                    }
                }
            }
        }
        with self.client.post(
            "/api/onboarding/save-temp",
            json=payload,
            catch_response=True,
            name="[API] Save Profile Options"
        ) as resp:
            if resp.status_code in (200, 201):
                resp.success()
            else:
                resp.failure(f"Échec enregistrement options de profil ({resp.status_code})")

    @task
    def signup_user(self):
        """5. Inscription via Supabase Auth (Étape 5)."""
        signup_url = f"{SUPABASE_URL}/auth/v1/signup"
        payload = {
            "email": self.email,
            "password": self.password,
            "options": {
                "data": {
                    "full_name": f"Koffi Load {self.test_id}",
                    "phone": "+22500000000"
                }
            }
        }
        with self.client.post(
            signup_url,
            json=payload,
            headers=self.supabase_headers,
            catch_response=True,
            name="[Supabase] Auth Signup"
        ) as resp:
            if resp.status_code == 200:
                data = resp.json()
                self.access_token = data.get("access_token", "")
                if self.access_token:
                    # Injecter le JWT d'authentification pour la suite
                    self.client.headers.update({
                        "Authorization": f"Bearer {self.access_token}"
                    })
                    resp.success()
                else:
                    resp.failure("Inscription réussie mais pas de token dans la réponse")
            else:
                resp.failure(f"Échec de l'inscription Supabase ({resp.status_code}) : {resp.text}")

    @task
    def finalize_onboarding(self):
        """6. Finaliser l'onboarding (Étape 6 -> insertion DB profiles & digital_nfc_cards)."""
        payload = {
            "session_id": self.session_id,
            "flow_type": "nfc_card"
        }
        with self.client.post(
            "/api/onboarding/finalize",
            json=payload,
            catch_response=True,
            name="[API] Finalize Activation"
        ) as resp:
            if resp.status_code == 200:
                resp.success()
            else:
                resp.failure(f"Échec de la finalisation/activation ({resp.status_code}) : {resp.text}")

class OfikaOnboardingUser(HttpUser):
    tasks = [OnboardingFlowTasks]
    wait_time = between(1, 3)
