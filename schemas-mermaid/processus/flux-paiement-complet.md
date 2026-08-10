# Documentation Exhaustive des Flux de Paiement Ofika

> **Document de Référence Technique & Fonctionnel**
> Ce document cartographie l'ensemble des parcours de paiement, règles de gestion, cas d'exception, logiques si/sinon et diagrammes Mermaid du système de paiement d'Ofika.

---

## 📌 Table des Matières
1. [Architecture & Niveaux de Prix](#1-architecture--niveaux-de-prix)
2. [Matrice d'Activation des Passerelles (Admin)](#2-matrice-dactivation-des-passerelles-admin)
3. [Flow 1 : GeniusPay (Paiement Automatique Webhook)](#3-flow-1--geniuspay-paiement-automatique-webhook)
4. [Flow 2 : Wave Direct Link (Paiement Manuel & Validation Admin)](#4-flow-2--wave-direct-link-paiement-manuel--validation-admin)
5. [Arbre de Décision & Matrice de Statuts](#5-arbre-de-décision--matrice-de-statuts)
6. [Gestion des Exceptions & Cas Limites](#6-gestion-des-exceptions--cas-limites)

---

## 1. Architecture & Niveaux de Prix

Le système de tarification fonctionne sur un modèle **dynamique à 2 niveaux de priorité** :

| Niveau | Source de Vérité | Emplacement | Description |
| :--- | :--- | :--- | :--- |
| **Niveau 1 (Prioritaire)** | Base de données Supabase | Table `system_config` (clé `pricing_config` ➔ `nfc_card_base_price`) | Déclaré dynamiquement depuis l'admin. Ex: `14 600 FCFA`. |
| **Niveau 2 (Secours)** | Hardcodé dans l'application | `lib/types/payments.ts` | Utilisé si la BD est indisponible. Valeur : `14 600 FCFA`. |

### ⚠️ Règle de Sécurité du Montant Minimum
- **Seuil minimal :** `200 XOF`.
- **Raison :** L'API GeniusPay rejette toute transaction inférieure à `200 XOF` avec une erreur HTTP 422 (`"Le montant minimum pour XOF est 200."`).
- **Implémentation :** Les routes `/api/orders/create` et `/api/payments/geniuspay/initiate` appliquent `Math.max(amount, 200)`.

---

## 2. Matrice d'Activation des Passerelles (Admin)

L'administrateur peut activer ou désactiver chaque passerelle indépendamment dans `/dashboard/admin/payments`. La route `/api/payments/methods` renvoie l'état réel stocké dans `system_config` (clé `payment_gateways`).

```mermaid
flowchart TD
    Start[Vérification de la configuration des passerelles] --> FetchDB[GET /api/payments/methods]
    FetchDB --> CheckState{États dans system_config}

    CheckState -->|GeniusPay=ON & Wave=ON| BothActive[Les 2 choix affichés au client : GeniusPay et Wave Direct]
    CheckState -->|GeniusPay=ON & Wave=OFF| GPOnly[Seul GeniusPay est affiché et auto-sélectionné]
    CheckState -->|GeniusPay=OFF & Wave=ON| WaveOnly[Seul Wave Direct est affiché et auto-sélectionné]
    CheckState -->|GeniusPay=OFF & Wave=OFF| NoneActive[Bouton de paiement désactivé : "Aucun moyen de paiement disponible"]
```

---

## 3. Flow 1 : GeniusPay (Paiement Automatique Webhook)

### 🔄 Diagramme de Séquence Détaillé

```mermaid
sequenceDiagram
    autonumber
    actor Client
    participant Frontend as Client (/dashboard/orders)
    participant API as API Server (/api)
    participant GeniusPay as Passerelle GeniusPay
    participant DB as Supabase BD
    actor Admin as Admin (/dashboard/admin/orders)

    Client->>Frontend: 1. Choix GeniusPay & Clic sur "Payer"
    Frontend->>API: 2. POST /api/orders/create (status: 'pending')
    API->>DB: 3. Insertion commande (payment_status: 'pending')
    Frontend->>API: 4. POST /api/payments/geniuspay/initiate
    API->>GeniusPay: 5. Requête /payments (order_id, amount)
    GeniusPay-->>API: 6. Retour URL Checkout GeniusPay
    API-->>Frontend: 7. Redirection client vers GeniusPay Checkout
    Client->>GeniusPay: 8. Saisie numéro Mobile Money / Carte & Validation OTP
    GeniusPay->>API: 9. Webhook POST /api/webhooks/geniuspay (payment.success)
    
    rect rgb(240, 255, 240)
        Note over API,DB: Traitement sécurisé du Webhook
        API->>API: Vérification Signature HMAC & Horodatage
        API->>DB: Contrôle idempotence (table geniuspay_webhook_events)
        API->>DB: UPDATE orders SET payment_status='succeeded', status='paid'
        DB->>DB: Trigger notify_on_order_status_change() (NEW.user_id::uuid)
        DB->>DB: Insertion notification client ("Paiement confirmé !")
    end

    DB-->>Admin: 10. Supabase Realtime : Mise à jour en direct de l'Admin
    DB-->>Frontend: 11. Le bouton "Payer" DISPARAÎT. Statut passe à "Payée".
```

---

## 4. Flow 2 : Wave Direct Link (Paiement Manuel & Validation Admin)

### 🔄 Diagramme de Séquence Détaillé

```mermaid
sequenceDiagram
    autonumber
    actor Client
    participant Frontend as Client (/dashboard/orders)
    participant API as API Server (/api)
    participant Wave as App Wave Direct
    participant Storage as Supabase Storage
    participant DB as Supabase BD
    actor Admin as Admin (/dashboard/admin/orders)

    Client->>Frontend: 1. Choix Wave Direct & validation commande
    Frontend->>API: 2. POST /api/orders/create (payment_method: 'wave')
    API->>DB: 3. Commande créée (payment_status: 'pending')
    Client->>Wave: 4. Virement sur le lien/QR Wave Marchand
    Client->>Frontend: 5. Upload de la capture d'écran / reçu de paiement
    Frontend->>Storage: 6. Téléversement image du reçu (profile-images/receipts/...)
    Storage-->>Frontend: 7. URL publique de l'image (receipt_url)
    Frontend->>API: 8. POST /api/payments/receipt/upload (receipt_url)
    API->>DB: 9. UPDATE orders SET payment_status='processing', metadata.receipt_url=...
    
    Note over Client: Sur /dashboard/orders, le bouton "Payer" est remplace par le badge "Reçu en cours de vérification"

    DB-->>Admin: 10. L'Admin consulte le reçu sur /dashboard/admin/orders
    
    alt CAS A : Reçu Valide (Admin valide)
        Admin->>API: 11. Clic sur "Valider le Reçu"
        API->>DB: 12. PATCH /api/admin/orders (payment_status: 'succeeded', status: 'paid')
        DB->>DB: Trigger PostgreSQL notifie le client ("Paiement confirmé !")
        DB-->>Client: 13. Le statut passe à "Payée" (Bouton Payer masqué définitivement)
    else CAS B : Reçu Invalide / Illisible (Admin rejette)
        Admin->>API: 11. Clic sur "Marquer comme Échoué"
        API->>DB: 12. PATCH /api/admin/orders (payment_status: 'failed', status: 'failed')
        DB-->>Client: 13. Le bouton "Payer / Resoumettre" réapparaît pour réessayer
    end
```

---

## 5. Arbre de Décision & Matrice de Statuts

### 🌲 Arbre de Décision d'Affichage du Bouton "Payer" (Côté Client)

```mermaid
graph TD
    Start[Vérification de la commande sur /dashboard/orders] --> CheckPaid{payment_status == 'succeeded' OR 'paid' OR status == 'paid'}
    
    CheckPaid -->|OUI| HideButton[🚫 Bouton "Payer" MASQUÉ DEFINITIVEMENT<br/>Badge : "Payée"]
    CheckPaid -->|NON| CheckProcessing{payment_status == 'processing'}
    
    CheckProcessing -->|OUI| ProcessingBadge[⏳ Bouton "Payer" MASQUÉ<br/>Badge violet : "Reçu en cours de vérification"]
    CheckProcessing -->|NON| CheckPending{payment_status == 'pending' OR 'failed'}
    
    CheckPending -->|OUI| ShowButton[💳 Bouton "Payer ma commande" AFFICHÉ]
    CheckPending -->|NON| HideDefault[Masqué]
```

### 📋 Matrice des Statuts de Commande

| `payment_status` | `status` (Global) | Signification | Bouton Payer (Client) | Action Admin |
| :--- | :--- | :--- | :--- | :--- |
| `pending` | `pending` | Commande créée, paiement non effectué | 💳 **Affiché** | En attente de paiement |
| `processing` | `pending` | Reçu Wave soumis par le client | ⏳ **Masqué** *(Reçu en vérification)* | Aperçu du reçu + Boutons Valider / Rejeter |
| `succeeded` | `paid` | Paiement validé (GeniusPay ou Admin Wave) | 🚫 **Masqué** *(Payée)* | Passer en Préparation / Expédié / Livré |
| `failed` | `failed` | Paiement échoué ou reçu rejeté par Admin | 💳 **Affiché** *(Réessayer)* | Possibilité d'annuler ou ré-ouvrir |
| `cancelled` | `cancelled` | Commande annulée | 🚫 **Masqué** | Aucune action |

---

## 6. Gestion des Exceptions & Cas Limites

```mermaid
flowchart TD
    ExceptionStart[Détection d'une Exception de Paiement] --> CheckType{Type d'Exception}

    CheckType -->|Montant < 200 XOF| E1[Erreur GeniusPay 422<br/>Correction : Math.max(amount, 200) appliqué par l'API]
    CheckType -->|Erreur PostgreSQL 42804| E2[Trigger UUID vs TEXT<br/>Correction : NEW.user_id::uuid cast dans notify_on_order_status_change]
    CheckType -->|Webhook GeniusPay en double| E3[Doublon Webhook<br/>Correction : Contrôle d'idempotence dans geniuspay_webhook_events]
    CheckType -->|Reçu Wave Invalide| E4[Reçu rejeté par l'Admin<br/>Correction : passage en payment_status='failed', réaffichage du bouton Payer]
    CheckType -->|Client ferme la fenêtre| E5[Abandon Checkout<br/>Correction : Commande reste 'pending', disponible sur le dashboard]
```

---

## 📁 Emplacement du Fichier
- **Chemin :** `schemas-mermaid/processus/flux-paiement-complet.md`
- **Fichiers Mermaid associés :**
  - `schemas-mermaid/processus/geniuspay-webhook-flow.mmd`
  - `schemas-mermaid/processus/wave-direct-flow.mmd`
