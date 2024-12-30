"use client"

import { useEffect, useState } from 'react'
import { AuthModal } from '@/components/auth-modal'
import { useAuth } from '@/contexts/auth-context'

export default function Home() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && !user) {
      setIsAuthModalOpen(true)
    }
  }, [user, loading])

  if (loading) {
    return <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">Loading...</div>
  }

  if (!user) {
    return (
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          if (user) setIsAuthModalOpen(false)
        }}
      />
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold">Welcome to Your Billing Software</h1>
      <p className="mt-2 text-muted-foreground">Select an option from the sidebar to get started.</p>
    </div>
  )
}

