// =====================================================
// EXEMPLE: Service Profiles avec Drizzle ORM
// Remplace les appels Supabase Client par Drizzle
// =====================================================

import { db } from '@/lib/db';
import { profiles, links, profileTemplateData, templateSchemas } from '@/drizzle/schema';
import type { Profile, NewProfile, Link } from '@/drizzle/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

// =====================================================
// CRUD PROFILES
// =====================================================

/**
 * Récupérer tous les profils d'un utilisateur
 */
export async function getUserProfiles(userId: string): Promise<Profile[]> {
  return await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .orderBy(desc(profiles.createdAt));
}

/**
 * Récupérer un profil par ID
 */
export async function getProfileById(profileId: string): Promise<Profile | undefined> {
  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, profileId))
    .limit(1);
  
  return profile;
}

/**
 * Récupérer un profil par custom URL
 */
export async function getProfileByCustomUrl(customUrl: string): Promise<Profile | undefined> {
  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.customUrl, customUrl))
    .limit(1);
  
  return profile;
}

/**
 * Récupérer un profil avec ses liens (relation)
 */
export async function getProfileWithLinks(profileId: string) {
  return await db.query.profiles.findFirst({
    where: eq(profiles.id, profileId),
    with: {
      links: {
        where: eq(links.isActive, true),
        // @ts-ignore - Drizzle typing issue
        orderBy: (linksTable: any, { asc }: any) => [asc(linksTable.orderIndex)],
      },
    },
  });
}

/**
 * Récupérer un profil avec template data
 */
export async function getProfileWithTemplate(profileId: string) {
  return await db.query.profiles.findFirst({
    where: eq(profiles.id, profileId),
    with: {
      templateData: {
        with: {
          template: true,
        },
      },
      links: {
        where: eq(links.isActive, true),
      },
    },
  });
}

/**
 * Créer un nouveau profil
 */
export async function createProfile(data: NewProfile): Promise<Profile> {
  const [newProfile] = await db
    .insert(profiles)
    .values({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();
  
  return newProfile;
}

/**
 * Mettre à jour un profil
 */
export async function updateProfile(
  profileId: string,
  userId: string,
  data: Partial<NewProfile>
): Promise<Profile | null> {
  const [updated] = await db
    .update(profiles)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(profiles.id, profileId),
        eq(profiles.userId, userId)
      )
    )
    .returning();
  
  return updated || null;
}

/**
 * Supprimer un profil (soft delete)
 */
export async function deleteProfile(profileId: string, userId: string): Promise<boolean> {
  const [deleted] = await db
    .update(profiles)
    .set({
      isActive: false,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(profiles.id, profileId),
        eq(profiles.userId, userId)
      )
    )
    .returning();
  
  return !!deleted;
}

/**
 * Supprimer un profil définitivement
 */
export async function hardDeleteProfile(profileId: string, userId: string): Promise<boolean> {
  const result = await db
    .delete(profiles)
    .where(
      and(
        eq(profiles.id, profileId),
        eq(profiles.userId, userId)
      )
    );
  
  return result.rowCount ? result.rowCount > 0 : false;
}

// =====================================================
// STATISTIQUES & RECHERCHE
// =====================================================

/**
 * Compter les profils d'un utilisateur
 */
export async function countUserProfiles(userId: string): Promise<number> {
  const [result] = await db
    .select({ count: sql<number>`cast(count(*) as integer)` })
    .from(profiles)
    .where(eq(profiles.userId, userId));
  
  return result.count;
}

/**
 * Rechercher des profils publics par nom
 */
export async function searchPublicProfiles(query: string): Promise<Profile[]> {
  return await db
    .select()
    .from(profiles)
    .where(
      and(
        eq(profiles.isPublic, true),
        sql`${profiles.name} ILIKE ${'%' + query + '%'}`
      )
    )
    .limit(20);
}

/**
 * Récupérer les profils les plus récents (publics)
 */
export async function getRecentPublicProfiles(limit: number = 10): Promise<Profile[]> {
  return await db
    .select()
    .from(profiles)
    .where(
      and(
        eq(profiles.isPublic, true),
        eq(profiles.isActive, true)
      )
    )
    .orderBy(desc(profiles.createdAt))
    .limit(limit);
}

// =====================================================
// GESTION DES LIENS
// =====================================================

/**
 * Ajouter un lien à un profil
 */
export async function addLinkToProfile(
  profileId: string,
  linkData: { title: string; url: string; description?: string; icon?: string }
): Promise<Link> {
  // Récupérer le dernier orderIndex
  const [lastLink] = await db
    .select()
    .from(links)
    .where(eq(links.profileId, profileId))
    .orderBy(desc(links.orderIndex))
    .limit(1);
  
  const nextOrderIndex = lastLink ? lastLink.orderIndex + 1 : 0;
  
  const [newLink] = await db
    .insert(links)
    .values({
      profileId,
      ...linkData,
      orderIndex: nextOrderIndex,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();
  
  return newLink;
}

/**
 * Réorganiser les liens d'un profil
 */
export async function reorderLinks(
  profileId: string,
  linkOrders: { id: string; orderIndex: number }[]
): Promise<void> {
  await db.transaction(async (tx: any) => {
    for (const { id, orderIndex } of linkOrders) {
      await tx
        .update(links)
        .set({ orderIndex, updatedAt: new Date() })
        .where(
          and(
            eq(links.id, id),
            eq(links.profileId, profileId)
          )
        );
    }
  });
}

// =====================================================
// COMPARAISON: AVANT (Supabase) vs APRÈS (Drizzle)
// =====================================================

/*
AVANT (Supabase Client):
────────────────────────────────────────────────

const { data, error } = await supabase
  .from('profiles')
  .select('*, links(*)')
  .eq('user_id', userId)
  .order('created_at', { ascending: false });

if (error) throw error;
return data;


APRÈS (Drizzle):
────────────────────────────────────────────────

return await db.query.profiles.findMany({
  where: eq(profiles.userId, userId),
  with: { links: true },
  orderBy: (profiles, { desc }) => [desc(profiles.createdAt)],
});


AVANTAGES:
────────────────────────────────────────────────
✅ Type-safe à 100% (auto-complétion)
✅ Pas de gestion manuelle des erreurs
✅ Relations automatiques
✅ Requêtes SQL optimisées
✅ Transactions natives
✅ Migrations versionnées
✅ Performance supérieure

*/
