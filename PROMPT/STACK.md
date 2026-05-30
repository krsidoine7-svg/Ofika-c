# 🛠️ PROMPT : Cartographie de la Stack Technique (STACK.md)

Ce document décrit l'architecture technique, les outils et les bibliothèques approuvés pour le projet, ainsi que les règles de développement associées.

---

## 🏗️ Architecture Principale

Le projet est une application web moderne construite sur la stack suivante :

### 1. Framework & Rendu
* **Next.js 14.2 (App Router)** : Utilisation des React Server Components (RSC) par défaut pour maximiser les performances et le SEO. Les Server Actions sont privilégiées pour les mutations de données.
* **React 18** : Gestion de l'interface utilisateur.
* **TypeScript** : Typage statique strict sur l'ensemble de la base de code pour éviter les erreurs d'exécution.

### 2. Base de données & Persistance
* **Supabase** : Fournit PostgreSQL managé, le service d'authentification (**Supabase Auth**), et le stockage d'assets.
* **Drizzle ORM** : ORM TypeScript léger et performant. 
  - Utilisé pour la modélisation du schéma de données (`drizzle.config.ts`).
  - Permet de générer des migrations SQL et de les pousser de manière sécurisée (`npm run db:generate`, `npm run db:push`).

### 3. Gestion d'État & Requêtes
* **TanStack React Query v5** : Gestionnaire d'état asynchrone pour la synchronisation, le cache et la récupération des données provenant des APIs.
* **Axios** : Client HTTP utilisé pour communiquer avec les services tiers et les endpoints API internes.

### 4. Design, Composants & Expérience Visuelle Premium
* **TailwindCSS v3** : Framework CSS utilitaire de référence pour des designs fluides et responsifs.
* **Radix UI** : Primitives de composants sans style et pleinement accessibles (dialogues, menus déroulants, switchs, accordéons, etc.).
* **Framer Motion & GSAP (GreenSock)** : Moteurs d'animation haut de gamme pour concevoir des transitions fluides, des micro-animations interactives et des effets visuels immersifs (ex: glassmorphisme, parallaxe).
* **Lucide React** : Set d'icônes vectorielles modernes et légères.

### 5. Formulaires & Validation
* **React Hook Form** : Gestionnaire de formulaires léger et performant, évitant les rendus inutiles.
* **Zod** : Bibliothèque de déclaration de schémas et de validation de type en TypeScript. Utilisé en tandem avec React Hook Form (`@hookform/resolvers`) pour la validation côté client et côté serveur.

---

## 🚦 Règles de Développement & Bonnes Pratiques

### 1. Structure du Code
* **Dossier `app/`** : Contient les routes et pages de l'App Router de Next.js.
* **Dossier `components/`** : Composants React partagés (boutons, formulaires, modales).
* **Dossier `lib/`** : Initialisation des clients (ex: `supabaseClient.ts`, `drizzle.ts`).
* **Dossier `utils/`** : Fonctions d'aide pures (formateurs de date, calculs).

### 2. Ajout de nouvelles dépendances
* **Règle impérative** : Avant d'installer un nouveau package avec `npm install`, vous devez impérativement faire valider la dépendance par l'outil de scannage (`scan_dependencies`) afin de s'assurer qu'elle est sécurisée, compatible, et d'installer la version exacte recommandée.

### 3. Scripts Utiles
* **Lancer le serveur de dev** : `npm run dev`
* **Générer un schéma Drizzle** : `npm run db:generate`
* **Pousser les schémas sur Supabase** : `npm run db:push`
* **Vérifier la connexion DB** : `npm run db:test`
* **Appliquer les correctifs RLS** : `npm run db:rls`
