'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';

export default function TwoFactorSetupPage() {
  const [qrCode, setQrCode] = useState('');
  const [token, setToken] = useState('');
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser || storedUser === 'undefined') {
      router.push('/login');
      return;
    }
    try {
      const parsed = JSON.parse(storedUser);
      setUserId(parsed.id);
    } catch (err) {
      console.error('Failed to parse user:', err);
      router.push('/login');
    }
  }, [router]);

  const handleSetup = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/2fa/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();
      if (data.qr) {
        setQrCode(data.qr);
        setStep(2);
        toast.success('QR code generated! Scan with your authenticator app');
      } else {
        toast.error(data.error || 'Error generating QR code.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Server error. Try again later.');
    }
    setLoading(false);
  };

  const handleVerify = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, token }),
      });

      const data = await res.json();
      if (data.success) {
        setStep(3);
        setShowSuccess(true);
        toast.success('2FA has been successfully enabled!');

        const stored = localStorage.getItem('user');
        if (stored) {
          const parsed = JSON.parse(stored);
          parsed.isTwoFactorEnabled = true;
          localStorage.setItem('user', JSON.stringify(parsed));
        }

        setTimeout(() => router.push('/account'), 2500);
      } else {
        toast.error(data.error || 'Verification failed.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Server error. Try again later.');
    }
    setLoading(false);
  };


  const handleTokenChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 6) {
      setToken(value);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:20px_20px] bg-black flex flex-col items-center justify-center p-6">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(132,204,22,0.1),transparent_50%)]"></div>
      <div className="absolute top-1/2 right-0 w-64 h-64 bg-lime-400/10 rounded-full blur-2xl animate-pulse delay-500"></div>

      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: 'rgba(0, 0, 0, 0.8)',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
          }
        }}
      />

      {/* Enhanced Back Button */}
      <button
        onClick={() => router.push('/account')}
        className="absolute top-6 left-6 group flex items-center gap-2 text-sm text-white/90 bg-black/30 backdrop-blur-md border border-lime-500/30 px-5 py-3 rounded-2xl hover:bg-lime-500/10 hover:border-lime-400 hover:text-white transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-lime-500/20"
      >
        <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Dashboard
      </button>

      {/* Main Card */}
      <div className="bg-black/40 backdrop-blur-2xl border-1 border-lime-500/90 shadow-2xl shadow-lime-500/10 rounded-3xl p-8 w-full max-w-md space-y-8 relative z-10 transform transition-all duration-700 hover:shadow-lime-500/20 hover:shadow-2xl hover:border-lime-400/50">

        {/* Glowing border effect */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-lime-500/20 via-transparent to-lime-500/90 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          {[1, 2, 3].map((stepNum) => (
            <div key={stepNum} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 ${step >= stepNum
                  ? 'bg-gradient-to-r from-lime-400 to-lime-600 text-black shadow-lg shadow-lime-500/40 animate-pulse'
                  : 'bg-white/10 text-white/40 border border-white/20'
                }`}>
                {step > stepNum ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  stepNum
                )}
              </div>
              {stepNum < 3 && (
                <div className={`w-12 h-0.5 mx-2 transition-all duration-500 ${step > stepNum ? 'bg-gradient-to-r from-lime-400 to-lime-600 shadow-sm shadow-lime-500/50' : 'bg-white/20'
                  }`}></div>
              )}
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-lime-400 to-lime-600 rounded-2xl shadow-lg shadow-lime-500/40 transform transition-all hover:scale-110 hover:rotate-3 duration-300">
            <svg className="w-10 h-10 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-lime-300 via-lime-400 to-lime-500 bg-clip-text text-transparent drop-shadow-sm">
              Two-Factor Authentication
            </h2>
            <p className="text-slate-400 text-base mt-2">
              {step === 1 && "Let's secure your account with an extra layer of protection"}
              {step === 2 && "Scan the QR code with your authenticator app"}
              {step === 3 && "Your account is now protected with 2FA!"}
            </p>
          </div>
        </div>

        {/* Step 1: Generate QR Code */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-gradient-to-r from-lime-500/15 to-green-500/10 border border-lime-500/30 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-lime-500/30 rounded-xl flex items-center justify-center border border-lime-400/40">
                    <svg className="w-5 h-5 text-lime-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-lime-200 font-semibold text-sm mb-1">What you&apos;ll need:</h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    An authenticator app like <span className="text-lime-400 font-medium">Google Authenticator</span>, <span className="text-lime-400 font-medium">Authy</span>, or <span className="text-lime-400 font-medium">Microsoft Authenticator</span> installed on your phone.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleSetup}
              disabled={loading}
              className="w-full bg-gradient-to-r from-lime-400 to-lime-600 hover:from-lime-500 hover:to-lime-700 text-black font-bold py-4 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-lime-500/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none active:scale-[0.98] border border-lime-300/20"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Generating QR Code...</span>
                </div>
              ) : (
                'Generate QR Code'
              )}
            </button>
          </div>
        )}

        {/* Step 2: Scan QR and Verify */}
        {step === 2 && qrCode && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="text-center space-y-4">
              <div className="inline-block p-4 bg-white rounded-2xl shadow-lg border-2 border-lime-400/30">
                <Image
                  src={qrCode}
                  alt="QR Code for 2FA setup"
                  width={192}
                  height={192}
                  unoptimized
                  className="w-48 h-48 mx-auto rounded-lg"
                />
              </div>
              <div className="flex items-center justify-center space-x-2 text-lime-300 animate-pulse">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <p className="text-slate-300 text-sm">
                  Scan this QR code with your authenticator app, then enter the 6-digit code below.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="000000"
                  value={token}
                  onChange={handleTokenChange}
                  className="w-full px-6 py-4 bg-black/30 backdrop-blur-sm border-2 border-lime-500/30 rounded-2xl text-lime-100 text-center text-2xl font-mono tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-400 transition-all duration-300 placeholder-gray-500 hover:border-lime-400/50"
                  maxLength={6}
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-lime-500/10 to-lime-400/10 opacity-0 transition-opacity duration-300 focus-within:opacity-100 pointer-events-none"></div>

                {/* Animated border glow */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-lime-400/20 via-transparent to-lime-400/20 opacity-0 animate-pulse pointer-events-none"></div>
              </div>

              <button
                onClick={handleVerify}
                disabled={loading || token.length !== 6}
                className="w-full bg-gradient-to-r from-lime-400 to-lime-600 hover:from-lime-500 hover:to-lime-700 text-black font-bold py-4 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-lime-500/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none active:scale-[0.98] border border-lime-300/20"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Verifying...</span>
                  </div>
                ) : (
                  'Verify & Enable 2FA'
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Success */}
        {step === 3 && showSuccess && (
          <div className="text-center space-y-6 animate-in fade-in duration-500">
            <div className="mx-auto w-24 h-24 bg-gradient-to-r from-lime-400 to-lime-600 rounded-full flex items-center justify-center animate-bounce shadow-lg shadow-lime-500/50">
              <svg className="w-12 h-12 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-lime-300 mb-3 drop-shadow-sm">All Set! 🎉</h3>
              <p className="text-slate-300 leading-relaxed">
                Two-factor authentication has been <span className="text-lime-400 font-semibold">successfully enabled</span> on your account. Your security just got a major upgrade!
              </p>
            </div>

            {/* Simple dark theme progress bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-lime-300 font-medium">
                <span>Redirecting...</span>
                <span>100%</span>
              </div>
              <div className="w-full bg-gray-800/80 rounded-full h-3 overflow-hidden border border-lime-500/30">
                <div className="h-full bg-lime-400 rounded-full shadow-sm shadow-lime-400/50">
                  <div className="h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Security badges */}
            <div className="flex justify-center space-x-4 pt-4">
              <div className="flex items-center space-x-2 bg-lime-500/10 border border-lime-500/30 rounded-full px-3 py-1">
                <svg className="w-4 h-4 text-lime-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs text-lime-300 font-medium">Secured</span>
              </div>
              <div className="flex items-center space-x-2 bg-lime-500/10 border border-lime-500/30 rounded-full px-3 py-1">
                <svg className="w-4 h-4 text-lime-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="text-xs text-lime-300 font-medium">Protected</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}