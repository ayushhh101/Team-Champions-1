'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  children: React.ReactNode
  // optional: allow passing a role or other checks later
  requireVerified?: boolean
}

/**
 * ProtectedRoute
 * - checks localStorage for `userId` / `userData` / `userMobile` (adapt to your login storage keys)
 * - if not found, redirects to /login
 * - usage: wrap your page's rendered content with <ProtectedRoute>...</ProtectedRoute>
 */
export default function ProtectedRoute({ children, requireVerified = false }: Props) {
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    // run only on client
    const checkAuth = () => {
      try {
        const userData = localStorage.getItem('userData') // optional stored after verify
        const userId = localStorage.getItem('userId')
        const userMobile = localStorage.getItem('userMobile')
        const userOTP = localStorage.getItem('userOTP') // your login sets this currently

        // basic presence check - adapt to your authentication keys
        const isPresent = !!(userId || userMobile || userData || userOTP)

        if (!isPresent) {
          // redirect to login if not authenticated
          router.replace('/login')
          return
        }

        // optional additional checks
        if (requireVerified && userData) {
          try {
            const parsed = JSON.parse(userData)
            if (!parsed?.verified) {
              router.replace('/login')
              return
            }
          } catch (err) {
            // parsing error -> redirect
            router.replace('/login')
            return
          }
        }

        // all good
        setChecking(false)
      } catch (err) {
        router.replace('/login')
      }
    }

    checkAuth()
  }, [router, requireVerified])

  if (checking) {
    // small centered loader - keep minimal and consistent with your design
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f2f1ef]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4682A9]" />
      </div>
    )
  }

  return <>{children}</>
}