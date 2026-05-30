# ⚡ Quick Start - Onboarding V2

## 🎯 En 3 étapes rapides

### 1️⃣ Base de données (5 min)

```sql
-- Copiez et exécutez dans Supabase SQL Editor
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS linkedin TEXT;
```

### 2️⃣ Test (2 min)

```bash
npm run dev
```

Ouvrir : http://localhost:3000/dashboard/profiles/create-v2

### 3️⃣ Utilisation

1. Choisir un design parmi les 8
2. Remplir le formulaire adapté
3. Vérifier l'aperçu
4. Créer le profil

---

## 📚 Documentation complète

- **Guide d'implémentation** : `IMPLEMENTATION_GUIDE.md`
- **Documentation technique** : `ONBOARDING_V2_DOCUMENTATION.md`
- **Script SQL** : `DATABASE_UPDATES.md`

---

## 🎨 Les 8 designs disponibles

| Design | Pour qui ? | Couleurs |
|--------|-----------|----------|
| **Classique** | Professionnels | Bleu |
| **Moderne** | Créatifs | Violet |
| **Créatif** | Artistes | Violet/Orange/Rose |
| **Nature** | Minimalistes | Émeraude |
| **Influenceur** | Créateurs | Orange/Rouge |
| **E-commerce** | Vendeurs | Bleu/Orange/Vert |
| **Dark Elegant** | Photographes | Noir/Gris |
| **Freelance** | Solopreneurs | Bleu/Orange/Menthe |

---

## ✅ Checklist rapide

- [ ] Script SQL exécuté
- [ ] Serveur démarré
- [ ] Page accessible
- [ ] Test de création réussi
- [ ] Profil visible

---

## 🆘 Problème ?

**Erreur SQL** → Vérifier que vous êtes admin Supabase  
**Page 404** → Vérifier le chemin `/dashboard/profiles/create-v2`  
**Validation** → Remplir tous les champs requis (*)  
**Upload** → Vérifier la configuration Supabase Storage  

---

## 🚀 C'est tout !

Votre système d'onboarding V2 est prêt !

**Besoin d'aide ?** Consultez `IMPLEMENTATION_GUIDE.md`
