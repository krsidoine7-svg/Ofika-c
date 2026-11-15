# 💳 Tunnel de Vente, Intégration GeniusPay & Tableaux de Bord

Ce document fait autorité sur le système de paiement unifié, la conformité vCard, la redirection NFC et la structure des tableaux de bord client et administrateur.

---

## 1. Unification du Paiement sur GeniusPay
- **Purge de Wave Direct** : L'ancien flux Wave direct (identifiant marchand test, upload manuel de capture de virement) a été intégralement purgé.
- **Passerelle Unique GeniusPay** : Gestion native et instantanée des paiements par **Wave, Orange Money, MTN Mobile Money, Moov Money et Cartes Bancaires (Visa / Mastercard)**.
- **Sécurisation des Webhooks & Idempotence** :
  - Signature cryptographique HMAC-SHA256 validée sur `/api/payments/geniuspay/webhook`.
  - Table `geniuspay_webhook_events` pour l'enregistrement et le dédoublonnage strict des notifications de paiement.
  - Déclenchement automatique de la mise à jour des commandes (`payment_status: 'succeeded'`, `status: 'paid'`, `paid_at`).
- **Synchronisation Tarifaire Dynamique** : Tarif officiel (14 600 XOF, livraison offerte sur tout Abidjan) servi via l'API et synchronisé entre la Landing Page (`/`), le panier (`/dashboard/orders/new`) et l'administration (`/dashboard/admin/payments`).

---

## 2. Puces Physiques NFC & Fiches vCard 3.0 RFC 2426
- **Redirection HTTP 307 Instantanée** : Élimination du délai client au profit d'une redirection serveur ultra-rapide (< 0.05ms en base de données avec index PostgreSQL dédiés sur `lower(username)` et `lower(custom_url)`).
- **Insensibilité Universelle à la Casse** : Les scans de cartes NFC ou QR codes avec casse mixte (ex: `/Koffi-Renaud`, `/koffi-renaud`, `/NIKs`) aboutissent toujours au profil sans erreur 404.
- **Fiches vCard 3.0 Conformes** : Structuration CRLF stricte (`\r\n`), décomposition Nom/Prénom, qualification `CELL,VOICE,PREF` pour reconnaissance automatique sur iOS (Contacts Apple) et Android (Google Contacts / WhatsApp).

---

## 3. Modernisation des Espaces Clients & Administration
- **Charte Visuelle** : Design Apple/Linear épuré (noir mat `#0f1115`, typographie équilibrée, absence de dégradés criards).
- **Tableau de Bord Client (`/dashboard`)** :
  - Remplacement du faux graphique d'avril 2024 par `DashboardActivityChart` réactif (visites et scans réels sur 7j/30j).
  - KPI orienté conversion : « Contacts Captés » avec accès direct au carnet de leads.
  - Miniature de carte de fidélité / NFC avec emblème officiel vectoriel Ofika et gravure personnalisée au nom de l'utilisateur.
- **Gestion des Commandes** : Suivi logistique clair en 4 étapes (Commandé, En gravure, En expédition, Livré), données de gravure complètes pour l'atelier laser.
