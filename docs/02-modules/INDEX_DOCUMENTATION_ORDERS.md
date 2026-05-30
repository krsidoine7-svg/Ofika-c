# 📚 Documentation - Table ORDERS

## 📖 Index des documents

Cette documentation complète répond à votre question : **"Quelle est la table de ma base de données pour les commandes et quelle est la cohérence avec les éléments envoyés depuis le web ?"**

---

## 🎯 Documents disponibles

### 1. 📊 **RESUME_TABLE_ORDERS.md** (⭐ À lire en premier)
**Résumé exécutif - Vue d'ensemble rapide**

Ce document fournit une réponse directe et concise à votre question :
- ✅ Nom de la table : `orders`
- ✅ Liste complète des 22 champs
- ✅ Analyse de cohérence : **100% cohérent**
- ✅ Exemple complet de création de commande

**👉 Commencez par ce document pour une vue d'ensemble rapide.**

---

### 2. 📋 **STRUCTURE_TABLE_ORDERS.md**
**Documentation technique complète de la table**

Contenu détaillé :
- 📝 Schéma SQL complet de la table `orders`
- 📊 Description détaillée de chaque champ (type, contraintes, valeur par défaut)
- 🌐 Structure des données envoyées depuis le formulaire web
- ✅ Schéma de validation Zod
- 🔄 Traitement des données dans l'API
- 🔍 Analyse de cohérence champ par champ
- 📊 Format JSONB du champ `shipping_address`
- 🔐 Sécurité et validations
- 🎯 Flux complet de création de commande

**👉 Pour une compréhension approfondie de la structure.**

---

### 3. 🔄 **COMPARAISON_FORMULAIRE_DB.md**
**Comparaison détaillée : Formulaire Web ↔ Base de Données**

Contenu :
- 📋 Tableau de correspondance champ par champ
- 📤 Données envoyées depuis le formulaire (code source)
- 📥 Données insérées dans la base de données (code source)
- 🔍 Détails des transformations pour chaque champ
- ✅ Validations appliquées (client + serveur)
- 🔒 Champs protégés et mécanismes de sécurité
- 📊 Flux de données complet avec diagramme ASCII

**👉 Pour comprendre le mapping exact entre le formulaire et la DB.**

---

### 4. 🖼️ **Diagrammes visuels**

#### 4.1 Schéma de la table `orders`
**Fichier** : `orders_table_schema.png`

Diagramme professionnel montrant :
- Structure complète de la table
- Types de données
- Contraintes (PRIMARY KEY, FOREIGN KEY, UNIQUE, NOT NULL)
- Valeurs par défaut
- Mise en évidence du champ JSONB `shipping_address`

#### 4.2 Flux de création de commande
**Fichier** : `order_creation_flow.png`

Diagramme de flux montrant :
- Formulaire web → Validation client → API → Base de données
- Étapes de traitement
- Champs remplis à chaque étape
- Codes couleur pour chaque composant

**👉 Pour une visualisation rapide et claire.**

---

## 🚀 Guide de lecture recommandé

### Pour une réponse rapide (5 minutes)
1. 📊 **RESUME_TABLE_ORDERS.md**
2. 🖼️ Diagrammes visuels

### Pour une compréhension complète (15 minutes)
1. 📊 **RESUME_TABLE_ORDERS.md**
2. 🔄 **COMPARAISON_FORMULAIRE_DB.md**
3. 🖼️ Diagrammes visuels

### Pour une documentation technique exhaustive (30 minutes)
1. 📊 **RESUME_TABLE_ORDERS.md**
2. 📋 **STRUCTURE_TABLE_ORDERS.md**
3. 🔄 **COMPARAISON_FORMULAIRE_DB.md**
4. 🖼️ Diagrammes visuels

---

## 🎯 Réponse rapide à votre question

### Question
> "Quelle est la table de ma base de données pour les commandes avec les différents champs ? Je veux voir la cohérence avec les éléments envoyés dans le web lors de la création d'une commande."

### Réponse
✅ **La table s'appelle `orders` et contient 22 champs.**

✅ **Cohérence parfaite à 100%** entre le formulaire web et la base de données :

