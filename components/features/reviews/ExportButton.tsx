'use client'

import { useState } from 'react'
import { Download, FileJson, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useExportReviews, type ExportFormat } from '@/lib/hooks/useExportReviews'

// ========================================
// TYPES
// ========================================

interface ExportButtonProps {
    linkId: string
    filters?: {
        rating?: number
        status?: 'pending' | 'approved' | 'rejected'
    }
    variant?: 'default' | 'outline' | 'ghost'
    size?: 'default' | 'sm' | 'lg' | 'icon'
}

// ========================================
// COMPONENT
// ========================================

export function ExportButton({
    linkId,
    filters,
    variant = 'outline',
    size = 'default',
}: ExportButtonProps) {
    const { mutate: exportReviews, isPending } = useExportReviews()

    const handleExport = (format: ExportFormat) => {
        exportReviews({
            linkId,
            format,
            filters,
        })
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant={variant} size={size} disabled={isPending}>
                    {isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Download className="mr-2 h-4 w-4" />
                    )}
                    {isPending ? 'Export...' : 'Exporter'}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport('csv')}>
                    <Download className="mr-2 h-4 w-4" />
                    Télécharger CSV
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => handleExport('json')}>
                    <FileJson className="mr-2 h-4 w-4" />
                    Exporter JSON
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
