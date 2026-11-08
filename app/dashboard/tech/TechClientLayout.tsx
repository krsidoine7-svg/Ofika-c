'use client'

import React from 'react'
import { StaffMfaModal } from '@/components/core/auth/StaffMfaModal'

export function TechClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <StaffMfaModal />
    </>
  )
}
