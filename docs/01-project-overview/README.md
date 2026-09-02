# 📚 Documentation du Projet Ofika

Bienvenue dans la documentation complète du projet Ofika - Plateforme de cartes NFC intelligentes.

---

## 📂 Structure de la documentation

### 🆕 Documentation Table ORDERS (Nouveau)

Documentation complète de la table `orders` et de sa cohérence avec le formulaire web :

1. **[INDEX_DOCUMENTATION_ORDERS.md](./INDEX_DOCUMENTATION_ORDERS.md)** ⭐ **Commencez ici**
   - Index et guide de navigation
   - Réponse rapide à la question de cohérence
   - Guide de lecture recommandé

2. **[RESUME_TABLE_ORDERS.md](./RESUME_TABLE_ORDERS.md)** 📊 **Résumé exécutif**
   - Vue d'ensemble rapide (5 min)
   - Liste des 22 champs
   - Analyse de cohérence à 100%
   - Exemple complet

3. **[STRUCTURE_TABLE_ORDERS.md](./STRUCTURE_TABLE_ORDERS.md)** 📋 **Documentation technique**
   - Schéma SQL complet
   - Description détaillée de chaque champ
   - Validations Zod
   - Flux complet de création

4. **[COMPARAISON_FORMULAIRE_DB.md](./COMPARAISON_FORMULAIRE_DB.md)** 🔄 **Mapping détaillé**
   - Tableau de correspondance champ par champ
   - Code source du formulaire et de l'API
   - Transformations des données
   - Sécurité et validations

5. **[EXEMPLES_REQUETES_SQL_ORDERS.md](./EXEMPLES_REQUETES_SQL_ORDERS.md)** 🔍 **Guide SQL**
   - 24 exemples de requêtes SQL
   - Requêtes de consultation, analyse, mise à jour
   - Optimisations et index recommandés

6. **Diagrammes visuels** 🖼️
   - `orders_table_schema.png` : Schéma de la table
   - `order_creation_flow.png` : Flux de création de commande

---

## 📖 Autres documents disponibles

### Configuration et déploiement

- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** : Guide de déploiement complet
- **[ENV_SETUP.md](./ENV_SETUP.md)** : Configuration des variables d'environnement
- **[DATABASE_SETUP.md](./DATABASE_SETUP.md)** : Configuration de la base de données

### API et intégrations

- **[API_REFERENCE.md](./API_REFERENCE.md)** : Documentation de l'API REST
- **[WEBHOOK_MAKECOM_REFERENCE.md](./WEBHOOK_MAKECOM_REFERENCE.md)** : Intégration Make.com
- **[PAYMENT_INTEGRATION.md](./PAYMENT_INTEGRATION.md)** : Intégration GeniusPay et Wave Direct Merchant

### Guides de développement

- **[GUIDE_TEST.md](./GUIDE_TEST.md)** : Guide de test des endpoints
- **[DEVELOPMENT_WORKFLOW.md](./DEVELOPMENT_WORKFLOW.md)** : Workflow de développement
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** : Résolution de problèmes courants

---

## 🚀 Démarrage rapide

### Pour comprendre la table `orders`

1. Lisez **[INDEX_DOCUMENTATION_ORDERS.md](./INDEX_DOCUMENTATION_ORDERS.md)**
2. Consultez **[RESUME_TABLE_ORDERS.md](./RESUME_TABLE_ORDERS.md)**
3. Regardez les diagrammes visuels

**Temps estimé** : 5-10 minutes

### Pour développer avec la table `orders`

1. Lisez **[STRUCTURE_TABLE_ORDERS.md](./STRUCTURE_TABLE_ORDERS.md)**
2. Consultez **[COMPARAISON_FORMULAIRE_DB.md](./COMPARAISON_FORMULAIRE_DB.md)**
3. Utilisez **[EXEMPLES_REQUETES_SQL_ORDERS.md](./EXEMPLES_REQUETES_SQL_ORDERS.md)**

