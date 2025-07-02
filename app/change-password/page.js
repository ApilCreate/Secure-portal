"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const eyeIcon = (
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
  );

  const eyeOffIcon = (
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
  );

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser || storedUser === "undefined") return;

    try {
      const parsed = JSON.parse(storedUser);
      console.log("User loaded from storage:", parsed);

      if (parsed?.id) setUserId(parsed.id);

      if (parsed?.isTwoFactorEnabled) {
        setShow2FA(true);
      } else {
        setShow2FA(false);
      }
    } catch (err) {
      console.error("Failed to parse user from localStorage:", err);
    }
  }, []);

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

  const passwordStrength = newPassword
    ? getPasswordStrength(newPassword)
    : null;
  const passwordsMatch =
    newPassword && confirmPassword && newPassword === confirmPassword;

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword || !userId) {
      return toast.error("Please fill in all fields");
    }
    if (newPassword === currentPassword) {
      return toast.error(
        "New password cannot be the same as the current password"
      );
    }
    if (!passwordsMatch) {
      return toast.error("Passwords do not match");
    }

    setLoading(true);
    try {
      const res = await fetch("/api/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          currentPassword,
          newPassword,
          token: show2FA ? token : undefined,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setToken("");
        setTimeout(() => router.push("/account"), 1000);
      } else {
        if (data.error?.includes("twice a day")) {
          toast.error("Password change limit reached. Try again tomorrow.");
        } else {
          toast.error(data.error || "Password change failed");
        }
      }
    } catch (err) {
      toast.error("Server error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:20px_20px] bg-black flex flex-col items-center justify-center p-6">
      <Toaster position="top-center" />
      {/* Enhanced Back Button */}
      <button
        onClick={() => router.push("/account")}
        className="absolute top-6 left-6 group flex items-center gap-2 text-sm text-white/90 bg-black/30 backdrop-blur-md border border-lime-500/30 px-5 py-3 rounded-2xl hover:bg-lime-500/10 hover:border-lime-400 hover:text-white transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-lime-500/20"
      >
        <svg
          className="w-4 h-4 transition-transform group-hover:-translate-x-0.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to Dashboard
      </button>

      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-lime-400 rounded-3xl mb-6">
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
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-semibold text-white mb-2">
          Change Password
        </h1>
        <p className="text-slate-400">
          Secure your account with a new password
        </p>
      </div>

      <form
        onSubmit={handleChangePassword}
        className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl p-8 w-full max-w-md space-y-6"
      >
        {/* Current Password */}
        <div className="relative">
          <input
            type={showCurrent ? "text" : "password"}
            name="currentPassword"
            id="currentPassword"
            autoComplete="new-password"
            placeholder="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            className="w-full p-4 pr-12 bg-black/30 text-white placeholder-gray-400 border border-gray-700 rounded-xl autofill:shadow-[inset_0_0_0px_1000px_rgba(0,0,0,0.2)] autofill:text-white"
          />

          <button
            type="button"
            onClick={() => setShowCurrent((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-400 hover:text-white"
          >
            {showCurrent ? eyeOffIcon : eyeIcon}
          </button>
        </div>

        {/* New Password */}
        <div className="relative">
          <input
            type={showNew ? "text" : "password"}
            name="newPassword"
            id="newPassword"
            autoComplete="new-password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="w-full p-4 pr-12 bg-black/30 text-white placeholder-gray-400 border border-gray-700 rounded-xl"
          />

          <button
            type="button"
            onClick={() => setShowNew((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-400 hover:text-white"
          >
            {showNew ? eyeOffIcon : eyeIcon}
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

        {/* Confirm New Password */}
        <div className="relative">
          <input
            type={showConfirm ? "text" : "password"}
            name="confirmPassword"
            id="confirmPassword"
            autoComplete="new-password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full p-4 pr-12 bg-black/30 text-white placeholder-gray-400 border border-gray-700 rounded-xl"
          />

          <button
            type="button"
            onClick={() => setShowConfirm((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-400 hover:text-white"
          >
            {showConfirm ? eyeOffIcon : eyeIcon}
          </button>
        </div>

        {confirmPassword && (
          <p
            className={`text-sm ${
              passwordsMatch ? "text-green-400" : "text-red-400"
            }`}
          >
            {passwordsMatch ? " Passwords match" : " Passwords do not match"}
          </p>
        )}

        {show2FA && (
          <input
            type="text"
            placeholder="2FA Code"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="w-full p-4 bg-black/30 text-white placeholder-gray-400 border border-gray-700 rounded-xl"
          />
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-lime-500 hover:bg-lime-400 text-black font-semibold py-3 rounded-xl transition duration-300"
        >
          {loading ? "Updating..." : "Change Password"}
        </button>

        <div className="text-center mt-6">
          <a
            href="/forgot-password"
            className="text-lime-500 underline underline-offset-2 hover:text-lime-400 text-sm transition-colors duration-200"
          >
            Forgot your password?
          </a>
        </div>
      </form>

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
