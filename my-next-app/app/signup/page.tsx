'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState(''); // New state for phone number
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    if (!agreeTerms) {
      alert("You must agree to the terms and conditions!");
      return;
    }
    console.log('Signup with:', name, email, phone, password); // Include phone in console log
  };

  const handleGoogleSignup = () => {
    console.log('Continue with Google for signup');
  };

  return (
    <div className="min-h-screen bg-[#FFFBDE] flex flex-col lg:flex-row">
      {/* Left Side */}
      <div className="hidden lg:block lg:w-[60%] relative overflow-hidden">
        <Image
          src="/illustrations.png"
          alt="Illustration"
          fill
          className="object-cover"
          priority
        />

        <div className="absolute inset-0 bg-linear-to-br from-[#91C8E4]/40 via-[#749BC2]/30 to-[#4682A9]/40"></div>
        {/* Text Content Overlay */}
        <div className="absolute inset-0 z-10 flex flex-col justify-end pb-16 px-12 text-white">
          {/* Main Content */}
          <div className="space-y-6 max-w-xl">
            {/* Main Heading */}
            <div className="space-y-2">
              <h1 className="text-6xl font-black leading-tight drop-shadow-2xl">
                Healthcare
              </h1>
              <h1 className="text-6xl font-black leading-tight drop-shadow-2xl">
                Simplified
              </h1>
            </div>
            {/* Subheading */}
            <p className="text-2xl font-light drop-shadow-lg leading-relaxed">
              Book appointments with top doctors in seconds. Your health journey starts here.
            </p>
            {/* Stats Row */}
            <div className="flex gap-8 pt-6 border-t border-white/30">
              <div>
                <div className="text-3xl font-bold">10K+</div>
                <div className="text-sm text-white/80">Happy Patients</div>
              </div>
              <div>
                <div className="text-3xl font-bold">500+</div>
                <div className="text-sm text-white/80">Expert Doctors</div>
              </div>
              <div>
                <div className="text-3xl font-bold">24/7</div>
                <div className="text-sm text-white/80">Support</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex-1 lg:w-[40%] flex items-center justify-center px-6 py-8 lg:px-12">
        <div className="w-full max-w-md">
          {/* Logo Section */}
          <div className="flex justify-center mb-6"> {/* Reduced margin-bottom */}
            <div className="bg-linear-to-br from-[#F5F5F5] to-white rounded-3xl px-12 py-8 shadow-xl border border-gray-100"> {/* Reduced padding-y */}
              <Image
                src="/logo.png"
                alt="Logo"
                width={80} // Reduced width
                height={80} // Reduced height
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* Signup Form */}
          <div className="space-y-4"> {/* Reduced space-y */}
            {/* Header */}
            <div className="text-center mb-6"> {/* Reduced margin-bottom */}
              <h2 className="text-3xl font-bold text-[#4682A9] mb-1">Create Your Account</h2> {/* Reduced text size */}
              <p className="text-gray-600 text-sm">Join us to start your health journey</p> {/* Reduced text size */}
            </div>

            <form onSubmit={handleSignup} className="space-y-4"> {/* Reduced space-y */}
              {/* Name Input */}
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-800 mb-1"> {/* Reduced margin-bottom */}
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full pl-12 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#91C8E4] focus:border-transparent placeholder:text-gray-400 placeholder:text-sm bg-white transition-all" // Reduced padding-y
                    required
                  />
                </div>
              </div>

              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-800 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full pl-12 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#91C8E4] focus:border-transparent placeholder:text-gray-400 placeholder:text-sm bg-white transition-all"
                    required
                  />
                </div>
              </div>

              {/* Phone Input - NEW */}
              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-800 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <input
                    type="tel" // Use type="tel" for phone numbers
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter your phone number"
                    className="w-full pl-12 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#91C8E4] focus:border-transparent placeholder:text-gray-400 placeholder:text-sm bg-white transition-all"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-800 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    className="w-full pl-12 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#91C8E4] focus:border-transparent placeholder:text-gray-400 placeholder:text-sm bg-white transition-all"
                    required
                  />
                </div>
              </div>

              {/* Confirm Password Input */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-800 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="w-full pl-12 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#91C8E4] focus:border-transparent placeholder:text-gray-400 placeholder:text-sm bg-white transition-all"
                    required
                  />
                </div>
              </div>

              {/* Agree to Terms Checkbox */}
              <div className="flex items-center pt-1">
                <label className="flex items-center space-x-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-[#4682A9] focus:ring-[#91C8E4] transition-colors"
                    required
                  />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-[#4682A9] transition-colors">
                    I agree to the <Link href="/terms" className="text-[#4682A9] hover:underline">Terms</Link> and <Link href="/privacy" className="text-[#4682A9] hover:underline">Privacy Policy</Link>
                  </span>
                </label>
              </div>

              {/* Signup Button */}
              <button
                type="submit"
                className="w-full bg-linear-to-r from-[#91C8E4] to-[#749BC2] hover:from-[#749BC2] hover:to-[#4682A9] text-white font-semibold py-3.5 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]" // Reduced padding-y
              >
                Sign Up
              </button>
            </form>

            {/* Divider */}
            <div className="relative py-3"> {/* Reduced padding-y */}
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-gray-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-[#FFFBDE] text-sm font-medium text-gray-500">Or continue with</span>
              </div>
            </div>

            {/* Google Signup Button */}
            <button
              onClick={handleGoogleSignup}
              className="w-full bg-white hover:bg-gray-50 border-2 border-gray-200 text-gray-800 font-semibold py-3 rounded-xl flex items-center justify-center space-x-3 transition-all duration-200 shadow-sm hover:shadow-md hover:border-[#91C8E4]" // Reduced padding-y
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Login Link */}
            <div className="text-center pt-5"> {/* Reduced padding-top */}
              <span className="text-gray-600 text-sm">Already have an account? </span>
              <Link href="/login" className="text-[#4682A9] hover:text-[#749BC2] font-bold text-sm transition-colors">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default SignupPage;