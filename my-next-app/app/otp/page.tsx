'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, Delete } from 'lucide-react'

const colors = {
  primary: '#80A1BA',    // Blue - for main text and icons
  secondary: '#91C4C3',  // Teal - for accents and buttons
  accent: '#B4DEBD',     // Green - for highlights
  light: '#FFF7DD'       // Cream - for background
}

export default function OTPPage() {
  const [otp, setOtp] = useState(['', '', '', ''])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(55)

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [timeLeft])

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
    console.log('OTP Code:', otpCode)
    // Add your verification logic here
  }

  const handleResend = () => {
    setTimeLeft(55)
    setOtp(['', '', '', ''])
    setCurrentIndex(0)
    console.log('Resending OTP...')
  }

  return (
    <div
      className="min-h-screen flex flex-col font-sans antialiased relative overflow-hidden"
      style={{ background: colors.light }}
    >
      {/* Subtle background decoration */}
      <div 
        className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-10 -z-10"
        style={{ background: colors.secondary }}
      />
      <div 
        className="absolute bottom-0 left-0 w-80 h-80 rounded-full blur-3xl opacity-10 -z-10"
        style={{ background: colors.accent }}
      />

      {/* Header */}
      <div className="flex items-center px-6 py-6">
        <ChevronLeft className="w-7 h-7 stroke-[2.5]" style={{ color: colors.primary }} />
        <h1 
          className="ml-3 text-xl font-bold tracking-tight" 
          style={{ color: colors.primary }}
        >
          OTP Code Verification
        </h1>
      </div>

      {/* Content - Centered */}
      <div className="flex-1 flex flex-col justify-center px-6 pb-16">
        <div className="w-full max-w-md mx-auto">
          {/* Phone Number Display */}
          <div className="text-center mb-12">
            <p 
              className="text-base font-semibold tracking-wide" 
              style={{ color: colors.primary }}
            >
              Code has been sent to +91 111 ••••••99
            </p>
          </div>

          {/* OTP Input Boxes */}
          <div className="flex justify-center gap-4 mb-8">
            {otp.map((digit, idx) => (
              <div
                key={idx}
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-extrabold transition-all shadow-sm"
                style={{
                  background:
                    idx === currentIndex
                      ? `${colors.secondary}20`
                      : digit
                      ? '#ffffff'
                      : '#ffffff',
                  border:
                    idx === currentIndex
                      ? `3px solid ${colors.secondary}`
                      : `2px solid ${colors.accent}`,
                  color: colors.primary
                }}
              >
                {digit}
              </div>
            ))}
          </div>

          {/* Resend Timer */}
          <div className="text-center mb-8">
            {timeLeft > 0 ? (
              <p className="text-base font-semibold" style={{ color: colors.primary }}>
                Resend code in{' '}
                <span className="font-extrabold" style={{ color: colors.secondary }}>
                  {timeLeft} s
                </span>
              </p>
            ) : (
              <button
                onClick={handleResend}
                className="text-base font-bold underline underline-offset-4 decoration-2 hover:opacity-80 transition"
                style={{ color: colors.secondary }}
              >
                Resend Code
              </button>
            )}
          </div>

          {/* Verify Button */}
          <button
            onClick={handleVerify}
            disabled={otp.join('').length < 4}
            className="w-full py-4 rounded-xl font-extrabold text-lg tracking-wide mb-3 transition-all"
            style={{
              background:
                otp.join('').length === 4
                  ? colors.secondary
                  : colors.accent,
              color: otp.join('').length === 4 ? '#ffffff' : `${colors.primary}80`,
              cursor: otp.join('').length === 4 ? 'pointer' : 'not-allowed',
              letterSpacing: '0.05em',
              opacity: otp.join('').length === 4 ? 1 : 0.6
            }}
          >
            Verify
          </button>

          {/* Number Pad */}
          <div 
            className="rounded-3xl p-6"
            style={{ background: `${colors.light}` }}
          >
            <div className="grid grid-cols-3 gap-y-6 gap-x-12">
              {/* Number buttons */}
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
                <button
                  key={number}
                  onClick={() => handleNumberClick(number.toString())}
                  className="w-full h-12 flex items-center justify-center text-3xl font-bold transition-all active:scale-95 hover:opacity-70"
                  style={{ color: colors.primary }}
                >
                  {number}
                </button>
              ))}

              {/* Bottom row: dot, 0, delete */}
              <button
                className="w-full h-12 flex items-center justify-center text-5xl font-black leading-none"
                style={{ color: colors.accent }}
              >
                •
              </button>

              <button
                onClick={() => handleNumberClick('0')}
                className="w-full h-12 flex items-center justify-center text-3xl font-bold transition-all active:scale-95 hover:opacity-70"
                style={{ color: colors.primary }}
              >
                0
              </button>

              <button
                onClick={handleDelete}
                className="w-full h-12 flex items-center justify-center transition-all active:scale-95 hover:opacity-70"
                style={{ color: colors.primary }}
              >
                <Delete className="w-7 h-7 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