| Formulaire Web | Base de Données | Cohérence |
|----------------|-----------------|-----------|
| `card_type` | `card_type` | ✅ 100% |
| `quantity` | `quantity` | ✅ 100% |
| `payment_method` | `payment_method` | ✅ 100% |
| `shipping_address` (6 champs) | `shipping_address` (JSONB) | ✅ 100% |

**Champs supplémentaires** générés automatiquement par l'API :
- `id`, `user_id`, `order_number` (identifiants)
- `unit_price`, `total_amount`, `currency` (prix calculés)
- `status`, `payment_status` (statuts initiaux)
- `created_at`, `updated_at` (timestamps)

**Champs remplis plus tard** (webhooks, expédition) :
- `payment_reference`, `tracking_number`
- `estimated_delivery`, `actual_delivery`
- `lygos_payment_id`, `lygos_payment_url`
- `wave_payment_id`, `wave_payment_url`

---

## 📂 Localisation des fichiers sources

### Base de données
- **Schéma principal** : `drizzle/migrations/0000_black_drax.sql` (lignes 120-144)
- **Schéma alternatif** : `database/00-COMPLETE_DATABASE_SETUP.sql` (lignes 93-111)

### Code applicatif
- **API de création** : `app/api/orders/create/route.ts`
- **Formulaire web** : `app/dashboard/orders/new/page.tsx`
- **Types TypeScript** : `lib/types/payments.ts`
- **Configuration** : `lib/config/urls.ts`

### Documentation
- **Tous les documents** : `docs/` (ce dossier)

---

## 🔍 Informations clés

### Structure du champ `shipping_address` (JSONB)
```json
{
  "name": "Jean Kouassi",
  "email": "jean.kouassi@example.com",
  "phone": "+225 07 12 34 56 78",
  "address": "Cocody, Riviera 3, Rue des Jardins",
  "city": "Abidjan",
  "postalCode": "BP 1234"
}
```

### Valeurs possibles pour les enums

**`card_type`** :
- `'nfc_qr'` : Carte NFC + QR Code (15 000 XOF)
- `'qr_only'` : QR Code uniquement (8 000 XOF)
- `'premium_subscription'` : Abonnement premium
- `'custom'` : Personnalisé

**`payment_method`** :
- `'lygos'` : LyGOS (Mobile Money)
- `'wave'` : Wave
- `'orange_money'` : Orange Money
- `'mtn_money'` : MTN Mobile Money

**`status`** :
- `'pending'` : En attente
- `'paid'` : Payée
- `'failed'` : Échouée
- `'cancelled'` : Annulée
- `'shipped'` : Expédiée
- `'delivered'` : Livrée

**`payment_status`** :
- `'pending'` : En attente
- `'completed'` : Complété
- `'failed'` : Échoué
- `'refunded'` : Remboursé

---

## 🔒 Sécurité

### Validations
- ✅ **Côté client** : Validation JavaScript des champs requis
- ✅ **Côté serveur** : Validation Zod stricte
- ✅ **Rate Limiting** : 5 requêtes/minute par IP
- ✅ **Authentification** : Session Supabase obligatoire

### Protections
- 🔒 **Prix sécurisés** : Calculés côté serveur uniquement
- 🔒 **Identifiants uniques** : UUID et order_number avec retry
- 🔒 **Limites utilisateur** : Maximum 2 commandes par utilisateur
- 🔒 **Clé étrangère** : `user_id` → `users(id)` avec CASCADE

---

## 📊 Statistiques

- **Nombre total de champs** : 22
- **Champs requis** : 11
- **Champs optionnels** : 11
- **Champs depuis le formulaire** : 4 (+ 6 dans shipping_address)
- **Champs auto-générés** : 10
- **Champs remplis plus tard** : 8

---

## 🎯 Conclusion

✅ **Cohérence parfaite** : Tous les champs du formulaire sont correctement mappés  
✅ **Sécurité renforcée** : Validations strictes et prix protégés  
✅ **Structure flexible** : JSONB permet l'évolution sans migration  
✅ **Documentation complète** : 3 documents + 2 diagrammes visuels  

**Aucune modification n'est nécessaire.** La structure actuelle est optimale et parfaitement cohérente.

---

**Date de création** : 2025-12-04  
**Version** : 1.0  
**Auteur** : Documentation générée automatiquement
