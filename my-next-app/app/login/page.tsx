'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [emailOrMobile, setEmailOrMobile] = useState(''); 
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);   
  const router = useRouter();  

  const handleLogin = async (e: React.FormEvent) => {   
  e.preventDefault();
  
  if (!emailOrMobile.trim()) {   
    alert('Please enter your email or mobile number');
    return;
  }
  
  setIsLoading(true);   
  
  try {
    const response = await fetch('/api/users');   
    
    if (!response.ok) {
      throw new Error('Failed to load user data');
    }
    
    const data = await response.json();
    const users = data.users;
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = users.find((u: any) =>  
      u.email.toLowerCase() === emailOrMobile.toLowerCase().trim() || 
      u.mobile === emailOrMobile.trim()
    );
    
    if (user) {
      localStorage.setItem('loginEmailOrMobile', emailOrMobile);
      localStorage.setItem('userId', user.id);
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem('userMobile', user.mobile);
      localStorage.setItem('userOTP', user.otp);
      
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }
      
      router.push('/otp');  
    } else {
      alert('User not found. Please sign up first.');
    }
  } catch (err) {
    console.error('Login error:', err);
    alert('Unable to connect to server. Please try again later.');
  } finally {
    setIsLoading(false);  
  }
};


  const handleGoogleLogin = () => {
    console.log('Continue with Google');
  };

  return (
    <div className="min-h-screen bg-[#FFFBDE] flex flex-col lg:flex-row">
      {/* Left Side  */}
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
          {/* Top Badge */}
        
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
          <div className="flex justify-center mb-10">
            <div className="bg-linear-to-br from-[#F5F5F5] to-white rounded-3xl px-12 py-10 shadow-xl border border-gray-100">
              <Image
                src="/logo.png"
                alt="Logo"
                width={100}
                height={100}
                className="object-contain"
                priority
              />
            </div>
          </div>

             {/* Login Form  */}
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-[#4682A9] mb-2">Welcome Back</h2>
              <p className="text-gray-600">Sign in to continue your health journey</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-800 mb-2">
                  Mobile / Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="emailOrMobile"
                    value={emailOrMobile}
                    onChange={(e) => setEmailOrMobile(e.target.value)} 
                    placeholder="Enter your email or mobile"
                    disabled={isLoading} 
                    required
                    className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#91C8E4] focus:border-transparent placeholder:text-gray-400 placeholder:text-sm bg-white transition-all"
                  />
                </div>
              </div>

              {/* Remember Me and Forgot Password */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center space-x-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                     disabled={isLoading} 
                    className="w-4 h-4 rounded border-gray-300 text-[#4682A9] focus:ring-[#91C8E4] transition-colors"
                  />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-[#4682A9] transition-colors">Remember Me</span>
                </label>
                <Link href="/forgot-password" className="text-sm font-semibold text-[#4682A9] hover:text-[#749BC2] transition-colors">
                  Forgot Password?
                </Link>
              </div>

              {/* Login Button */}
             <button
                type="submit"
                disabled={isLoading}  
                className="w-full bg-linear-to-r from-[#91C8E4] to-[#749BC2] hover:from-[#749BC2] hover:to-[#4682A9] text-white font-semibold py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"  // ✅ ADDED CLASSES
                >
             {isLoading ? (   
              <div className="flex items-center justify-center">
             <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
             Verifying...
          </div>
          ) : (
            'Continue with OTP'   
          )}
          </button>

            </form>

            {/* Divider */}
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-gray-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-[#FFFBDE] text-sm font-medium text-gray-500">Or continue with</span>
              </div>
            </div>

            {/* Google Login Button */}
            <button
              onClick={handleGoogleLogin}
              className="w-full bg-white hover:bg-gray-50 border-2 border-gray-200 text-gray-800 font-semibold py-3.5 rounded-xl flex items-center justify-center space-x-3 transition-all duration-200 shadow-sm hover:shadow-md hover:border-[#91C8E4]"
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

            {/* Sign Up Link */}
            <div className="text-center pt-6">
              <span className="text-gray-600 text-sm">Don&apos;t have an account? </span>
              <Link href="/signup" className="text-[#4682A9] hover:text-[#749BC2] font-bold text-sm transition-colors">
                Sign Up Free
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
