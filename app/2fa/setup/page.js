'use client';
import { useState } from 'react';

export default function TwoFactorSetupPage() {
  const [qrCode, setQrCode] = useState('');
  const [token, setToken] = useState('');
  const [userId, setUserId] = useState('');
  const [message, setMessage] = useState('');

  const handleSetup = async () => {
    const res = await fetch('/api/2fa/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });

    const data = await res.json();
    if (data.qr) {
      setQrCode(data.qr);
      setMessage('Scan the QR code below using Google Authenticator:');
    } else {
      setMessage(data.error || 'Error generating QR code.');
    }
  };

  const handleVerify = async () => {
    const res = await fetch('/api/2fa/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, token }),
    });

    const data = await res.json();
    if (data.success) {
      setMessage('✅ 2FA has been successfully enabled!');
    } else {
      setMessage(data.error || '❌ Verification failed.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white shadow-xl rounded-lg p-6 w-full max-w-md space-y-6">
        <h2 className="text-2xl font-bold text-center">Set Up Two-Factor Authentication</h2>

        <input
          type="text"
          placeholder="Enter your User ID"
          className="w-full p-2 border rounded"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />

        <button
          onClick={handleSetup}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Generate QR Code
        </button>

        {qrCode && (
          <div className="text-center">
            <p className="mb-2">{message}</p>
            <img src={qrCode} alt="2FA QR Code" className="mx-auto" />
            <input
              type="text"
              placeholder="Enter 6-digit code"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="mt-4 w-full p-2 border rounded"
            />
            <button
              onClick={handleVerify}
              className="w-full mt-2 bg-green-600 text-white p-2 rounded hover:bg-green-700"
            >
              Verify Code
            </button>
          </div>
        )}

        {!qrCode && message && <p className="text-center text-red-600">{message}</p>}
      </div>
    </div>
  );
}
