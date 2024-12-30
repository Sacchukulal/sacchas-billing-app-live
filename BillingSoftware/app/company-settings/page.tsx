"use client"

import { useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { CompanyForm } from '@/components/company-form'

export default function CompanySettings() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  if (!user) {
    return null
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Company Settings</h1>
      <CompanyForm />
    </div>
  )
}

