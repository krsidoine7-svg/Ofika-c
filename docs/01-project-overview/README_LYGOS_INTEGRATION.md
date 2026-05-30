# 📋 README - Intégration LyGOS

## 🎯 Aperçu rapide

Ce projet utilise maintenant **LyGOS** comme système de paiement principal, remplaçant complètement **Wave-CI**.

## ⚡ Démarrage rapide

1. **Copier les variables d'environnement**
   ```bash
   cp .env.example .env.local
   ```

2. **Configurer LyGOS**
   ```bash
   # Dans .env.local
   LYGOS_API_KEY=votre_clé_api_lygos
   LYGOS_WEBHOOK_SECRET=votre_secret_webhook_lygos
   ```

3. **Installer les dépendances**
   ```bash
   npm install
   ```

4. **Appliquer les migrations**
   ```bash
   npx drizzle-kit push
   ```

5. **Tester l'intégration**
   ```bash
   npx tsx scripts/test-lygos-full-integration.ts
   ```

## 📁 Fichiers clés LyGOS

### Backend
- `app/api/payments/lygos/create/route.ts` - Création paiement
- `app/api/payments/lygos/webhook/route.ts` - Webhooks
- `app/api/payments/lygos/status/route.ts` - Vérification statut
- `lib/services/lygos-api.ts` - Service API LyGOS
- `lib/services/payments-lygos.ts` - Service paiements

### Frontend
- `lib/hooks/usePayments.ts` - Hooks React
- `components/features/card-ordering/PaymentProcessStatus.tsx` - UI paiement

### Tests
- `scripts/test-lygos-integration.ts` - Test de base
- `scripts/test-lygos-webhook-simulation.ts` - Test webhooks
- `scripts/test-lygos-full-integration.ts` - Test complet

## 🔄 Migration depuis Wave-CI

### Fichiers supprimés
- ❌ `lib/services/payments-wave.ts`
- ❌ `lib/services/wave-payment.ts`
- ❌ `app/api/payments/wave/`
- ❌ `lib/hooks/usePayments-wave.ts`
- ❌ `components/features/card-ordering/PaymentProcessStatus-Wave.tsx`

### Changements dans la base de données
- ✅ Ajout de `lygos_payment_id` et `lygos_payment_url`
- ❌ Suppression de `wave_payment_id` et `wave_payment_url`

## 🧪 Tests

### Test rapide
```bash
npx tsx scripts/test-lygos-integration.ts
```

### Test complet
```bash
npx tsx scripts/test-lygos-full-integration.ts
```

### Test webhooks
```bash
npx tsx scripts/test-lygos-webhook-simulation.ts
```

## 📚 Documentation complète

Voir [LYGOS_MIGRATION_COMPLETE_GUIDE.md](./LYGOS_MIGRATION_COMPLETE_GUIDE.md) pour une documentation détaillée.

## 🚨 Points importants

1. **Configuration obligatoire**: `LYGOS_API_KEY` et `LYGOS_WEBHOOK_SECRET`
2. **Webhook**: Configurez `https://votresite.com/api/payments/lygos/webhook` dans votre dashboard LyGOS
3. **Tests**: Exécutez toujours les tests avant le déploiement
4. **Monitoring**: Surveillez les logs des paiements et webhooks

## 🆘 Support

- 📖 [Documentation LyGOS](https://docs.lygosapp.com)
- 🧪 [Scripts de test](../scripts/)
- 📝 [Guide complet](./LYGOS_MIGRATION_COMPLETE_GUIDE.md)

---

**Intégration LyGOS - Version 1.0 - 25 janvier 2025** ✨
