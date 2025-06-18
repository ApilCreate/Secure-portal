'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';

export default function AccountPage() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [token, setToken] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [deleteToken, setDeleteToken] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    try {
      const parsedUser = storedUser && storedUser !== 'undefined' ? JSON.parse(storedUser) : null;
      if (!parsedUser) router.push('/login');
      else setUser(parsedUser);
    } catch (err) {
      console.error('Failed to parse user from localStorage:', err);
      localStorage.removeItem('user');
      router.push('/login');
    } finally {
      setTimeout(() => setIsLoading(false), 300);
    }
  }, []);

  const handleDisable2FA = async () => {
    setModalMessage('');
    try {
      const res = await fetch('/api/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, token }),
      });
      const data = await res.json();
      if (res.ok) {
        setModalMessage('✅ 2FA disabled successfully');
        const updatedUser = { ...user, isTwoFactorEnabled: false };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setTimeout(() => setShowModal(false), 1000);
      } else {
        setModalMessage(`❌ ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      setModalMessage('❌ Server error. Try again.');
    }
  };

  const handleDeleteAccount = async () => {
    if (!user?.id) return;

    if (user.isTwoFactorEnabled && (!deleteToken || deleteToken.length !== 6)) {
      toast.error('Please enter your 6-digit 2FA code.');
      return;
    }

    setDeleteLoading(true);
    setDeleteError('');

    try {
      const res = await fetch('/api/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          token: user.isTwoFactorEnabled ? deleteToken : undefined,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('✅ Account deleted');
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        router.push('/login');
      } else {
        toast.error(data.error || 'Failed to delete account');
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Server error during account deletion.");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-lime-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-white text-lg font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-black bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:20px_20px] flex flex-col items-center justify-center p-4 space-y-8">
      <Toaster position="top-center" />
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-lime-500 rounded-2xl mb-4 shadow-lg">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {user.username}!</h1>
        <p className="text-gray-300 text-sm">Manage your account settings</p>
      </div>

      {/* Main Box */}
      <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl p-8 max-w-md w-full space-y-6">
        {/* Email + Status */}
        <div className="text-center space-y-4 pb-6 border-b border-white/10">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-black/30 rounded-xl border border-gray-700">
            <svg className="w-4 h-4 text-lime-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
            </svg>
            <span className="text-white text-sm">{user.email}</span>
          </div>
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-sm">Account Active</span>
            </div>
            <div className="w-1 h-4 bg-gray-600 rounded-full"></div>
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-lime-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M10,17L6,13L7.41,11.59L10,14.17L16.59,7.58L18,9L10,17Z" />
              </svg>
              <span className="text-lime-400 text-sm">Secured</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <a href='/activity-log'
            className="w-full flex items-center justify-center space-x-3 p-4 bg-black/30 text-white border border-gray-700 rounded-xl hover:bg-black/40"
          >
            Activity Status
          </a>

          <a
            href="/change-password"
            className="w-full flex items-center justify-center space-x-3 p-4 bg-black/30 text-white border border-gray-700 rounded-xl hover:bg-black/40"
          >
            <svg className="w-5 h-5 text-lime-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            <span>Change Password</span>
          </a>

          {/* Conditional 2FA button */}
          {user.isTwoFactorEnabled ? (
            <button
              onClick={() => setShowModal(true)}
              className="w-full flex items-center justify-center space-x-3 p-4 bg-black/30 text-white border border-gray-700 rounded-xl hover:bg-black/40"
            >
              <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
              </svg>
              <span>Disable 2FA</span>
            </button>
          ) : (
            <a
              href="/2fa/setup"
              className="w-full flex items-center justify-center space-x-3 p-4 bg-black/30 text-white border border-gray-700 rounded-xl hover:bg-black/40"
            >
              <svg className="w-5 h-5 text-lime-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Enable 2FA</span>
            </a>
          )}

          <button
            onClick={() => setShowDeleteModal(true)}
            className="w-full flex items-center justify-center space-x-3 p-4 bg-black/30 text-white border border-gray-700 rounded-xl hover:bg-black/40 hover:border-red-500 hover:text-red-400 transition duration-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span className="font-medium">Delete Account</span>
          </button>


          {showDeleteModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
              <div className="bg-zinc-900 rounded-xl p-6 max-w-sm w-full shadow-xl space-y-4">
                <h3 className="text-white text-lg font-semibold">Delete Account?</h3>
                <p className="text-slate-400 text-sm">
                  This action is permanent and cannot be undone. Are you sure you want to proceed?
                </p>
                <div className="flex justify-end space-x-4 pt-2">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 text-sm rounded bg-gray-700 hover:bg-gray-600 text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    className="px-4 py-2 text-sm rounded bg-red-600 hover:bg-red-700 text-white"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}


          {/* Logout */}
          <button
            onClick={() => {
              localStorage.removeItem('user');
              router.push('/login');
            }}
            className="w-full bg-lime-500 hover:bg-lime-400 text-black font-semibold py-4 rounded-xl"
          >
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Sign Out</span>
            </div>
          </button>
        </div>
      </div>

      {/* Modal for disabling 2FA */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-700 p-6 rounded-2xl max-w-sm w-full space-y-4">
            <h3 className="text-lg font-semibold text-white">Disable Two-Factor Authentication</h3>
            <p className="text-sm text-gray-400">Enter your 6-digit 2FA code to disable:</p>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="123456"
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-600 rounded text-white text-center"
            />
            <div className="flex justify-between space-x-2">
              <button
                onClick={() => setShowModal(false)}
                className="w-full py-2 rounded bg-gray-700 hover:bg-gray-600 text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleDisable2FA}
                className="w-full py-2 rounded bg-red-600 hover:bg-red-500 text-white"
              >
                Disable
              </button>
            </div>
            {modalMessage && (
              <p className={`text-center text-sm ${modalMessage.includes('✅') ? 'text-green-400' : 'text-red-400'}`}>
                {modalMessage}
              </p>
            )}
          </div>
        </div>
      )}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-zinc-900 rounded-xl p-6 space-y-4 shadow-xl w-full max-w-md border border-white/10">
            <h2 className="text-white text-xl font-bold">Delete Your Account</h2>
            <p className="text-sm text-gray-300">
              Are you sure you want to delete your account? This action is permanent.
            </p>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm rounded bg-zinc-700 hover:bg-zinc-600 text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (user.isTwoFactorEnabled) {
                    setShowDeleteModal(false);
                    setShow2FAModal(true);
                  } else {
                    handleDeleteAccount();
                  }
                }}
                className="px-4 py-2 text-sm rounded bg-red-600 hover:bg-red-500 text-white"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {show2FAModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-zinc-900 rounded-xl p-6 space-y-4 shadow-xl w-full max-w-md border border-white/10">
            <h2 className="text-white text-xl font-bold">Confirm 2FA</h2>
            <p className="text-sm text-gray-300">Enter your 2FA code to confirm account deletion:</p>
            <input
              type="text"
              value={deleteToken}
              onChange={(e) => setDeleteToken(e.target.value)}
              placeholder="Enter 6-digit code"
              className="w-full mt-2 px-4 py-2 rounded-lg border border-zinc-700 bg-zinc-800 text-white placeholder-gray-500"
            />
            {deleteError && <p className="text-red-500 text-sm">{deleteError}</p>}
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShow2FAModal(false)}
                className="px-4 py-2 text-sm rounded bg-zinc-700 hover:bg-zinc-600 text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="px-4 py-2 text-sm rounded bg-red-600 hover:bg-red-500 text-white"
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Deleting...' : 'Confirm & Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
