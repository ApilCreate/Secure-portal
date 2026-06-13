"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { jwtDecode } from "jwt-decode";


function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const redirectTo = searchParams.get("redirect") || "/login";
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    if (strength <= 1)
      return {
        label: "Weak",
        color: "text-red-400",
        bg: "bg-red-500",
        width: "25%",
      };
    if (strength === 2)
      return {
        label: "Fair",
        color: "text-orange-400",
        bg: "bg-orange-500",
        width: "50%",
      };
    if (strength === 3)
      return {
        label: "Good",
        color: "text-yellow-400",
        bg: "bg-yellow-500",
        width: "75%",
      };
    if (strength === 4)
      return {
        label: "Strong",
        color: "text-green-400",
        bg: "bg-green-500",
        width: "100%",
      };
  };

  const [isTokenExpired, setIsTokenExpired] = useState(false);

  useEffect(() => {
  if (!token) {
    setIsTokenExpired(true);
    return;
  }

  try {
    const decoded = jwtDecode(token);
    const now = Date.now() / 1000; // in seconds
    if (decoded.exp < now) {
      setIsTokenExpired(true);
      return;
    }

    const timeLeft = (decoded.exp - now) * 1000;
    const timeout = setTimeout(() => {
      toast.error("Reset link expired. Please request a new one.");
      setIsTokenExpired(true);
    }, timeLeft);

    return () => clearTimeout(timeout);
  } catch (error) {
    setIsTokenExpired(true);
  }
}, [token]);


  const passwordsMatch = confirm && password === confirm;
  const passwordStrength = password ? getPasswordStrength(password) : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!token) {
      toast.error("Invalid or missing token.");
      setLoading(false);
      return;
    }

    if (password !== confirm) {
      toast.error("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(" Password reset successful! Redirecting...");
        setTimeout(() => router.push(redirectTo), 2000);
      } else {
        toast.error(data.error || "Reset failed");
      }
    } catch (error) {
      toast.error("Server error. Try again later.");
    }

    setLoading(false);
  };

  return isTokenExpired ? (
    <div className="min-h-screen flex items-center justify-center text-white text-center bg-black">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Reset Link Expired</h2>
        <p className="text-gray-400">
          Please request a new password reset link.
        </p>
        <button
          onClick={() => router.push("/forgot-password")}
          className="bg-lime-500 text-black px-4 py-2 rounded hover:bg-lime-400"
        >
          Request New Link
        </button>
      </div>
    </div>
  ) : (
    <div className="min-h-screen bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:20px_20px] bg-black flex flex-col items-center justify-center p-4 space-y-8">
      <Toaster position="top-center" />

      {/* Header Section */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-lime-500 rounded-2xl mb-4 shadow-lg">
          <svg
            className="w-8 h-8 text-black"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 12H9v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.586l4.707-4.707A1 1 0 0111 3h6a2 2 0 012 2v4z"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
        <p className="text-gray-300 text-sm">Create a new secure password</p>
      </div>

      {/* Form Container */}
      <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl p-8 max-w-md w-full">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="New Password"
              name="reset_new_password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 pr-12 bg-black/30 text-white placeholder-gray-400 border border-gray-700 rounded-xl"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showPassword ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-4-9-9 0-1.11.2-2.17.57-3.15m1.54-2.37A8.95 8.95 0 0112 3c5 0 9 4 9 9 0 1.43-.31 2.79-.88 4.01M9.88 9.88a3 3 0 104.24 4.24"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 3l18 18"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              )}
            </button>
          </div>

          {passwordStrength && (
            <div className="text-xs text-white">
              <div className="mb-1 flex justify-between">
                <span>Password Strength</span>
                <span className={passwordStrength.color}>
                  {passwordStrength.label}
                </span>
              </div>
              <div className="w-full h-2 bg-gray-700 rounded-full">
                <div
                  className={`${passwordStrength.bg} h-full rounded-full`}
                  style={{ width: passwordStrength.width }}
                ></div>
              </div>
            </div>
          )}

          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm Password"
              name="reset_confirm_password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full p-4 pr-12 bg-black/30 text-white placeholder-gray-400 border border-gray-700 rounded-xl"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirm((prev) => !prev)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showConfirm ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-4-9-9 0-1.11.2-2.17.57-3.15m1.54-2.37A8.95 8.95 0 0112 3c5 0 9 4 9 9 0 1.43-.31 2.79-.88 4.01M9.88 9.88a3 3 0 104.24 4.24"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 3l18 18"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              )}
            </button>
          </div>

          {confirm && (
            <p
              className={`text-sm ${
                passwordsMatch ? "text-green-400" : "text-red-400"
              }`}
            >
              {passwordsMatch ? " Passwords match" : " Passwords do not match"}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-lime-500 hover:bg-lime-400 text-black font-semibold py-3 rounded-xl transition duration-300"
          >
            {loading ? "Updating..." : "Reset Password"}
          </button>

          <p className="text-center text-sm text-gray-400 mt-6">
            Remember your password?{" "}
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="text-lime-400 hover:underline"
            >
              Back to Login
            </button>
          </p>
        </form>
      </div>

      {/* Security Note */}
      <div className="text-center mt-6 flex items-center justify-center space-x-2 text-slate-400 text-sm">
        <svg
          className="w-4 h-4 text-lime-500"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M10,17L6,13L7.41,11.59L10,14.17L16.59,7.58L18,9L10,17Z" />
        </svg>
        <span>Your information is secure and encrypted</span>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-black text-white">
          Loading...
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
