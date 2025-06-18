'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import ReCAPTCHA from 'react-google-recaptcha'; //  NEW

export default function LoginPage() {
  const [formData, setFormData] = useState({ user: '', password: '', token: '' });
  const [recaptchaToken, setRecaptchaToken] = useState(''); //  NEW
  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCaptchaChange = (token) => {
    setRecaptchaToken(token);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!recaptchaToken) {
      toast.error('Please complete the CAPTCHA');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: formData.user,
          password: formData.password,
          recaptchaToken, // Include captcha token
        }),
      });
      const data = await res.json();

      if (res.ok) {
        if (data.twoFactorRequired) {
          setUserId(data.userId);
          setStep(2);
          toast('2FA required', { icon: '🔐' });
        } else {
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify({
            id: data.user.id,
            username: data.user.username,
            email: data.user.email,
            isTwoFactorEnabled: data.user.isTwoFactorEnabled,
          }));
          toast.success('Login successful!');
          setTimeout(() => router.push('/account'), 1200);
        }
      } else {
        toast.error(data.error || 'Login failed');
      }
    } catch (err) {
      toast.error('Server error. Try again later.');
    }
    setLoading(false);
  };

  const handle2FAVerify = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, token: formData.token }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("user", JSON.stringify({
          id: data.user.id,
          username: data.user.username,
          email: data.user.email,
          isTwoFactorEnabled: data.user.isTwoFactorEnabled,
        }));
        localStorage.setItem("token", data.token);
        toast.success('2FA verified. Logging in...');
        setTimeout(() => router.push('/account'), 1200);
      } else {
        toast.error(data.error || 'Verification failed');
      }
    } catch (err) {
      toast.error('Server error during 2FA.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:20px_20px] bg-black flex items-center justify-center p-4">
      <Toaster position="top-center" />
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-lime-400 rounded-3xl mb-6">
            <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-semibold text-white mb-2">
            {step === 1 ? 'Welcome Back' : 'Verify Identity'}
          </h1>
          <p className="text-slate-400 text-base">
            {step === 1 ? 'Sign in to your account' : 'Enter your 2FA code to continue'}
          </p>
        </div>

        <div className="bg-zinc-900 p-8 rounded-2xl shadow-2xl">
          {step === 1 ? (
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-5">
                <div>
                  <label htmlFor="user" className="block text-sm font-medium text-white mb-2">
                    Username or Email
                  </label>
                  <input
                    id="user"
                    type="text"
                    name="user"
                    placeholder="Username or Email"
                    value={formData.user}
                    onChange={handleChange}
                    required
                    className="w-full pl-4 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type="password"
                      name="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="w-full pl-4 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent"
                    />
                  </div>
                </div>

                {/*  CAPTCHA Below Password */}
                <div className="pt-2 flex justify-center items-center">
                  <ReCAPTCHA
                    sitekey="6Lf9-lcrAAAAAAnejzsZ39-y-liBVtgGC3RXUElG" 
                    onChange={handleCaptchaChange}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-lime-400 hover:bg-lime-500 text-black font-semibold py-3.5 rounded-xl"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <div>
                <label htmlFor="token" className="block text-sm font-medium text-white mb-2">
                  Authentication Code
                </label>
                <input
                  id="token"
                  type="text"
                  name="token"
                  placeholder="Enter 6-digit code"
                  value={formData.token}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-400 text-white placeholder-slate-500 transition-all duration-200"
                />
              </div>
              <button
                onClick={handle2FAVerify}
                disabled={loading}
                className="w-full bg-lime-400 hover:bg-lime-500 text-black font-semibold py-3.5 rounded-xl"
              >
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>
            </div>
          )}

          <div className="text-center mt-6">
            <a href="/forgot-password" className="text-lime-500 underline underline-offset-2 hover:text-lime-400 text-sm transition-colors duration-200">
              Forgot your password?
            </a>
          </div>
          <div className="text-center mt-4">
            <a href="/register" className="text-lime-500 underline underline-offset-2 hover:text-lime-400 text-sm transition-colors duration-200">
              No account? Sign up
            </a>
          </div>
        </div>

        <div className="text-center mt-6 flex items-center justify-center space-x-2 text-slate-400 text-sm">
          <svg className="w-4 h-4 text-lime-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M10,17L6,13L7.41,11.59L10,14.17L16.59,7.58L18,9L10,17Z" />
          </svg>
          <span>Your information is secure and encrypted</span>
        </div>
      </div>
    </div>
  );
}
