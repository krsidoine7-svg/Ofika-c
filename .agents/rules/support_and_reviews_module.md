# 🛟 Module Support, Suggestions & Avis Clients Ofika (Wiki & Règles Permanente)

## 📌 Vue d'ensemble du Module
Le module **Support & Avis** permet aux utilisateurs de soumettre des avis 5⭐, des suggestions 💡, des signalements de bugs 🐛 et des demandes de support ❓, tout en permettant à l'administrateur de modérer, répondre, exporter et publier les avis vérifiés sur la Landing Page.

---

## 🎨 1. Landing Page (Section Avis Clients Vérifiés)
- **Emplacement** : Placé dans [`app/page.tsx`](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/Ofika-c-main/app/page.tsx#L782) **juste avant le Footer**.
- **Filtre strict** : Seuls les avis (`category === 'review'`) ayant `is_featured === true` sont affichés publiquement. Les suggestions, bugs et demandes de support restent 100% confidentiels.
- **Design Visuel** : Cartes blanc pur `rounded-3xl`, dégradé émeraude, 5 étoiles vertes brillantes, badge pilule `✓ Client Vérifié`, avatar avec mini-badge vert incrusté au coin inférieur droit, nom + poste • localisation en italique.

---

## 🗄️ 2. Schéma Base de Données & Supabase Realtime
- **Tables** : `public.support_tickets` & `public.ticket_messages`.
- **Publication Supabase Realtime** : Les tables `public.support_tickets`, `public.ticket_messages` et `public.notifications` sont membres de `supabase_realtime` avec `REPLICA IDENTITY FULL`.
- **Accès Admin** : L'administration utilise l'API serveur [`/api/admin/tickets`](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/Ofika-c-main/app/api/admin/tickets/route.ts) avec `createAdminClient()` (Service Role) pour contourner les blocages RLS client.

---

## 🔔 3. Notifications Push & Signal Sonore (Temps Réel)
- **Cloche de Notification** : Présente dans le Header de toutes les pages Client ([`app/dashboard/layout.tsx`](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/Ofika-c-main/app/dashboard/layout.tsx)) et Admin ([`app/dashboard/admin/layout.tsx`](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/Ofika-c-main/app/dashboard/admin/layout.tsx)) sur ordinateurs et téléphones.
- **Composant Écouteur** : [`SupportRealtimeNotifications.tsx`](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/Ofika-c-main/components/features/notifications/SupportRealtimeNotifications.tsx)
  - Déclenche un carillon Web Audio API (`playNotificationChime()`).
  - Déclenche des notifications Web Push sur le navigateur (`triggerWebPushNotification(...)`).
  - Génère des Toasts interactifs Sonner pour ouvrir directement la conversation.

---

## 📥 4. Exportation Excel (.CSV) et JSON
- **Fichier Utilitaires** : [`lib/utils/export-tickets.ts`](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/Ofika-c-main/lib/utils/export-tickets.ts)
- **Format Excel (.CSV)** : Contient l'en-tête BOM UTF-8 (`\uFEFF`) pour préserver les accents français (*é, è, à, ç*) sous Microsoft Excel.
- **Format JSON** : Fichier structuré pour sauvegarde d'historique et analyses avancées.
- **Exportation Dynamique** : Les boutons d'export dans `/dashboard/admin/tickets` exportent la vue actuellement filtrée par l'admin.
