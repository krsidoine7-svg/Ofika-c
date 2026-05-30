import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/service-role'

export const dynamic = 'force-dynamic'


export async function GET(request: NextRequest) {
    try {
        const supabase = createAdminClient()
        const { searchParams } = new URL(request.url)
        const query = (searchParams.get('q') || '').toLowerCase()
        const filterType = searchParams.get('type') || 'all'

        // 1. Récupérer les liens de la table 'links'
        const { data: structuredLinks, error: lError } = await supabase
            .from('links')
            .select('id, title, url, profile_id, is_active, click_count, created_at')
            .order('created_at', { ascending: false })
            .limit(100)

        if (lError) {
            console.error('❌ Database error (links table):', lError)
        }

        // Enrich structured links with profiles manually
        let allLinks: any[] = []
        if (structuredLinks && structuredLinks.length > 0) {
            const profileIds = structuredLinks.map(l => l.profile_id).filter(Boolean)
            const { data: linkProfiles } = await supabase
                .from('profiles')
                .select('id, name, username, is_active')
                .in('id', profileIds)

            allLinks = structuredLinks.map(l => {
                const profileObj = linkProfiles?.find(p => p.id === l.profile_id)
                return {
                    id: l.id,
                    db_table: 'links',
                    title: l.title || 'Lien personnalisé',
                    url: l.url || '',
                    created_at: l.created_at || new Date().toISOString(),
                    click_count: l.click_count || 0,
                    is_active: l.is_active,
                    type: 'structured',
                    owner: {
                        name: profileObj?.name || 'Sans profil',
                        username: profileObj?.username || '?',
                        id: profileObj?.id,
                        is_active: profileObj?.is_active ?? true
                    }
                }
            })
        }

        // 2. Extraire les liens JSON des profils
        const { data: recentProfiles, error: pError } = await supabase
            .from('profiles')
            .select('id, name, username, is_active, social_links, custom_links, created_at')
            .order('created_at', { ascending: false })
            .limit(100)

        if (pError) console.error('❌ Database error (profiles table):', pError)

        if (recentProfiles) {
            recentProfiles.forEach(profile => {
                // Social Links
                if (profile.social_links && Array.isArray(profile.social_links)) {
                    profile.social_links.forEach((sl: any, idx: number) => {
                        const url = sl.url || sl.value;
                        if (url && typeof url === 'string') {
                            allLinks.push({
                                id: `${profile.id}|social|${idx}`,
                                db_table: 'profiles_json',
                                parent_profile_id: profile.id,
                                title: sl.platform || sl.type || 'Social',
                                url: url,
                                created_at: profile.created_at || new Date().toISOString(),
                                click_count: 0,
                                is_active: profile.is_active && (sl.is_active !== false),
                                type: 'social',
                                owner: {
                                    name: profile.name || 'Sans nom',
                                    username: profile.username || '?',
                                    id: profile.id,
                                    is_active: profile.is_active
                                }
                            })
                        }
                    })
                }
                // Custom Links
                if (profile.custom_links && Array.isArray(profile.custom_links)) {
                    profile.custom_links.forEach((cl: any, idx: number) => {
                        if (cl.url && typeof cl.url === 'string') {
                            allLinks.push({
                                id: `${profile.id}|custom|${idx}`,
                                db_table: 'profiles_json',
                                parent_profile_id: profile.id,
                                title: cl.title || 'Lien',
                                url: cl.url,
                                created_at: profile.created_at || new Date().toISOString(),
                                click_count: 0,
                                is_active: profile.is_active && (cl.is_active !== false),
                                type: 'custom_json',
                                owner: {
                                    name: profile.name || 'Sans nom',
                                    username: profile.username || '?',
                                    id: profile.id,
                                    is_active: profile.is_active
                                }
                            })
                        }
                    })
                }
            })
        }

        // 3. Récupérer les redirections QR
        const { data: qrLinks, error: qrError } = await supabase
            .from('qr_redirects')
            .select('id, title, nfc_link, short_code, user_id, is_active, scan_count, created_at')
            .order('created_at', { ascending: false })
            .limit(50)

        if (qrError) console.error('❌ Database error (qr_redirects):', qrError)

        if (qrLinks && qrLinks.length > 0) {
            const userIds = qrLinks.map(qr => qr.user_id).filter(Boolean)
            const { data: qrProfiles } = await supabase
                .from('profiles')
                .select('id, name, username, user_id, is_active')
                .in('user_id', userIds)

            qrLinks.forEach(qr => {
                const profile = qrProfiles?.find(p => p.user_id === qr.user_id)
                allLinks.push({
                    id: qr.id,
                    db_table: 'qr_redirects',
                    title: qr.title || `QR: ${qr.short_code}`,
                    url: qr.nfc_link,
                    created_at: qr.created_at,
                    click_count: qr.scan_count || 0,
                    is_active: qr.is_active,
                    type: 'qr_redirect',
                    owner: {
                        name: profile?.name || 'Utilisateur',
                        username: profile?.username || qr.short_code,
                        id: profile?.id || qr.user_id,
                        is_active: profile?.is_active ?? true
                    }
                })
            })
        }

        // 4. Filtrage par recherche et type
        if (query || filterType !== 'all') {
            allLinks = allLinks.filter(l => {
                // Type filter
                if (filterType !== 'all') {
                    if (filterType === 'social' && !['social', 'custom_json'].includes(l.type)) return false
                    if (filterType !== 'social' && l.type !== filterType) return false
                }

                // Search query
                if (query) {
                    const titleMatch = String(l.title || '').toLowerCase().includes(query)
                    const urlMatch = String(l.url || '').toLowerCase().includes(query)
                    const nameMatch = String(l.owner?.name || '').toLowerCase().includes(query)
                    const userMatch = String(l.owner?.username || '').toLowerCase().includes(query)
                    return titleMatch || urlMatch || nameMatch || userMatch
                }
                return true
            })
        }

        // 5. Tri final
        allLinks.sort((a, b) => {
            const dateA = new Date(a.created_at).getTime() || 0
            const dateB = new Date(b.created_at).getTime() || 0
            return dateB - dateA
        })

        return NextResponse.json({ 
            success: true, 
            links: allLinks.slice(0, 70),
            totalCount: allLinks.length 
        })
    } catch (error: any) {
        console.error('🔥 Critical Moderation API Error:', error)
        return NextResponse.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 })
    }
}
