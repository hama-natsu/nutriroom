'use client'

import { AuthGuard } from '@/components/auth/AuthGuard'
import { AppFlowManager } from '@/components/app-flow-manager'

export default function HomePage() {
  return (
    <AuthGuard>
      <AppFlowManager />
    </AuthGuard>
  )
}