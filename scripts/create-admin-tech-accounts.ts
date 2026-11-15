import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { join } from 'path'

dotenv.config({ path: join(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ ERREUR: NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant dans .env.local")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const ACCOUNTS_TO_PROVISION = [
  {
    email: 'admin.ofika@gmail.com',
    password: 'OfikaAdmin2026!',
    role: 'admin',
    firstName: 'Admin',
    lastName: 'Principal',
    name: 'Admin Ofika'
  },
  {
    email: 'tech.ofika@gmail.com',
    password: 'OfikaTech2026!',
    role: 'tech',
    firstName: 'Tech',
    lastName: 'Lead',
    name: 'Tech Lead Ofika'
  }
]

async function provisionAccounts() {
  console.log("🚀 Initialisation de la création des comptes ADMIN et TECH...\n")

  // Récupérer la liste des utilisateurs existants
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers({ perPage: 1000 })
  if (listError) {
    console.error("❌ Erreur lors de la récupération des utilisateurs:", listError.message)
    process.exit(1)
  }

  for (const account of ACCOUNTS_TO_PROVISION) {
    console.log(`----------------------------------------`)
    console.log(`👤 Traitement du compte : ${account.email} (Rôle: ${account.role.toUpperCase()})`)

    const existingAuthUser = users.find(u => u.email?.toLowerCase() === account.email.toLowerCase())
    let userId: string

    if (existingAuthUser) {
      userId = existingAuthUser.id
      console.log(`ℹ️  Compte Auth existant détecté (ID: ${userId}). Mise à jour du mot de passe et des métadonnées...`)
      
      const { error: updateAuthError } = await supabase.auth.admin.updateUserById(userId, {
        password: account.password,
        email_confirm: true,
        user_metadata: {
          first_name: account.firstName,
          last_name: account.lastName,
          full_name: account.name,
          name: account.name
        },
        app_metadata: {
          role: account.role
        }
      })

      if (updateAuthError) {
        console.error(`❌ Échec de mise à jour Auth pour ${account.email}:`, updateAuthError.message)
        continue
      }
      console.log(`✅ Auth mis à jour avec succès.`)
    } else {
      console.log(`✨ Création d'un nouveau compte Auth...`)
      const { data: newAuthUser, error: createAuthError } = await supabase.auth.admin.createUser({
        email: account.email,
        password: account.password,
        email_confirm: true,
        user_metadata: {
          first_name: account.firstName,
          last_name: account.lastName,
          full_name: account.name,
          name: account.name
        },
        app_metadata: {
          role: account.role
        }
      })

      if (createAuthError || !newAuthUser.user) {
        console.error(`❌ Échec de création Auth pour ${account.email}:`, createAuthError?.message)
        continue
      }
      userId = newAuthUser.user.id
      console.log(`✅ Compte Auth créé (ID: ${userId}).`)
    }

    // Synchronisation dans public.users
    console.log(`📦 Enregistrement dans la table public.users...`)
    const { error: dbError } = await supabase
      .from('users')
      .upsert({
        id: userId,
        email: account.email,
        name: account.name,
        first_name: account.firstName,
        last_name: account.lastName,
        role: account.role,
        is_active: true,
        subscription_tier: 'admin',
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' })

    if (dbError) {
      console.error(`⚠️ Avertissement table users:`, dbError.message)
    } else {
      console.log(`✅ Rôle '${account.role}' synchronisé dans public.users.`)
    }

    console.log(`🎉 Compte prêt : ${account.email} | Mot de passe : ${account.password}`)
  }

  console.log(`\n========================================`)
  console.log(`🎯 Tous les comptes sont opérationnels !`)
  console.log(`========================================\n`)
}

provisionAccounts().catch(err => {
  console.error("❌ Erreur inattendue:", err)
  process.exit(1)
})
