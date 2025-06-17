'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TwoFactorSetupPage() {
  const [qrCode, setQrCode] = useState('');
  const [token, setToken] = useState('');
  const [userId, setUserId] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
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
    setMessage('');
    try {
      const res = await fetch('/api/2fa/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();
      if (data.qr) {
        setQrCode(data.qr);
        setMessage('Scan the QR code using Google Authenticator');
      } else {
        setMessage(data.error || 'Error generating QR code.');
      }
    } catch (err) {
      console.error(err);
      setMessage('Server error. Try again later.');
    }
    setLoading(false);
  };

  const handleVerify = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, token }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage('2FA has been successfully enabled!');
      } else {
        setMessage(data.error || '❌ Verification failed.');
      }
    } catch (err) {
      console.error(err);
      setMessage('Server error. Try again later.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:20px_20px] bg-black flex items-center justify-center px-4 py-12">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl p-8 w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-lime-500 rounded-xl shadow">
            <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white">Set Up Two-Factor Authentication</h2>
          <p className="text-slate-400 text-sm">Secure your account with a one-time code</p>
        </div>

        {!qrCode && (
          <button
            onClick={handleSetup}
            disabled={loading}
            className="w-full bg-lime-500 hover:bg-lime-600 text-black font-bold py-3 rounded-xl transition"
          >
            {loading ? 'Generating QR Code...' : 'Generate QR Code'}
          </button>
        )}

        {qrCode && (
          <div className="space-y-4 text-center">
            <p className="text-slate-300 text-sm">{message}</p>
            <img src={qrCode} alt="QR Code" className="mx-auto rounded-lg border border-white/10" />

            <input
              type="text"
              placeholder="Enter 6-digit code"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full px-4 py-3 bg-black/30 border border-gray-700 rounded-xl text-white text-center focus:outline-none focus:ring-2 focus:ring-lime-400"
            />
            <button
              onClick={handleVerify}
              disabled={loading || !token}
              className="w-full bg-lime-500 hover:bg-lime-600 text-black font-bold py-3 rounded-xl transition"
            >
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>
          </div>
        )}

        {message && (
          <p className={`text-center font-medium ${message.includes('✅') ? 'text-green-400' : 'text-red-400'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
