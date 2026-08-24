'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function AdminQRRedirectsRedirectPage() {
    const router = useRouter()

    useEffect(() => {
        router.replace('/dashboard/admin/nfc?tab=qr-redirects')
    }, [router])

    return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-gray-900" />
        </div>
    )
}
