'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [signupType, setSignupType] = useState<'patient' | 'doctor'>('patient');
  const [speciality, setSpeciality] = useState('');
  const [qualification, setQualification] = useState('');
  const [location, setLocation] = useState('');
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    if (!agreeTerms) {
      alert("You must agree to the terms and conditions!");
      return;
    }
    
    // Additional validation for doctor signup
    if (signupType === 'doctor') {
      if (!speciality.trim() || !qualification.trim() || !location.trim()) {
        alert("Please fill in all doctor-specific fields!");
        return;
      }
    }
    
    setIsLoading(true);
    
    try {
      console.log('Signup with:', { 
        name, 
        email, 
        phone, 
        password, 
        signupType,
        ...(signupType === 'doctor' && { speciality, qualification, location })
      });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Store signup info in localStorage for demo
      localStorage.setItem('signupName', name);
      localStorage.setItem('signupEmail', email);
      localStorage.setItem('signupPhone', phone);
      localStorage.setItem('signupType', signupType);
      
      if (signupType === 'doctor') {
        localStorage.setItem('signupSpeciality', speciality);
        localStorage.setItem('signupQualification', qualification);
        localStorage.setItem('signupLocation', location);
      }
      
      alert(`${signupType === 'doctor' ? 'Doctor' : 'Patient'} account created successfully!`);
      router.push('/user/login');
    } catch (err) {
      console.error('Signup error:', err);
      alert('Unable to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    console.log('Continue with Google for signup');
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#E8F4F8] via-[#F0F9FF] to-[#91C8E4]/20">
      {/* Header with Logo */}
      <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-10">
        <div className="flex items-center space-x-3">
          <div className="relative w-12 h-12">
            <Image
              src="/logo.png"
              alt="Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <span className="text-xl font-bold text-[#4682A9]">Schedula</span>
        </div>
        <div className="hidden sm:flex items-center space-x-2 text-sm text-[#4682A9]">
          <span>Already registered?</span>
          <Link 
            href="/user/login" 
            className="text-[#4682A9] hover:text-[#749BC2] font-semibold transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-screen px-4 pt-20 pb-8">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          
          {/* Left Side - Welcome Section */}
          <div className="hidden lg:flex flex-col justify-center space-y-8 px-8">
            <div className="space-y-4">
              <div className="inline-block px-4 py-2 bg-[#91C8E4]/20 rounded-full">
                <span className="text-[#4682A9] font-semibold text-sm">🏥 Join Our Platform</span>
              </div>
              
              <h1 className="text-5xl font-bold text-[#2C5F7C] leading-tight">
                {signupType === 'doctor' ? 'Start Your Medical' : 'Start Your'}
                <span className="text-[#4682A9]"> {signupType === 'doctor' ? 'Practice' : 'Health Journey'}</span>
              </h1>
              
              <p className="text-lg text-[#4682A9] leading-relaxed">
                {signupType === 'doctor' 
                  ? 'Join our platform to connect with patients, manage appointments, and grow your medical practice.'
                  : 'Create your account to access top healthcare professionals, manage appointments, and take control of your health.'
                }
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-[#91C8E4]/20 rounded-xl flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-[#4682A9]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-[#2C5F7C] mb-1">100+ Doctors</h3>
                <p className="text-sm text-[#4682A9]">Expert specialists available</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-[#749BC2]/20 rounded-xl flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-[#4682A9]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-[#2C5F7C] mb-1">24/7 Support</h3>
                <p className="text-sm text-[#4682A9]">Round the clock assistance</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-[#FFFBDE] rounded-xl flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-[#4682A9]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-[#2C5F7C] mb-1">Easy Booking</h3>
                <p className="text-sm text-[#4682A9]">Book in just 2 minutes</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-[#91C8E4]/20 rounded-xl flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-[#4682A9]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-[#2C5F7C] mb-1">10K+ Patients</h3>
                <p className="text-sm text-[#4682A9]">Trusted by thousands</p>
              </div>
            </div>
          </div>

          {/* Right Side - Signup Form */}
          <div className="w-full">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sm:p-10">
              
              {/* Form Header */}
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-[#2C5F7C] mb-2">Create Account</h2>
                <p className="text-[#4682A9]">Join thousands of satisfied {signupType === 'doctor' ? 'doctors' : 'patients'}</p>
              </div>

              {/* Signup Type Toggle */}
              <div className="mb-6">
                <div className="flex bg-gray-100 rounded-xl p-1">
                  <button
                    type="button"
                    onClick={() => setSignupType('patient')}
                    className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all ${
                      signupType === 'patient'
                        ? 'bg-[#4682A9] text-white shadow-sm'
                        : 'text-[#4682A9] hover:text-[#749BC2]'
                    }`}
                  >
                    👤 Patient Signup
                  </button>
                  <button
                    type="button"
                    onClick={() => setSignupType('doctor')}
                    className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all ${
                      signupType === 'doctor'
                        ? 'bg-[#4682A9] text-white shadow-sm'
                        : 'text-[#4682A9] hover:text-[#749BC2]'
                    }`}
                  >
                    👨‍⚕️ Doctor Signup
                  </button>
                </div>
              </div>

              <form onSubmit={handleSignup} className="space-y-4">
                {/* Name Input */}
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-[#2C5F7C] mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-[#91C8E4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      disabled={isLoading}
                      required
                      className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#91C8E4] focus:border-transparent placeholder:text-[#91C8E4] bg-white text-[#2C5F7C] transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Email and Phone in Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Email Input */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-[#2C5F7C] mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-[#91C8E4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                        </svg>
                      </div>
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Your email"
                        disabled={isLoading}
                        required
                        className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#91C8E4] focus:border-transparent placeholder:text-[#91C8E4] bg-white text-[#2C5F7C] transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Phone Input */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-semibold text-[#2C5F7C] mb-2">
                      Phone
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-[#91C8E4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <input
                        type="tel"
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Phone number"
                        disabled={isLoading}
                        required
                        className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#91C8E4] focus:border-transparent placeholder:text-[#91C8E4] bg-white text-[#2C5F7C] transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                {/* Password and Confirm Password in Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Password Input */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-semibold text-[#2C5F7C] mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-[#91C8E4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Create password"
                        disabled={isLoading}
                        required
                        className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#91C8E4] focus:border-transparent placeholder:text-[#91C8E4] bg-white text-[#2C5F7C] transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Confirm Password Input */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-semibold text-[#2C5F7C] mb-2">
                      Confirm
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-[#91C8E4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <input
                        type="password"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm password"
                        disabled={isLoading}
                        required
                        className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#91C8E4] focus:border-transparent placeholder:text-[#91C8E4] bg-white text-[#2C5F7C] transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                {/* Doctor-specific fields */}
                {signupType === 'doctor' && (
                  <>
                    {/* Speciality and Qualification */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Speciality Input */}
                      <div>
                        <label htmlFor="speciality" className="block text-sm font-semibold text-[#2C5F7C] mb-2">
                          Speciality
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-[#91C8E4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                            </svg>
                          </div>
                          <input
                            type="text"
                            id="speciality"
                            value={speciality}
                            onChange={(e) => setSpeciality(e.target.value)}
                            placeholder="e.g. Cardiology"
                            disabled={isLoading}
                            required
                            className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#91C8E4] focus:border-transparent placeholder:text-[#91C8E4] bg-white text-[#2C5F7C] transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                          />
                        </div>
                      </div>

                      {/* Qualification Input */}
                      <div>
                        <label htmlFor="qualification" className="block text-sm font-semibold text-[#2C5F7C] mb-2">
                          Qualification
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-[#91C8E4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                          </div>
                          <input
                            type="text"
                            id="qualification"
                            value={qualification}
                            onChange={(e) => setQualification(e.target.value)}
                            placeholder="e.g. MBBS, MD"
                            disabled={isLoading}
                            required
                            className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#91C8E4] focus:border-transparent placeholder:text-[#91C8E4] bg-white text-[#2C5F7C] transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Location Input */}
                    <div>
                      <label htmlFor="location" className="block text-sm font-semibold text-[#2C5F7C] mb-2">
                        Practice Location
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-[#91C8E4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          id="location"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="City, State"
                          disabled={isLoading}
                          required
                          className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#91C8E4] focus:border-transparent placeholder:text-[#91C8E4] bg-white text-[#2C5F7C] transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Terms Checkbox */}
                <div className="flex items-start">
                  <label className="flex items-start space-x-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      disabled={isLoading}
                      required
                      className="w-4 h-4 mt-0.5 rounded border-gray-300 text-[#4682A9] focus:ring-[#91C8E4] transition-colors cursor-pointer"
                    />
                    <span className="text-sm text-[#4682A9] leading-tight">
                      I agree to the{' '}
                      <Link href="/terms" className="text-[#4682A9] hover:underline font-medium">
                        Terms
                      </Link>
                      {' '}and{' '}
                      <Link href="/privacy" className="text-[#4682A9] hover:underline font-medium">
                        Privacy Policy
                      </Link>
                    </span>
                  </label>
                </div>

                {/* Signup Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-linear-to-r from-[#91C8E4] to-[#4682A9] hover:from-[#749BC2] hover:to-[#4682A9] text-white font-semibold py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating {signupType === 'doctor' ? 'Doctor' : 'Patient'} Account...
                    </div>
                  ) : (
                    `Create ${signupType === 'doctor' ? 'Doctor' : 'Patient'} Account`
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-4 bg-white text-sm text-[#4682A9]">Or sign up with</span>
                </div>
              </div>

              {/* Google Signup Button */}
              <button
                onClick={handleGoogleSignup}
                disabled={isLoading}
                className="w-full bg-white hover:bg-gray-50 border-2 border-gray-200 text-[#2C5F7C] font-semibold py-3.5 rounded-xl flex items-center justify-center space-x-3 transition-all duration-200 shadow-sm hover:shadow-md hover:border-[#91C8E4] disabled:opacity-50 disabled:cursor-not-allowed"
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
                <span>Sign up with Google</span>
              </button>

              {/* Login Link - Mobile */}
              <div className="text-center mt-6 sm:hidden">
                <span className="text-[#4682A9] text-sm">Already have an account? </span>
                <Link href="/user/login" className="text-[#4682A9] hover:text-[#749BC2] font-semibold text-sm transition-colors">
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
