# 🚀 Ofika - Cartes de Visite NFC/QR

> **Plateforme de cartes de visite numériques pour le marché africain**

## 📁 Organisation du Projet

Ce projet est maintenant organisé de manière structurée pour faciliter le développement et la maintenance :

```
nextjs-base-project/
├── 📚 docs/                    # Documentation complète
│   ├── 01-project-overview/    # Vue d'ensemble du projet
│   ├── 02-modules/             # Documentation des modules
│   ├── 03-guides/              # Guides d'utilisation
│   ├── 04-quick-fixes/         # Corrections rapides
│   ├── 05-technical/           # Documentation technique
│   ├── 06-solutions/           # Solutions aux problèmes
│   └── 07-troubleshooting/     # Dépannage
├── 🗄️ database/                # Scripts SQL organisés
│   ├── 00-COMPLETE_DATABASE_SETUP.sql  # ⭐ SCRIPT PRINCIPAL
│   ├── 01-setup/               # Configuration initiale
│   ├── 02-tables/              # Création des tables
│   ├── 03-rls-policies/        # Politiques RLS
│   ├── 04-storage/             # Configuration storage
│   ├── 05-functions/           # Fonctions utilitaires
│   ├── 06-triggers/            # Triggers et contraintes
│   ├── 07-indexes/             # Optimisation des index
│   ├── 08-fixes/               # Corrections et maintenance
│   ├── 09-tests/               # Tests et diagnostics
│   └── 10-utilities/           # Utilitaires divers
├── 🎨 app/                     # Application Next.js
├── 🧩 components/              # Composants React
├── 📚 lib/                     # Bibliothèques et utilitaires
├── 📐 schemas-mermaid/         # Schémas Mermaid (.mmd + .svg)
│   ├── link-to-bio/            # Page publique, vCard, parcours visiteur
│   ├── onboarding/             # Parcours client Ofika
│   ├── architecture/           # C4, ERD, infra
│   └── processus/              # Workflows métier
└── 📄 Autres fichiers de configuration
```

## 🚀 Démarrage Rapide

### 1. **Configuration de la Base de Données**
```sql
-- Copiez et collez ce script dans Supabase
database/00-COMPLETE_DATABASE_SETUP.sql
```

### 2. **Installation des Dépendances**
```bash
npm install
# ou
pnpm install
```

### 3. **Configuration de l'Environnement**
```bash
cp .env.example .env.local
# Configurez vos variables d'environnement
```

### 4. **Démarrage du Serveur**
```bash
npm run dev
# ou
pnpm dev
```

## 📚 Documentation

### **Documentation Principale**
- **Vue d'ensemble** : `docs/01-project-overview/`
- **Modules** : `docs/02-modules/`
- **Guides** : `docs/03-guides/`
- **Schémas Mermaid** : `schemas-mermaid/` (parcours, architecture, processus — `.mmd` + `.svg`)

### **Résolution de Problèmes**
- **Corrections rapides** : `docs/04-quick-fixes/`
- **Solutions** : `docs/06-solutions/`
- **Dépannage** : `docs/07-troubleshooting/`

### **Base de Données**
- **Script principal** : `database/00-COMPLETE_DATABASE_SETUP.sql`
- **Documentation** : `database/README.md`
- **Index** : `database/INDEX.md`

## 🔧 Fonctionnalités Principales

### ✅ **Authentification**
- Connexion par email/mot de passe
- OAuth Google et Apple
- Magic Link
- Gestion des sessions

### ✅ **Profils Numériques**
- Création de profils personnalisés
- Liens sociaux (WhatsApp, Facebook, Instagram, Twitter)
- Liens personnalisés
- Thèmes et personnalisation

### ✅ **Cartes NFC/QR**
- Génération de cartes physiques
- Codes QR personnalisés
- Intégration NFC
- Designs personnalisables

### ✅ **Analytics**
- Suivi des vues de profil
- Statistiques d'engagement
- Tableaux de bord
- Rapports détaillés

### ✅ **Intégration Contacts**
- Ajout automatique aux contacts
- Partage de cartes
- Synchronisation multi-plateforme

## 🛠️ Technologies Utilisées

### **Frontend**
- **Next.js 15** - Framework React
- **TypeScript** - Typage statique
- **Tailwind CSS** - Styling
- **Shadcn/ui** - Composants UI

### **Backend**
- **Supabase** - Backend as a Service
- **PostgreSQL** - Base de données
- **Row Level Security** - Sécurité des données
- **Storage** - Gestion des fichiers

### **Authentification**
- **Supabase Auth** - Gestion des utilisateurs
- **OAuth** - Google, Apple
- **Magic Links** - Connexion sans mot de passe

## 📊 Statistiques du Projet

- **Documentation** : 40+ fichiers Markdown organisés
- **Scripts SQL** : 38 fichiers organisés
- **Composants** : 47 composants React
- **Modules** : 7 modules principaux
- **Guides** : 7 guides d'utilisation
- **Corrections** : 14 corrections rapides

## 🎯 Prochaines Étapes

1. **Exécutez** le script de base de données
2. **Configurez** votre environnement
3. **Consultez** la documentation
4. **Développez** les fonctionnalités
5. **Testez** l'application

## 📞 Support

- **Documentation** : Consultez `docs/README.md`
- **Base de données** : Consultez `database/README.md`
- **Problèmes** : Utilisez les guides de dépannage
- **Corrections** : Consultez les quick fixes

## ⚠️ Notes Importantes

- **Toujours consulter** la documentation avant de commencer
- **Sauvegarder** avant d'appliquer des modifications
- **Tester** sur un environnement de développement
- **Mettre à jour** la documentation lors des changements

---

**Ofika** - Révolutionnant les cartes de visite en Afrique 🌍
