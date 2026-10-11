"use client";

import VantaGlobe from "@/lib/VantaGlobe";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import toast, { Toaster } from "react-hot-toast";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    user: "",
    password: "",
    token: "",
  });
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [remainingTime, setRemainingTime] = useState(null);
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const captchaRef = useRef(null);

  useEffect(() => {
    let interval;
    if (remainingTime !== null && remainingTime > 0) {
      interval = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [remainingTime]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCaptchaChange = (token) => {
    setRecaptchaToken(token);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!recaptchaToken) {
      toast.error("Please complete the CAPTCHA");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: formData.user,
          password: formData.password,
          recaptchaToken,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.twoFactorRequired) {
          setUserId(data.userId);
          setStep(2);
          toast("2FA required", { icon: "🔐" });
        } else {
          localStorage.setItem("token", data.token);
          localStorage.setItem(
            "user",
            JSON.stringify({
              id: data.user.id,
              username: data.user.username,
              email: data.user.email,
              isTwoFactorEnabled: data.user.isTwoFactorEnabled,
            })
          );
          toast.success("Login successful!");
          setTimeout(() => router.push("/account"), 1200);
        }
      } else {
        toast.error(data.error || "Login failed");
        captchaRef.current?.reset();
        setRecaptchaToken("");

        if (data.attemptsLeft !== undefined) {
          toast(`Attempts left: ${data.attemptsLeft}`, { icon: "⚠️" });
        }

        if (data.remainingTime !== undefined) {
          setRemainingTime(data.remainingTime);
        }
      }
    } catch (err) {
      toast.error("Server error. Try again later.");
    }
    setLoading(false);
  };

  const handle2FAVerify = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, token: formData.token }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem(
          "user",
          JSON.stringify({
            id: data.user.id,
            username: data.user.username,
            email: data.user.email,
            isTwoFactorEnabled: data.user.isTwoFactorEnabled,
          })
        );
        localStorage.setItem("token", data.token);
        toast.success("2FA verified. Logging in...");
        setTimeout(() => router.push("/account"), 1200);
      } else {
        toast.error(data.error || "Verification failed");
      }
    } catch (err) {
      toast.error("Server error during 2FA.");
    }
    setLoading(false);
  };

  return (
    <div className="auth-shell flex items-center justify-center p-4 sm:p-6">
      <VantaGlobe />
      <Toaster position="top-center" />

      <div className="auth-v2-layout">
        <aside className="auth-v2-aside">
          <div>
            <div className="auth-v2-eyebrow">Secure Portal / Access</div>
            <div className="auth-brand-mark mt-8 inline-flex h-14 w-14 items-center justify-center rounded-2xl">
              <svg className="h-7 w-7 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="mt-8 max-w-xs text-4xl font-semibold leading-tight tracking-tight text-white">
              Your digital space, secured.
            </h2>
            <p className="mt-5 max-w-xs text-sm leading-6 text-slate-400">
              Sign in to continue to a private workspace built around your security.
            </p>
          </div>
          <div className="space-y-4">
            <div className="auth-v2-feature">Encrypted account access</div>
            <div className="auth-v2-feature">Two-factor authentication ready</div>
            <div className="auth-v2-feature">Real-time security alerts</div>
          </div>
        </aside>
        <main className="auth-v2-content">
        <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="auth-brand-mark mx-auto mb-5 inline-flex h-16 w-16 items-center justify-center rounded-3xl">
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
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-lime-300/80">
              Secure Portal
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-white">
              {step === 1 ? "Welcome Back" : "Verify Identity"}
            </h1>
            <p className="text-sm text-slate-400">
              {step === 1
                ? "Sign in to your account"
                : "Enter your 2FA code to continue"}
            </p>
          </div>
        </div>

        <div className="auth-card relative w-full max-w-md rounded-3xl p-6 sm:p-8">
          {step === 1 ? (
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-5">
                <div>
                  <label
                    htmlFor="user"
                    className="block text-sm font-medium text-white mb-2"
                  >
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
                    className="auth-input w-full rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-white mb-2"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="w-5 h-5 text-gray-400"
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
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      autoComplete="new-password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Password"
                      className="auth-input w-full rounded-xl py-3 pl-12 pr-10 text-white placeholder-slate-500 outline-none transition-all autofill:bg-zinc-800 autofill:text-white"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
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
                </div>

                {/*  CAPTCHA Below Password */}
                <div className="pt-2 flex justify-center items-center">
                  <ReCAPTCHA
                    ref={captchaRef}
                    sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
                    onChange={handleCaptchaChange}
                    theme="dark"
                  />
                </div>
              </div>

              {remainingTime !== null && (
                <div className="text-center text-red-400 text-sm mt-2">
                  Try again in {Math.floor(remainingTime / 60)}m{" "}
                  {remainingTime % 60}s
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="auth-button w-full rounded-xl py-3.5 font-semibold text-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="token"
                  className="block text-sm font-medium text-white mb-2"
                >
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
                  className="auth-input w-full rounded-xl px-4 py-3 text-white placeholder-slate-500 outline-none transition-all"
                />
              </div>
              <button
                onClick={handle2FAVerify}
                disabled={loading}
                className="auth-button w-full rounded-xl py-3.5 font-semibold text-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Verify Code"}
              </button>
            </div>
          )}

          <div className="text-center mt-6">
            <a
              href="/forgot-password"
              className="auth-link text-sm underline underline-offset-4"
            >
              Forgot your password?
            </a>
          </div>
          <div className="text-center mt-4">
            <a
              href="/register"
              className="auth-link text-sm underline underline-offset-4"
            >
              No account? Sign up
            </a>
          </div>
        </div>

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
        </main>
      </div>
    </div>
  );
}
