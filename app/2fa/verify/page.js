'use client';
import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function TwoFactorVerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');

  const [token, setToken] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, token }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('2FA verification successful!');
        // Redirect to dashboard or homepage
        router.push('/dashboard'); // You can change this
      } else {
        setMessage(`${data.error || 'Verification failed'}`);
      }
    } catch (err) {
      setMessage(' Server error');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">2FA Verification</h2>
        <form onSubmit={handleVerify} className="space-y-4">
          <input
            type="text"
            maxLength={6}
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Enter 6-digit code"
            className="w-full border border-gray-300 px-4 py-2 rounded-lg"
            required
          />
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
            disabled={loading}
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </form>
        {message && (
          <p className="text-center text-sm mt-4 text-red-600">{message}</p>
        )}
      </div>
    </div>
  );
}
