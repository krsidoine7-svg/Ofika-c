# 🔧 Fix erreur 404 : get_user_order_stats

## 🎯 Problème

L'application essaie d'appeler une fonction RPC Supabase qui n'existe pas :
```
Failed to load resource: the server responded with a status of 404
graqvtzmefiwsafaubcw.supabase.co/rest/v1/rpc/get_user_order_stats
```

## ✅ Solution rapide (2 minutes)

### Étape 1 : Ouvrir Supabase SQL Editor

1. Allez sur [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet
3. Cliquez sur **SQL Editor** dans le menu latéral

### Étape 2 : Exécuter le script

1. Ouvrez le fichier : `supabase/CREATE_ORDER_STATS_FUNCTION.sql`
2. **Copiez tout le contenu** du fichier
3. **Collez** dans le SQL Editor de Supabase
4. Cliquez sur **Run** (ou Ctrl+Enter)

### Étape 3 : Vérifier

Vous devriez voir :
```
✅ Fonction get_user_order_stats créée avec succès !
```

### Étape 4 : Recharger votre application

Rechargez votre page web (F5 ou Ctrl+R). L'erreur 404 devrait disparaître ! 🎉

---

## 🔍 Qu'est-ce que cette fonction fait ?

La fonction `get_user_order_stats` :
- 📊 Compte le nombre de commandes par statut (paid, pending, failed, cancelled)
- 💰 Calcule le montant total dépensé
- ✅ Vérifie si l'utilisateur peut commander plus (limite : 2 cartes)
- 🔒 Vérifie que l'utilisateur ne peut voir que ses propres statistiques

---

## 📝 Exemple d'utilisation dans le code

```typescript
const { data, error } = await supabase.rpc('get_user_order_stats', {
  user_uuid: userId
});

// Résultat :
// {
//   total_orders: 3,
//   paid_orders: 2,
//   pending_orders: 1,
//   failed_orders: 0,
//   cancelled_orders: 0,
//   total_spent: 29.98,
//   can_order_more: false
// }
```

---

## 🐛 Si l'erreur persiste

### Vérifier que la fonction existe

Exécutez dans SQL Editor :
```sql
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public' 
  AND routine_name = 'get_user_order_stats';
```

Si aucun résultat → La fonction n'est pas créée, réessayez l'étape 2.

### Vérifier les permissions

Exécutez dans SQL Editor :
```sql
SELECT 
  routine_name,
  grantee,
  privilege_type
FROM information_schema.routine_privileges
WHERE routine_name = 'get_user_order_stats';
```

Vous devriez voir `authenticated` et `anon` avec `EXECUTE`.

### Vider le cache

1. Ouvrez DevTools (F12)
2. Cliquez droit sur le bouton Refresh
3. Choisir "Vider le cache et actualiser"

---

## 🚀 Autres fonctions manquantes ?

Si vous voyez d'autres erreurs 404 pour des fonctions RPC, vérifiez dans :
- `database/` - Dossier avec les migrations
- `scripts/` - Scripts de setup
- `supabase/migrations/` - Migrations Supabase

Et appliquez les scripts SQL correspondants de la même manière !

---

## ✅ Checklist

- [ ] Script `CREATE_ORDER_STATS_FUNCTION.sql` exécuté dans Supabase
- [ ] Message de confirmation "✅ Fonction créée avec succès" affiché
- [ ] Page web rechargée
- [ ] Erreur 404 disparue
- [ ] Dashboard affiche correctement les statistiques

**Une fois tout vérifié, l'erreur est corrigée ! 🎉**
