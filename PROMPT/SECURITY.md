# 🔒 PROMPT : Directives Générales de Sécurité (SECURITY.md)

Ce document sert de référence absolue pour toutes les questions de sécurité, de gestion des données personnelles (RGPD) et d'audits de vulnérabilités dans le projet.

---

## 🏛️ Référentiel des Organismes de Sécurité & Protection des Données

Toutes les évaluations de sécurité du projet doivent s'aligner sur les travaux, standards et recommandations des organismes suivants :

### 1. Organismes Internationaux (Cybersécurité & Vulnérabilités)
* **OWASP (Open Web Application Security Project)** :
  * Maintient le **OWASP Top 10**, la liste de référence des dix risques de sécurité applicative web les plus critiques (injections, authentification défaillante, exposition de données sensibles, etc.).
  * Fournit des guides d'implémentation pour sécuriser le code JavaScript/TypeScript et les APIs.
* **MITRE Corporation & CVE (Common Vulnerabilities and Exposures)** :
  * Gère le catalogue mondial des vulnérabilités de sécurité publiques.
  * Chaque vulnérabilité identifiée dans une bibliothèque tierce (ex: dans `package.json`) est associée à un identifiant unique `CVE-AAAA-NNNNN`.
* **NIST (National Institute of Standards and Technology - USA)** :
  * Édite le **Cybersecurity Framework (CSF)** pour structurer la gestion des risques cyber.
  * Héberge la **NVD (National Vulnerability Database)**, qui enrichit les données des CVE avec des analyses d'impact et des scores de gravité.
* **FIRST (Forum of Incident Response and Security Teams)** :
  * Conçoit et maintient le standard **CVSS (Common Vulnerability Scoring System)** permettant d'évaluer de 0.0 à 10.0 la sévérité d'une CVE.
* **ENISA (European Union Agency for Cybersecurity)** :
  * Agence de l'Union européenne pour la cybersécurité. Elle émet des avis sur les menaces émergentes en Europe et coordonne la réponse aux incidents de grande ampleur.

### 2. Organismes Nationaux & Régulateurs des Données Personnelles
* **ANSSI (Agence Nationale de la sécurité des systèmes d'information - France)** :
  * Autorité nationale française assurant la sécurité numérique.
  * Publie le **Guide d'hygiène informatique** (règles indispensables de sécurisation des serveurs et développements) et le cadre **SecNumCloud**.
* **CNIL (Commission Nationale de l'Informatique et des Libertés - France)** :
  * Autorité administrative chargée de veiller à la protection des données personnelles en France en application du **RGPD (Règlement Général sur la Protection des Données)**.
  * Publie le **Guide de la sécurité des données personnelles pour les développeurs**, qui détaille les mesures techniques concrètes (gestion des secrets, hachage, chiffrement, gestion des sessions, purge des logs).
* **CEPD / EDPB (European Data Protection Board)** :
  * Comité européen regroupant les homologues européens de la CNIL pour assurer une application cohérente du RGPD au sein de l'UE.

---

## 🛡️ Règles Majeures de Sécurité Applicative

### 1. Protection contre les Injections (SQL, NoSQL, Commande)
* **Injection SQL** :
  * **Règle** : Ne jamais construire de requêtes SQL par concaténation de chaînes avec des variables utilisateur.
  * **Implémentation** : Toujours utiliser les requêtes paramétrées de **Drizzle ORM** (`db.select().from(...).where(eq(...))`). Si du SQL brut est nécessaire, utiliser les placeholders sécurisés fournis par Drizzle (`sql` template tag).
* **Injections de commande ou système** :
  * Éviter toute exécution de commandes shell basées sur des entrées utilisateur non assainies.

### 2. Protection contre les failles XSS (Cross-Site Scripting)
* **Règle** : Tout contenu affiché à l'écran en provenance d'une base de données ou d'une saisie utilisateur doit être échappé.
* **Implémentation dans Next.js** : React échappe automatiquement les chaînes affichées dans les expressions JSX (ex: `{userData.name}`).
  * **Interdiction** : Ne jamais utiliser `dangerouslySetInnerHTML` sans passer le contenu au préalable dans une bibliothèque de désinfection comme `dompurify` (côté client) ou `isomorphic-dompurify`.

### 3. Protection contre les failles CSRF (Cross-Site Request Forgery)
* **Règle** : Les requêtes changeant l'état du serveur (POST, PUT, DELETE) doivent être protégées.
* **Implémentation dans Next.js** : Les Server Actions de Next.js disposent de protections intégrées contre les CSRF. Pour les APIs REST traditionnelles, utiliser des jetons CSRF ou la configuration stricte des cookies (`SameSite=Lax` ou `SameSite=Strict` avec `Secure`).

### 4. Validation stricte des entrées (Zod Validation)
* **Règle** : Ne jamais faire confiance aux données client. Toute donnée entrante dans une API route ou une Server Action doit être validée structurellement.
* **Implémentation** : Définir des schémas **Zod** pour chaque payload et rejeter immédiatement les requêtes non conformes via `schema.safeParse()`.

---

## 👤 Directives RGPD & Données à Caractère Personnel

Tout développement traitant des données utilisateur (leads, profils, interactions) doit respecter les piliers du RGPD :

1. **Minimisation des données** :
   * Ne collecter que ce qui est strictement nécessaire pour la finalité poursuivie. Ne jamais stocker de données sensibles non justifiées (ex: religion, opinions politiques, données médicales).
2. **Sécurité et Chiffrement** :
   * Les données de connexion, identifiants et tokens de session doivent être transmis via HTTPS exclusivement.
   * Chiffrer en base les données hautement sensibles si nécessaire, et hacher les mots de passe avec des algorithmes robustes (géré automatiquement par le fournisseur d'authentification Supabase Auth).
3. **Contrôle d'Accès Strict (Supabase RLS)** :
   * Activer le **Row-Level Security (RLS)** sur TOUTES les tables Supabase.
   * Écrire des politiques d'accès restrictives pour s'assurer qu'un utilisateur ne peut lire ou modifier que ses propres données (`auth.uid() = user_id`).
4. **Non-fuite de données dans les Logs** :
   * **Règle critique** : Ne jamais afficher d'informations nominatives ou sensibles (noms, emails, numéros de téléphone, clés API, mots de passe) dans les `console.log()` ou les systèmes de logging de production.
   * Masquer ou anonymiser les logs avant envoi.
5. **Gestion du Consentement & Droits des Personnes** :
   * Fournir des interfaces claires pour que les utilisateurs puissent demander la suppression de leur compte (droit à l'effacement) ou exporter leurs données (droit à la portabilité).
