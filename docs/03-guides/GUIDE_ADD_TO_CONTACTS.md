# 📱 Guide Add to Contacts - Module 4

## 🎯 Vue d'ensemble

Le module **Add to Contacts** permet aux utilisateurs de partager facilement leurs informations de contact via des fichiers vCard. Il fonctionne sur mobile (Web Share API) et desktop (téléchargement direct).

## 🚀 Fonctionnalités

### ✅ Implémentées
- **Génération vCard** : Format standard vCard 3.0
- **Support mobile** : Web Share API pour iOS/Android
- **Support desktop** : Téléchargement direct
- **Analytics** : Tracking des actions utilisateur
- **Interface responsive** : Design adaptatif
- **Notifications** : Feedback utilisateur avec Sonner

## 📁 Fichiers Créés

### Composants
- `components/AddToContactsButton.tsx` - Bouton principal
- `components/ProfileCardWithContacts.tsx` - Carte profil avec bouton
- `components/ContactAnalytics.tsx` - Statistiques des contacts

### Utilitaires
- `lib/vcard-generator.ts` - Générateur vCard
- `lib/supabase/profiles.ts` - Récupération des profils
- `lib/hooks/useContactAnalytics.ts` - Hook analytics

### Pages
- `app/[username]/page.tsx` - Page profil publique
- `app/[username]/not-found.tsx` - Page 404 profil
- `app/test-add-to-contacts/page.tsx` - Page de test

### Base de données
- `database/contact-analytics-table.sql` - Table analytics

## 🧪 Comment Tester

### 1. Page de Test
Visitez `/test-add-to-contacts` pour tester toutes les fonctionnalités :

```bash
# Démarrer le serveur
npm run dev

# Aller sur
http://localhost:3000/test-add-to-contacts
```

### 2. Test sur Mobile
1. Ouvrir la page sur un mobile
2. Cliquer sur "Ajouter aux contacts"
3. Vérifier que l'app Contacts s'ouvre
4. Confirmer l'ajout du contact

### 3. Test sur Desktop
1. Ouvrir la page sur un desktop
2. Cliquer sur "Télécharger le contact"
3. Vérifier que le fichier .vcf se télécharge
4. Ouvrir le fichier dans votre app Contacts

### 4. Test Page Publique
1. Créer un profil avec un username
2. Aller sur `/[username]`
3. Tester le bouton Add to Contacts

## 🔧 Configuration

### Variables d'Environnement
Aucune variable supplémentaire requise. Le module utilise les variables Supabase existantes.

### Dépendances
```bash
npm install sonner
```

### Base de Données
Exécuter le script SQL pour créer la table analytics :

```sql
-- Exécuter dans Supabase SQL Editor
\i database/contact-analytics-table.sql
```

## 📊 Analytics

### Métriques Trackées
- **vcard_generated** : Nombre de vCard générés
- **vcard_downloaded** : Téléchargements desktop
- **vcard_shared** : Partages mobile
- **device_type** : Mobile vs Desktop
- **user_agent** : Informations navigateur

### Utilisation
```typescript
import { useContactAnalytics } from '@/lib/hooks/useContactAnalytics';

const { trackContactAction, getContactStats } = useContactAnalytics();

// Tracker une action
await trackContactAction({
  profile_id: 'profile-id',
  action_type: 'vcard_generated'
});

// Obtenir les statistiques
const stats = await getContactStats('profile-id');
```

## 🎨 Personnalisation

### Styles
Le bouton utilise les couleurs Ofika par défaut :
```css
bg-gradient-to-r from-ofika-orange to-ofika-pink
```

### Variantes
```typescript
<AddToContactsButton 
  profile={profile}
  variant="outline"  // default, outline, ghost
  size="sm"         // sm, default, lg
  className="custom-class"
/>
```

### Contenu vCard
Modifier `lib/vcard-generator.ts` pour ajouter des champs personnalisés :

```typescript
// Ajouter un champ personnalisé
if (profile.customField) {
  vcard.push(`X-CUSTOM:${this.escapeVCardValue(profile.customField)}`);
}
```

## 🐛 Dépannage

### Problèmes Courants

#### 1. Web Share API ne fonctionne pas
- **Cause** : Navigateur non supporté
- **Solution** : Le fallback desktop se déclenche automatiquement

#### 2. Fichier vCard corrompu
- **Cause** : Caractères spéciaux non échappés
- **Solution** : Vérifier la fonction `escapeVCardValue`

#### 3. Analytics ne se trackent pas
- **Cause** : Table `contact_analytics` non créée
- **Solution** : Exécuter le script SQL

#### 4. Erreur "Profile not found"
- **Cause** : Username incorrect ou profil non public
- **Solution** : Vérifier la configuration du profil

### Logs de Debug
```typescript
// Activer les logs
console.log('Contact action tracked:', { action, profileName, timestamp: new Date() });
```

## 📱 Compatibilité

### Navigateurs Supportés
- **Mobile** : iOS Safari 12+, Chrome Android 80+
- **Desktop** : Chrome 80+, Firefox 75+, Safari 13+, Edge 80+

### Apps Contacts
- **iOS** : Contacts natif
- **Android** : Contacts Google, Samsung, etc.
- **Desktop** : Outlook, Apple Contacts, Thunderbird

## 🚀 Prochaines Étapes

### Améliorations Possibles
1. **QR Code** : Ajouter un QR code pour le vCard
2. **Templates** : Différents modèles de vCard
3. **Partage** : Intégration réseaux sociaux
4. **Analytics** : Graphiques et rapports avancés
5. **Notifications** : Push notifications pour les nouveaux contacts

### Intégration
- **Module 3** : Intégrer avec les cartes NFC/QR
- **Module 6** : Ajouter aux analytics globaux
- **Module 7** : Optimiser pour la production

## ✅ Checklist de Validation

- [ ] Bouton fonctionne sur mobile (Web Share API)
- [ ] Bouton fonctionne sur desktop (téléchargement)
- [ ] Fichier vCard s'ouvre correctement
- [ ] Toutes les informations sont présentes
- [ ] Analytics se trackent correctement
- [ ] Interface responsive
- [ ] Notifications utilisateur
- [ ] Gestion des erreurs
- [ ] Page 404 pour profils inexistants
- [ ] Tests sur différents navigateurs

## 📞 Support

Pour toute question ou problème :
1. Vérifier les logs de la console
2. Tester sur la page `/test-add-to-contacts`
3. Vérifier la configuration Supabase
4. Consulter la documentation des APIs utilisées

---

*Module 4 - Add to Contacts - Version 1.0*
