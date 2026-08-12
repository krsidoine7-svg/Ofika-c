import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/service-role'

export const dynamic = 'force-dynamic'


export async function GET(request: NextRequest) {
    try {
        const supabase = createAdminClient()
        
        const { data: templates, error: tError } = await supabase
            .from('template_schemas')
            .select('*')
            .order('name')
        
        if (tError) throw tError

        // Récupérer les stats d'utilisation par thème
        const { data: usageData } = await supabase
            .from('profile_template_data')
            .select('template_id')

        // Compter les utilisations par template_id
        const usageCounts: Record<string, number> = {}
        if (usageData) {
            usageData.forEach((row: any) => {
                usageCounts[row.template_id] = (usageCounts[row.template_id] || 0) + 1
            })
        }

        // Enrichir les templates avec le compteur d'utilisation
        const enrichedTemplates = (templates || []).map(t => ({
            ...t,
            usage_count: usageCounts[t.id] || 0
        }))

        // Calculer les catégories uniques
        const categories = [...new Set((templates || []).map(t => t.category).filter(Boolean))]

        const { data: recentDesigns } = await supabase
            .from('profiles')
            .select('id, name, username, email, design_choice, color_theme, image_url, profile_type, created_at')
            .order('created_at', { ascending: false })
            .limit(30)

        // Design distribution: combien d'utilisateurs par design
        const designDistribution: Record<string, number> = {}
        if (recentDesigns) {
            recentDesigns.forEach((p: any) => {
                const d = p.design_choice || 'non défini'
                designDistribution[d] = (designDistribution[d] || 0) + 1
            })
        }

        return NextResponse.json({ 
            success: true, 
            templates: enrichedTemplates,
            recentDesigns: recentDesigns || [],
            stats: {
                totalThemes: enrichedTemplates.length,
                totalCategories: categories.length,
                totalUsage: usageData?.length || 0,
                categories,
                designDistribution
            }
        })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const supabase = createAdminClient()
        const body = await request.json()

        const { slug, name, config, is_active } = body

        if (slug && config) {
            // Save theme configuration into system_config for platform-wide themes
            const configKey = `theme_config_${slug}`
            const { error: sysErr } = await supabase
                .from('system_config')
                .upsert({
                    key: configKey,
                    value: { slug, name, config, updated_at: new Date().toISOString() },
                    description: `Configuration du thème ${name} (${slug})`
                })

            if (sysErr) {
                console.warn('System config upsert warning:', sysErr)
            }

            // Check if template_schema exists for this slug
            const { data: existingTheme } = await supabase
                .from('template_schemas')
                .select('id')
                .eq('slug', slug)
                .maybeSingle()

            let schemaResult
            if (existingTheme?.id) {
                // Update existing record with id
                const { data: updated, error: updErr } = await supabase
                    .from('template_schemas')
                    .update({
                        name: name || slug,
                        description: `Thème personnalisé ${name}`,
                        is_active: is_active ?? true,
                        schema_definition: config
                    })
                    .eq('id', existingTheme.id)
                    .select()
                if (updErr) console.warn('template_schemas update warning:', updErr)
                schemaResult = updated?.[0]
            } else {
                // Insert new record with generated UUID
                const newId = crypto.randomUUID()
                const { data: inserted, error: insErr } = await supabase
                    .from('template_schemas')
                    .insert({
                        id: newId,
                        slug,
                        name: name || slug,
                        description: `Thème personnalisé ${name}`,
                        is_active: is_active ?? true,
                        schema_definition: config
                    })
                    .select()
                if (insErr) console.warn('template_schemas insert warning:', insErr)
                schemaResult = inserted?.[0]
            }

            return NextResponse.json({ 
                success: true, 
                data: schemaResult || { slug, name, config } 
            })
        }

        // Generic template insert
        const newId = body.id || crypto.randomUUID()
        const { data, error } = await supabase
            .from('template_schemas')
            .insert([{ ...body, id: newId }])
            .select()

        if (error) throw error
        return NextResponse.json({ success: true, data: data[0] })
    } catch (error: any) {
        console.error('Erreur POST /api/admin/themes:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const supabase = createAdminClient()
        const { id, ...updates } = await request.json()

        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 })

        const { data, error } = await supabase
            .from('template_schemas')
            .update(updates)
            .eq('id', id)
            .select()

        if (error) throw error
        return NextResponse.json({ success: true, data: data[0] })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const supabase = createAdminClient()
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 })

        const { error } = await supabase
            .from('template_schemas')
            .delete()
            .eq('id', id)

        if (error) throw error
        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
