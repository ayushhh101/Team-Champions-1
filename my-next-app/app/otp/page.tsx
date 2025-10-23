'use client'

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

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [timeLeft])

  // keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handleDelete = () => {
    if (currentIndex > 0) {
      const newOtp = [...otp]
      newOtp[currentIndex - 1] = ''
      setOtp(newOtp)
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleVerify = () => {
    const otpCode = otp.join('')
    
    // Find user with matching OTP
    const validUser = userData.users.find(user => user.otp === otpCode)
    
    if (validUser) {
      // Check if OTP is not expired
      const now = new Date()
      const otpExpiry = new Date(validUser.otpExpiry)
      
      if (now <= otpExpiry) {
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
        // Clear OTP on error
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
      // Clear OTP on error
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
    
    // Get a random valid OTP from the data for demonstration
    const randomUser = userData.users[Math.floor(Math.random() * userData.users.length)]
    
    toast.success(`New OTP sent: ${randomUser.otp}`, {
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

  const isOtpComplete = otp.join('').length === 4

  return (
    <div className="min-h-screen flex flex-col font-sans antialiased relative overflow-hidden bg-[#FFFBDE]">
      {/* Toast Container */}
      <Toaster />

      {/* Valid OTPs Display (for testing - remove in production) */}
      <div className="absolute top-16 sm:top-20 left-4 sm:left-6 px-3 sm:px-4 py-2 rounded-lg shadow-md z-10 border-2 border-[#91C8E4] bg-[#91C8E4]/20 max-w-48">
        <p className="text-[10px] sm:text-xs font-semibold text-[#4682A9] mb-1">
          Valid OTPs:
        </p>
        <div className="grid grid-cols-3 gap-1">
          {userData.users.slice(0, 6).map((user) => (
            <span key={user.id} className="font-extrabold text-[#749BC2] text-[9px] sm:text-xs">
              {user.otp}
            </span>
          ))}
        </div>
      </div>

      {/* Subtle background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 sm:w-96 sm:h-96 rounded-full blur-3xl opacity-10 -z-10 bg-[#91C8E4]" />
      <div className="absolute bottom-0 left-0 w-56 h-56 sm:w-80 sm:h-80 rounded-full blur-3xl opacity-10 -z-10 bg-[#749BC2]" />

      {/* Header */}
      <div className="flex items-center px-4 sm:px-6 py-4 sm:py-6">
        <ChevronLeft 
          onClick={() => router.back()}
          className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5] text-[#4682A9] cursor-pointer hover:opacity-70 transition" 
        />
        <h1 className="ml-2 sm:ml-3 text-lg sm:text-xl font-bold tracking-tight text-[#4682A9]">
          OTP Verification
        </h1>
      </div>

      {/* Content - Centered */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 pb-8 sm:pb-16">
        <div className="w-full max-w-md mx-auto">
          {/* Title */}
          <div className="text-center mb-4 sm:mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-[#4682A9]">
              Verify Your Account
            </h2>
          </div>

          {/* Phone Number Display */}
          <div className="text-center mb-6 sm:mb-4 px-2">
            <p className="text-sm sm:text-base font-medium text-gray-600">
              We&apos;ve sent a verification code to
            </p>
            <p className="text-sm sm:text-base font-bold text-[#749BC2] mt-1">
              +91-9876••••10
            </p>
          </div>

          {/* OTP Input Boxes */}
          <div className="flex justify-center gap-2 sm:gap-4 mb-6 sm:mb-4">
            {otp.map((digit, idx) => (
              <div
                key={idx}
                className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center text-2xl sm:text-3xl font-extrabold transition-all shadow-sm
                  ${idx === currentIndex 
                    ? 'bg-[#91C8E4]/20 border-[3px] border-[#91C8E4]' 
                    : 'bg-white border-2 border-gray-200'
                  } text-[#4682A9]`}
              >
                {digit}
              </div>
            ))}
          </div>

          {/* Resend Timer */}
          <div className="text-center mb-6 sm:mb-5">
            {timeLeft > 0 ? (
              <p className="text-sm sm:text-base font-semibold text-gray-600">
                Resend code in{' '}
                <span className="font-extrabold text-[#91C8E4]">
                  {timeLeft}s
                </span>
              </p>
            ) : (
              <button
                onClick={handleResend}
                className="text-sm font-bold underline underline-offset-4 decoration-2 hover:opacity-80 transition text-[#91C8E4]"
              >
                Resend Code
              </button>
            )}
          </div>

          {/* Verify Button */}
          <button
            onClick={handleVerify}
            disabled={!isOtpComplete}
            className={`w-full py-2 sm:py-3 rounded-xl font-bold text-base sm:text-lg tracking-wide mb-4 sm:mb-3 transition-all duration-300 shadow-lg
              ${isOtpComplete 
                ? 'bg-linear-to-r from-[#91C8E4] to-[#749BC2] hover:from-[#749BC2] hover:to-[#4682A9] text-white hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
          >
            <span className="block sm:hidden">Verify OTP</span>
            <span className="hidden sm:block">Verify OTP {isOtpComplete && '(Enter ↵)'}</span>
          </button>

          {/* Number Pad */}
          <div className="rounded-2xl sm:rounded-3xl p-4 sm:p-6 border-2 border-gray-100 bg-white">
            <div className="grid grid-cols-3 gap-y-4 sm:gap-y-6 gap-x-8 sm:gap-x-12">
              {/* Number buttons */}
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
                <button
                  key={number}
                  onClick={() => handleNumberClick(number.toString())}
                  className="w-full h-10 sm:h-12 flex items-center justify-center text-2xl sm:text-3xl font-bold transition-all active:scale-95 hover:bg-gray-50 rounded-lg text-[#4682A9]"
                >
                  {number}
                </button>
              ))}

              {/* Bottom row: dot, 0, delete */}
              <button className="w-full h-10 sm:h-12 flex items-center justify-center text-4xl sm:text-5xl font-black leading-none text-[#91C8E4]">
                •
              </button>

              <button
                onClick={() => handleNumberClick('0')}
                className="w-full h-10 sm:h-12 flex items-center justify-center text-2xl sm:text-3xl font-bold transition-all active:scale-95 hover:bg-gray-50 rounded-lg text-[#4682A9]"
              >
                0
              </button>

              <button
                onClick={handleDelete}
                className="w-full h-10 sm:h-12 flex items-center justify-center transition-all active:scale-95 hover:bg-gray-50 rounded-lg text-[#4682A9]"
              >
                <Delete className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Help Text */}
          <div className="text-center mt-6 sm:mt-8">
            <p className="text-xs sm:text-sm text-gray-500">
              Need help? <span className="font-semibold cursor-pointer hover:opacity-70 transition text-[#91C8E4]">Contact Support</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
