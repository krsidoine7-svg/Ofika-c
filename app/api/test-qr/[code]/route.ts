
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { code: string } }
) {
  const { code } = params
  const supabase = await createClient()

  console.log(`[TEST-API] Checking code: ${code}`)

  const { data, error } = await supabase
    .from('qr_redirects')
    .select('*')
    .ilike('short_code', code)
    .eq('is_active', true)
    .maybeSingle()

  return NextResponse.json({
    code,
    found: !!data,
    data,
    error
  })
}
