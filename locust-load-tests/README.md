# 🚀 Tests de Charge Locust — Ofika-c

Suite complète de tests de charge et de performance pour la plateforme **Ofika-c** (Next.js + Supabase).

---

## 📁 Structure

```text
locust-load-tests/
├── setup.py                         # Installation automatique (.venv + locust)
├── requirements.txt                 # Dépendances
├── config/locust.conf               # Configuration par défaut
├── data/users.csv                   # Comptes de test multi-utilisateurs
├── scenarios/
│   ├── ofika_public.py              # Pages publiques (Accueil, profils, etc.)
│   ├── ofika_auth.py                # Auth Supabase + Dashboard
│   ├── ofika_api_public.py          # APIs publiques (analytics, profils, avis)
│   ├── ofika_api_heavy.py           # APIs intensives avec charge DB
│   └── ofika_full_journey.py        # Parcours utilisateur complet séquentiel
├── scripts/
│   ├── run_headless.py              # Test headless + rapport Markdown
│   └── run_stress_test.py           # Stress test + point de rupture + dashboard HTML
└── results/                         # Rapports générés (créé automatiquement)
```

---

## 🛠️ Installation Rapide

```powershell
cd locust-load-tests
python setup.py
```

---

## 🏃 Lancement des Tests

### Activer l'environnement virtuel

```powershell
.venv\Scripts\Activate.ps1
```

### Mode Interactif (GUI Web sur http://localhost:8089)

```bash
# Pages publiques
locust -f scenarios/ofika_public.py --host http://localhost:3000

# Auth + Dashboard
locust -f scenarios/ofika_auth.py --host http://localhost:3000

# APIs Publiques
locust -f scenarios/ofika_api_public.py --host http://localhost:3000

# APIs Intensives (DB Heavy)
locust -f scenarios/ofika_api_heavy.py --host http://localhost:3000

# Parcours Complet
locust -f scenarios/ofika_full_journey.py --host http://localhost:3000
```

### Mode Headless (Automatique)

```bash
python scripts/run_headless.py -f scenarios/ofika_public.py -u 50 -r 5 -t 5m --host http://localhost:3000
```

### Stress Test (10 → 1000 users)

```bash
python scripts/run_stress_test.py -f scenarios/ofika_public.py -u 1000 -r 10 -t 10m --host http://localhost:3000
```

---

## 📊 Les 5 Scénarios

| # | Scénario | Fichier | Description |
|---|---|---|---|
| 1 | **Navigation Publique** | `ofika_public.py` | Pages accessibles sans auth (accueil, profils, avis, etc.) |
| 2 | **Auth + Dashboard** | `ofika_auth.py` | Login Supabase + navigation dans le dashboard protégé |
| 3 | **APIs Publiques** | `ofika_api_public.py` | Endpoints API sans auth (tracking, profils publics, reviews) |
| 4 | **APIs Intensives DB** | `ofika_api_heavy.py` | Endpoints authentifiés avec charge DB lourde (analytics, contacts, orders) |
| 5 | **Parcours Complet** | `ofika_full_journey.py` | Scénario séquentiel réaliste : arrivée → login → dashboard → logout |

---

## ⚙️ Configuration

Modifiez `config/locust.conf` pour changer les valeurs par défaut (hôte, users, spawn-rate).

Pour les scénarios avec authentification, définissez les variables d'environnement :

```powershell
$env:LOCUST_TEST_EMAIL = "votre-email@test.com"
$env:LOCUST_TEST_PASSWORD = "votre-mot-de-passe"
```

---

## ⚠️ Précautions

- **NE PAS tester en production** avec plus de 5 utilisateurs
- Les scénarios d'écriture (POST reviews, analytics) **créent de vraies données**
- Prévoyez un nettoyage de la base de données après les tests intensifs
- Le rate limiting de Supabase peut déclencher des 429 — c'est un comportement normal