**Temps estimé** : 20-30 minutes

---

## 🎯 Questions fréquentes

### Q1 : Quelle est la table pour les commandes ?
**R** : La table s'appelle `orders`. Voir [RESUME_TABLE_ORDERS.md](./RESUME_TABLE_ORDERS.md)

### Q2 : Les données du formulaire sont-elles cohérentes avec la DB ?
**R** : Oui, cohérence parfaite à 100%. Voir [COMPARAISON_FORMULAIRE_DB.md](./COMPARAISON_FORMULAIRE_DB.md)

### Q3 : Quels champs sont envoyés depuis le formulaire ?
**R** : 4 champs principaux + 6 dans `shipping_address` (JSONB). Voir [STRUCTURE_TABLE_ORDERS.md](./STRUCTURE_TABLE_ORDERS.md)

### Q4 : Comment interroger la table `orders` ?
**R** : Consultez les 24 exemples dans [EXEMPLES_REQUETES_SQL_ORDERS.md](./EXEMPLES_REQUETES_SQL_ORDERS.md)

### Q5 : Où est le code source du formulaire ?
**R** : `app/dashboard/orders/new/page.tsx`. Voir [COMPARAISON_FORMULAIRE_DB.md](./COMPARAISON_FORMULAIRE_DB.md)

### Q6 : Où est le code de l'API de création ?
**R** : `app/api/orders/create/route.ts`. Voir [STRUCTURE_TABLE_ORDERS.md](./STRUCTURE_TABLE_ORDERS.md)

---

## 📊 Vue d'ensemble du système

```
┌─────────────────────────────────────────────────────────────────┐
│                     ARCHITECTURE OFIKA                          │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Frontend    │────▶│   API REST   │────▶│  Supabase    │
│  Next.js     │     │  Next.js     │     │  PostgreSQL  │
└──────────────┘     └──────────────┘     └──────────────┘
       │                    │                     │
       │                    │                     │
       ▼                    ▼                     ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Formulaire  │     │  Validation  │     │ Table orders │
│  Commande    │     │  Zod + RLS   │     │  (22 champs) │
└──────────────┘     └──────────────┘     └──────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │   Wave      │
                     │   Paiement   │
                     └──────────────┘
```

---

## 🔗 Liens utiles

### Ressources externes
- **Supabase** : https://supabase.com/docs
- **Next.js** : https://nextjs.org/docs
- **PostgreSQL** : https://www.postgresql.org/docs
- **Wave** : https://Wave.ci

### Ressources internes
- **Dépôt GitHub** : [Lien vers votre repo]
- **Dashboard Supabase** : [Lien vers votre projet Supabase]
- **Application de production** : [Lien vers votre app]

---

## 🤝 Contribution

Pour contribuer à cette documentation :

1. Créez une nouvelle branche : `git checkout -b docs/ma-modification`
2. Modifiez les fichiers dans `docs/`
3. Commitez : `git commit -m "docs: description de la modification"`
4. Pushez : `git push origin docs/ma-modification`
5. Créez une Pull Request

---

## 📝 Changelog

### 2025-12-04 - Documentation Table ORDERS
- ✅ Ajout de la documentation complète de la table `orders`
- ✅ Création de 5 documents détaillés
- ✅ Génération de 2 diagrammes visuels
- ✅ 24 exemples de requêtes SQL
- ✅ Analyse de cohérence formulaire ↔ DB

### [Versions précédentes]
- Voir l'historique Git pour les modifications antérieures

---

## 📞 Support

Pour toute question ou problème :

1. Consultez d'abord la documentation appropriée
2. Vérifiez le [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
3. Contactez l'équipe de développement

---

**Dernière mise à jour** : 2025-12-04  
**Version de la documentation** : 2.0  
**Projet** : Ofika - Cartes NFC Intelligentes