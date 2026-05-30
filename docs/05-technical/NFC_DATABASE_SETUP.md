# 🗄️ CONFIGURATION DE LA BASE DE DONNÉES NFC

## 📋 **PROBLÈME RÉSOLU**
```
Could not find the table 'public.nfc_profiles' in the schema cache
```

## 🎯 **SOLUTION**

### **Option 1 : Via l'interface Supabase (Recommandé)**

1. **Ouvrir Supabase Dashboard**
   - Aller sur [supabase.com](https://supabase.com)
   - Sélectionner votre projet

2. **Accéder à l'éditeur SQL**
   - Cliquer sur "SQL Editor" dans le menu de gauche
   - Cliquer sur "New query"

3. **Exécuter le script**
   - Copier le contenu du fichier `scripts/setup-nfc-database.sql`
   - Coller dans l'éditeur SQL
   - Cliquer sur "Run" ou `Ctrl+Enter`

### **Option 2 : Via la CLI Supabase**

```bash
# Si vous avez la CLI Supabase installée
supabase db reset
# ou
supabase migration up
```

### **Option 3 : Via le fichier de migration**

1. **Copier le fichier de migration**
   - Le fichier `supabase/migrations/20241201000000_create_nfc_profiles_table.sql` contient la migration complète

2. **L'exécuter dans Supabase**
   - Via l'interface web ou la CLI

## ✅ **VÉRIFICATION**

Après avoir exécuté le script, vous devriez voir :

### **1. Table créée**
```sql
SELECT * FROM public.nfc_profiles LIMIT 1;
```

### **2. Politiques RLS actives**
```sql
SELECT policyname FROM pg_policies WHERE tablename = 'nfc_profiles';
```

### **3. Index créés**
```sql
SELECT indexname FROM pg_indexes WHERE tablename = 'nfc_profiles';
```

## 🎯 **STRUCTURE DE LA TABLE**

```sql
CREATE TABLE public.nfc_profiles (
    id UUID PRIMARY KEY,                    -- ID unique
    user_id UUID NOT NULL,                  -- Propriétaire
    profile_id UUID,                        -- Profil associé (optionnel)
    profile_name VARCHAR(255) NOT NULL,     -- Nom affiché
    nfc_link TEXT NOT NULL,                 -- URL publique
    qr_code_url TEXT,                       -- QR code généré
    design_choice VARCHAR(100),             -- Design choisi
    color_theme VARCHAR(50),                -- Couleur choisie
    status VARCHAR(20),                     -- Statut de la carte
    created_at TIMESTAMP,                   -- Date de création
    updated_at TIMESTAMP,                   -- Date de modification
    shipped_at TIMESTAMP,                   -- Date d'expédition
    delivered_at TIMESTAMP,                 -- Date de livraison
    tracking_number VARCHAR(100)            -- Numéro de suivi
);
```

## 🔒 **SÉCURITÉ (RLS)**

- ✅ **Row Level Security** activé
- ✅ **Politiques** : Chaque utilisateur ne voit que ses cartes
- ✅ **Contraintes** : Validation des données
- ✅ **Index** : Performance optimisée

## 🚀 **APRÈS LA CONFIGURATION**

Une fois la table créée :

1. **Redémarrer l'application** Next.js
2. **Tester la création** d'une carte NFC
3. **Vérifier** qu'elle apparaît dans le dashboard

## 🆘 **DÉPANNAGE**

### **Erreur de permissions**
```sql
-- Vérifier que l'utilisateur a les bonnes permissions
SELECT current_user, current_database();
```

### **Erreur de contraintes**
```sql
-- Vérifier les contraintes
SELECT conname, contype FROM pg_constraint WHERE conrelid = 'nfc_profiles'::regclass;
```

### **Erreur de RLS**
```sql
-- Vérifier les politiques
SELECT * FROM pg_policies WHERE tablename = 'nfc_profiles';
```

---

**✅ Une fois cette configuration terminée, l'intégration des données réelles sera 100% fonctionnelle !**
