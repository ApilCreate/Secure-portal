'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [formData, setFormData] = useState({ user: '', password: '', token: '' });
  const [step, setStep] = useState(1); // 1 = login, 2 = 2FA
  const [userId, setUserId] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: formData.user, password: formData.password }),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.requires2FA) {
          setUserId(data.userId);
          setStep(2);
        } else {
          setMessage('✅ Login successful!');
          setTimeout(() => router.push('/account'), 1000);
        }
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (err) {
      setMessage('❌ Server error. Try again later.');
    }

    setLoading(false);
  };

  const handle2FAVerify = async () => {
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, token: formData.token }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('✅ 2FA verified. Logging in...');
        setTimeout(() => router.push('/account'), 1000);
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (err) {
      setMessage('❌ Server error during 2FA.');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-blue-200 px-4">
      <div className="bg-white shadow-2xl rounded-xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center text-slate-700 mb-6">
          {step === 1 ? 'Login' : 'Two-Factor Authentication'}
        </h1>

        {step === 1 ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="text"
              name="user"
              placeholder="Username or Email"
              value={formData.user}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <input
              type="text"
              name="token"
              placeholder="Enter 6-digit code from Authenticator"
              value={formData.token}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handle2FAVerify}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition"
            >
              {loading ? 'Verifying...' : 'Verify 2FA Code'}
            </button>
          </div>
        )}

        <div className="text-center mt-4 text-sm">
          <a href="/forgot-password" className="text-blue-600 hover:underline">
            Forgot Password?
          </a>
        </div>

        {message && (
          <p className="mt-4 text-center text-sm font-medium text-slate-700">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
