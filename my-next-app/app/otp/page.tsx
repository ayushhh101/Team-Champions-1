'use client'

import React from 'react'
import { useState, useEffect } from 'react'
import { ChevronLeft, Delete } from 'lucide-react'
import { useRouter } from 'next/navigation'
import toast, { Toaster } from 'react-hot-toast'
import userData from '../data/data.json'

export default function OTPPage() {
  const router = useRouter()
  const [otp, setOtp] = useState(['', '', '', ''])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(55)
  const [userDetails, setUserDetails] = useState<{mobile: string, email: string, expectedOtp: string} | null>(null)
  const inputRefs = Array(4).fill(null).map(() => React.createRef<HTMLInputElement>())

  // Load user details from localStorage on component mount
  useEffect(() => {
    const userMobile = localStorage.getItem('userMobile')
    const userEmail = localStorage.getItem('userEmail')
    const userOTP = localStorage.getItem('userOTP')
    
    if (userMobile && userEmail && userOTP) {
      setUserDetails({
        mobile: userMobile,
        email: userEmail,
        expectedOtp: userOTP
      })
    } else {
      // If no user data found, redirect to login
      router.push('/login')
    }
  }, [router])

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [timeLeft])

  // keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement && (document.activeElement as HTMLElement).tagName === 'INPUT') return;
      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault()
        handleNumberClick(e.key)
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault()
        handleDelete()
      } else if (e.key === 'Enter' && otp.join('').length === 4) {
        e.preventDefault()
        handleVerify()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [otp, currentIndex])

  const handleNumberClick = (number: string) => {
    if (currentIndex < 4) {
      const newOtp = [...otp]
      newOtp[currentIndex] = number
      setOtp(newOtp)
      if (currentIndex < 3) {
        setCurrentIndex(currentIndex + 1)
        setTimeout(() => {
          inputRefs[currentIndex + 1].current?.focus()
        }, 10)
      }
    }
  }

  const handleDelete = () => {
    if (currentIndex > 0) {
      const newOtp = [...otp]
      newOtp[currentIndex - 1] = ''
      setOtp(newOtp)
      setCurrentIndex(currentIndex - 1)
      setTimeout(() => {
        inputRefs[currentIndex - 1].current?.focus()
      }, 10)
    }
  }

  const handleVerify = () => {
    const otpCode = otp.join('')
    
    if (!userDetails) {
      toast.error('User session not found. Please login again.')
      router.push('/login')
      return
    }
    
    // Find user with matching OTP
    const validUser = userData.users.find(user => user.otp === otpCode)
    
    if (validUser) {
      // Check if OTP is not expired
      const now = new Date()
      const otpExpiry = new Date(validUser.otpExpiry)
      
      if (now <= otpExpiry) {
        // Verify that the entered OTP matches the expected OTP for this user
        if (otpCode === userDetails.expectedOtp) {
          // save user data to localStorage
          const userInfo = {
            id: validUser.id,
            phone: validUser.mobile,
            email: validUser.email,
            verified: true,
            verifiedAt: new Date().toISOString(),
            otp: otpCode
          }
          localStorage.setItem('userData', JSON.stringify(userInfo))
          
          toast.success('OTP Verified Successfully!', {
            duration: 2000,
            position: 'top-center',
            style: {
              background: '#34D399',
              color: '#ffffff',
              fontWeight: 'bold',
              fontSize: '16px',
              padding: '16px 24px',
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
            },
            icon: '✓',
          })
          
          // Redirect to home page after 2 seconds
          setTimeout(() => {
            router.push('/home')
          }, 2000)
        } else {
          toast.error('Invalid OTP for this user. Please try again.', {
            duration: 3000,
            position: 'top-center',
            style: {
              background: '#EF4444',
              color: '#ffffff',
              fontWeight: 'bold',
              fontSize: '16px',
              padding: '16px 24px',
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
            },
            icon: '✗',
          })
          setTimeout(() => {
            setOtp(['', '', '', ''])
            setCurrentIndex(0)
          }, 1500)
        }
      } else {
        toast.error('OTP has expired. Please request a new one.', {
          duration: 3000,
          position: 'top-center',
          style: {
            background: '#EF4444',
            color: '#ffffff',
            fontWeight: 'bold',
            fontSize: '16px',
            padding: '16px 24px',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
          },
          icon: '⏰',
        })
        setTimeout(() => {
          setOtp(['', '', '', ''])
          setCurrentIndex(0)
        }, 1500)
      }
    } else {
      toast.error('Invalid OTP. Please try again.', {
        duration: 3000,
        position: 'top-center',
        style: {
          background: '#EF4444',
          color: '#ffffff',
          fontWeight: 'bold',
          fontSize: '16px',
          padding: '16px 24px',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
        },
        icon: '✗',
      })
      setTimeout(() => {
        setOtp(['', '', '', ''])
        setCurrentIndex(0)
      }, 1500)
    }
  }

  const handleResend = () => {
    setTimeLeft(55)
    setOtp(['', '', '', ''])
    setCurrentIndex(0)
    
    if (userDetails) {
      toast.success(`New OTP sent to ${userDetails.mobile}`, {
        duration: 4000,
        position: 'top-center',
        style: {
          background: '#91C8E4',
          color: '#ffffff',
          fontWeight: 'bold',
          fontSize: '16px',
          padding: '16px 24px',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
        },
        icon: '📱',
      })
    }
  }

  const formatPhoneNumber = (phone: string) => {
    if (phone && phone.length >= 10) {
      const last4 = phone.slice(-4)
      const countryCode = phone.slice(0, 3)
      return `${countryCode}-••••${last4}`
    }
    return phone
  }

  const isOtpComplete = otp.every(d => d.length === 1)

  // Show loading while user details are being loaded
  if (!userDetails) {
    return (
      <div className="min-h-screen bg-[#f2f1ef] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4682A9]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f2f1ef] flex flex-col">
      <Toaster />
      
      {/* Header - Consistent with other pages */}
      <header className="bg-linear-to-r from-[#91C8E4] to-[#4682A9] text-white sticky top-0 z-50 shadow-lg">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex items-center">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="ml-3 text-lg sm:text-xl font-bold">OTP Verification</h1>
          </div>
        </div>
      </header>
      
      <div className="flex-1 flex items-center justify-center px-6 py-8 lg:px-12">
        <div className="w-full max-w-md">

        {/* Logo Section */}
        <div className="flex justify-center mb-8">
          <div className="bg-linear-to-br from-[#F5F5F5] to-white rounded-3xl px-12 py-10 shadow-xl border border-gray-100">
            <div className="w-20 h-20 bg-linear-to-br from-[#91C8E4] to-[#4682A9] rounded-2xl flex items-center justify-center">
              <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-6">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-[#4682A9] mb-2">Verify Your Account</h2>
            <p className="text-gray-600 mb-4">We've sent a verification code to</p>
            <p className="text-[#749BC2] font-bold">{formatPhoneNumber(userDetails.mobile)}</p>
            <p className="text-gray-500 text-sm mt-1">{userDetails.email}</p>
          </div>

          {/* OTP Input */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-800 mb-4 text-center">
              Enter 4-digit OTP
            </label>
            <div className="flex justify-center gap-4 mb-6">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={inputRefs[idx]}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onFocus={() => setCurrentIndex(idx)}
                  onChange={e => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 1)
                    if (val) handleNumberClick(val)
                  }}
                  className={`w-16 h-16 text-center text-2xl font-bold border-2 rounded-xl transition-all outline-none
                    ${idx === currentIndex 
                      ? 'border-[#4682A9] bg-[#91C8E4]/10 shadow-lg ring-2 ring-[#91C8E4]/20' 
                      : 'border-gray-200 bg-white hover:border-[#91C8E4]'
                    } text-[#4682A9]`}
                  aria-label={`OTP digit ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Timer and Resend */}
          <div className="text-center mb-6">
            {timeLeft > 0 ? (
              <p className="text-sm font-semibold text-gray-600">
                Resend code in{' '}
                <span className="font-bold text-[#4682A9]">
                  {timeLeft}s
                </span>
              </p>
            ) : (
              <button
                onClick={handleResend}
                className="text-sm font-bold text-[#4682A9] hover:text-[#749BC2] transition-colors underline underline-offset-4"
              >
                Resend Code
              </button>
            )}
          </div>

          {/* Verify Button */}
          <button
            onClick={handleVerify}
            disabled={!isOtpComplete}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg mb-4
              ${isOtpComplete 
                ? 'bg-linear-to-r from-[#91C8E4] to-[#749BC2] hover:from-[#749BC2] hover:to-[#4682A9] text-white hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
          >
            {isOtpComplete ? 'Verify OTP' : 'Enter OTP to continue'}
          </button>

          {/* Help Text */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Need help?{' '}
              <span className="font-semibold cursor-pointer hover:text-[#4682A9] transition-colors text-[#4682A9]">
                Contact Support
              </span>
            </p>
          </div>
        </div>

        {/* Number Pad */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
          <div className="grid grid-cols-3 gap-4">
            {/* Number buttons */}
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
              <button
                key={number}
                onClick={() => handleNumberClick(number.toString())}
                className="h-14 flex items-center justify-center text-2xl font-bold rounded-xl border-2 border-gray-200 bg-white hover:border-[#91C8E4] hover:bg-[#91C8E4]/5 transition-all active:scale-95 text-[#4682A9]"
              >
                {number}
              </button>
            ))}

            {/* Bottom row: empty, 0, delete */}
            <div></div>
            <button
              onClick={() => handleNumberClick('0')}
              className="h-14 flex items-center justify-center text-2xl font-bold rounded-xl border-2 border-gray-200 bg-white hover:border-[#91C8E4] hover:bg-[#91C8E4]/5 transition-all active:scale-95 text-[#4682A9]"
            >
              0
            </button>
            <button
              onClick={handleDelete}
              className="h-14 flex items-center justify-center rounded-xl border-2 border-gray-200 bg-white hover:border-[#91C8E4] hover:bg-[#91C8E4]/5 transition-all active:scale-95 text-[#4682A9]"
            >
              <Delete className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Back to Login */}
        <div className="text-center">
          <span className="text-gray-600 text-sm">Changed your mind? </span>
          <button 
            onClick={() => router.push('/login')}
            className="text-[#4682A9] hover:text-[#749BC2] font-bold text-sm transition-colors"
          >
            Back to Login
          </button>
        </div>
        </div>
      </div>
    </div>
  )
}