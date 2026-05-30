# 🔒 Nettoyer les Secrets de l'Historique Git

## ⚠️ IMPORTANT
Vos secrets (API keys, mots de passe) sont dans l'historique Git !
Même si le repo n'est pas public, suivez ce guide pour les supprimer.

---

## 📋 ÉTAPE 1 : Révoquer les Secrets (URGENT)

### Supabase
1. Allez sur https://supabase.com/dashboard
2. Sélectionnez votre projet
3. Settings → API
4. Cliquez sur "Reset service_role key"
5. Cliquez sur "Reset anon key"
6. Notez les nouvelles clés

### Autres Services
- Régénérez toutes les clés API dans `.env`
- Changez les mots de passe de base de données

---

## 🧹 ÉTAPE 2 : Nettoyer Git avec BFG

### Méthode 1 : BFG Repo-Cleaner (Plus rapide)

#### Installation
```powershell
# Télécharger BFG
# Allez sur : https://rtyley.github.io/bfg-repo-cleaner/
# Téléchargez bfg.jar
```

#### Utilisation
```powershell
# 1. Cloner une copie miroir
cd s:\
git clone --mirror https://github.com/krsidoine7-svg/Ofika-c.git ofika-mirror
cd ofika-mirror

# 2. Supprimer .env.example de l'historique
java -jar path\to\bfg.jar --delete-files .env.example

# 3. Nettoyer
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 4. Forcer le push
git push --force
```

---

## 🛠️ MÉTHODE 2 : Git Filter-Branch (Manuelle)

### Script PowerShell

```powershell
# Dans votre projet
cd s:\nextjs-base-project

# Sauvegarder d'abord
git branch backup-avant-nettoyage

# Supprimer .env.example de TOUT l'historique
git filter-branch --force --index-filter `
  "git rm --cached --ignore-unmatch .env.example" `
  --prune-empty --tag-name-filter cat -- --all

# Nettoyer
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Forcer le push
git push origin --force --all
```

---

## ✅ ÉTAPE 3 : Corriger .env.example

### Créer un nouveau .env.example SÉCURISÉ

```bash
# Base de données Supabase
NEXT_PUBLIC_SUPABASE_URL=https://VOTRE-PROJECT-ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_anon_key_ici
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key_ici

# URL du site
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Autres services
# API_KEY=your_api_key_here
```

**⚠️ NE METTEZ JAMAIS les vraies valeurs dans .env.example !**

---

## 📝 ÉTAPE 4 : Vérifier le Nettoyage

```powershell
# Vérifier que .env.example n'est plus dans l'historique
git log --all --full-history -- .env.example

# Résultat attendu : Aucun commit (ou seulement le nouveau)
```

---

## 🔐 ÉTAPE 5 : Mettre à Jour .env

```powershell
# Éditez .env avec les NOUVELLES clés
notepad .env
```

Mettez les nouvelles clés de Supabase que vous avez régénérées.

---

## ✅ Checklist Finale

- [ ] Régénéré toutes les clés Supabase
- [ ] Nettoyé l'historique Git avec BFG ou filter-branch
- [ ] Forcé le push : `git push --force`
- [ ] Créé un nouveau .env.example sans secrets
- [ ] Mis à jour .env avec les nouvelles clés
- [ ] Vérifié que .env est dans .gitignore
- [ ] Testé que l'application fonctionne avec les nouvelles clés

---

## 🚨 Si Vous Avez des Problèmes

### Erreur "remote rejected"
```powershell
# Forcer VRAIMENT le push
git push origin main --force --no-verify
```

### Erreur "protected branch"
Allez sur GitHub → Settings → Branches → Décochez "Require pull request reviews"

### L'historique n'est pas nettoyé
```powershell
# Supprimer TOUTES les références
git for-each-ref --format='delete %(refname)' refs/original | git update-ref --stdin
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

---

## 💡 Prévention Future

### Vérifier avant de commit
```powershell
# Afficher ce qui sera commité
git diff --cached

# Vérifier qu'il n'y a pas de secrets
git diff --cached | Select-String "SUPABASE|API_KEY|PASSWORD"
```

### Utiliser un pre-commit hook

Créez `.git/hooks/pre-commit` :
```bash
#!/bin/sh
if git diff --cached --name-only | grep -q ".env$"; then
    echo "❌ ERREUR : Vous essayez de commiter .env !"
    echo "Utilisez .env.example à la place"
    exit 1
fi
```

---

## 📞 Aide

Si vous êtes bloqué, partagez-moi :
- Le message d'erreur exact
- La commande que vous avez tapée
- L'étape où vous êtes

**IMPORTANT : Faites les étapes dans l'ordre ! La révocation des clés est la priorité #1.**
