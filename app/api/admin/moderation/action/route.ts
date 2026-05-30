import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/service-role'
import { AuditService } from '@/lib/services/audit-service'

export const dynamic = 'force-dynamic'


export async function POST(request: NextRequest) {
    try {
        const supabase = createAdminClient()
        const { action, id, table, value, profile_id } = await request.json()

        if (!action || !id || !table) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
        }

        let result

        if (action === 'TOGGLE_ACTIVE') {
            if (table === 'qr_redirects') {
                result = await supabase
                    .from('qr_redirects')
                    .update({ is_active: value, updated_at: new Date().toISOString() })
                    .eq('id', id)
                    .select()
            } else if (table === 'links') {
                result = await supabase
                    .from('links')
                    .update({ is_active: value, updated_at: new Date().toISOString() })
                    .eq('id', id)
                    .select()
            } else if (table === 'profiles_json') {
                // Format: profileId|type|index
                const parts = id.split('|')
                if (parts.length !== 3) return NextResponse.json({ error: 'Invalid JSON link ID' }, { status: 400 })
                
                const [profileId, linkType, linkIndex] = parts
                const idx = parseInt(linkIndex)

                const { data: profile } = await supabase
                    .from('profiles')
                    .select('id, social_links, custom_links')
                    .eq('id', profileId)
                    .single()
                
                if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

                const column = linkType === 'social' ? 'social_links' : 'custom_links'
                const links = Array.isArray(profile[column]) ? [...profile[column]] : []

                if (links[idx]) {
                    links[idx].is_active = value
                    
                    result = await supabase
                        .from('profiles')
                        .update({ [column]: links })
                        .eq('id', profileId)
                        .select()
                } else {
                    return NextResponse.json({ error: 'Link index not found' }, { status: 404 })
                }
            } else {
                return NextResponse.json({ error: `Table ${table} non supportée pour cette action` }, { status: 400 })
            }

            if (result?.error) throw result.error
            if (!result?.data || result.data.length === 0) {
                return NextResponse.json({ error: 'Contenu non trouvé ou aucune mise à jour effectuée' }, { status: 404 })
            }
            
            await AuditService.log({
                action: value ? 'MODERATION_UNBAN' : 'MODERATION_BAN',
                targetType: table === 'qr_redirects' ? 'qr_redirect' : 'link',
                targetId: id,
                details: { table }
            })

            return NextResponse.json({ success: true })
        }

        if (action === 'SUSPEND_PROFILE') {
            const pid = profile_id || id 
            const isActivating = value === true
            
            // On essaie d'abord par ID de profil, puis par user_id si ça échoue
            result = await supabase
                .from('profiles')
                .update({ 
                    is_active: isActivating, 
                    suspension_reason: isActivating ? null : (value || 'Violation des conditions d\'utilisation'),
                    updated_at: new Date().toISOString() 
                })
                .eq('id', pid)
                .select()

            if (result.error) throw result.error
            
            if (!result.data || result.data.length === 0) {
                result = await supabase
                    .from('profiles')
                    .update({ 
                        is_active: isActivating, 
                        suspension_reason: isActivating ? null : (value || 'Violation des conditions d\'utilisation (Target: User ID)'),
                        updated_at: new Date().toISOString() 
                    })
                    .eq('user_id', pid)
                    .select()
                
                if (result.error) throw result.error
            }

            if (!result.data || result.data.length === 0) {
                return NextResponse.json({ error: 'Aucun profil trouvé pour cet ID' }, { status: 404 })
            }

            // Loguer pour chaque profil affecté
            for (const p of result.data) {
                await AuditService.log({
                    action: isActivating ? 'MODERATION_UNBAN' : 'MODERATION_BAN',
                    targetType: 'profile',
                    targetId: p.id,
                    details: { status: isActivating ? 'active' : 'suspended', reason: isActivating ? 'Re-authorized' : value, scope: 'full_profile' }
                })
            }

            return NextResponse.json({ success: true })
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    } catch (error: any) {
        console.error('🔥 Moderation Action Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
