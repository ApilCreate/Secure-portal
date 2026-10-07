"use client";
import { useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import ReCAPTCHA from "react-google-recaptcha";

function RegisterBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-[#03060a]">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#03060a] via-[#040a06] to-[#020302]" />

      {/* Large aurora glows */}
      <div className="register-bg-aurora-1 absolute -left-[20%] -top-[15%] h-[800px] w-[800px] rounded-full bg-[radial-gradient(circle,rgba(163,230,53,0.22),transparent_65%)] blur-[100px]" />
      <div className="register-bg-aurora-2 absolute -right-[20%] top-[0%] h-[750px] w-[750px] rounded-full bg-[radial-gradient(circle,rgba(34,211,153,0.18),transparent_65%)] blur-[110px]" />
      <div className="register-bg-aurora-3 absolute left-[30%] -bottom-[30%] h-[700px] w-[700px] rounded-full bg-[radial-gradient(circle,rgba(132,204,22,0.16),transparent_65%)] blur-[120px]" />

      {/* Glow directly behind the card */}
      <div className="absolute left-1/2 top-[45%] h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(190,255,150,0.14),transparent_70%)] blur-[80px]" />

      {/* Perspective grid floor */}
      <div
        className="register-bg-grid absolute -bottom-[15%] -left-[25%] h-[55%] w-[150%]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(163,230,53,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(163,230,53,0.35) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          transform: "perspective(500px) rotateX(62deg)",
          transformOrigin: "bottom",
          maskImage: "linear-gradient(to top, black 20%, transparent 90%)",
          WebkitMaskImage: "linear-gradient(to top, black 20%, transparent 90%)",
        }}
      />

      {/* Floating particles */}
      <div className="register-bg-particle absolute left-[15%] top-[20%] h-1.5 w-1.5 rounded-full bg-lime-300 shadow-[0_0_14px_4px_rgba(163,230,53,0.7)]" />
      <div className="register-bg-particle absolute right-[18%] top-[30%] h-1 w-1 rounded-full bg-emerald-300 shadow-[0_0_12px_3px_rgba(52,211,153,0.6)]" style={{ animationDelay: "1.5s" }} />
      <div className="register-bg-particle absolute left-[25%] bottom-[35%] h-1 w-1 rounded-full bg-lime-200 shadow-[0_0_10px_3px_rgba(190,255,150,0.6)]" style={{ animationDelay: "3s" }} />
      <div className="register-bg-particle absolute right-[28%] bottom-[22%] h-1.5 w-1.5 rounded-full bg-lime-400 shadow-[0_0_14px_4px_rgba(163,230,53,0.6)]" style={{ animationDelay: "2s" }} />
      <div className="register-bg-particle absolute right-[10%] top-[60%] h-1 w-1 rounded-full bg-emerald-200 shadow-[0_0_10px_3px_rgba(110,231,183,0.5)]" style={{ animationDelay: "0.8s" }} />

      {/* Film grain */}
      <div
        className="absolute inset-0 opacity-[0.05] mix-blend-soft-light"
        style={{
          backgroundImage:
            "url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27200%27 height=%27200%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.9%27 numOctaves=%274%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23n)%27/%3E%3C/svg%3E')",
          backgroundSize: "180px 180px",
        }}
      />

      {/* Edge hairline */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lime-400/40 to-transparent" />

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.6)_100%)]" />

      <style>{`
        @keyframes drift-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(80px, 50px) scale(1.1); }
        }
        @keyframes drift-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-70px, 40px) scale(1.08); }
        }
        @keyframes drift-3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(50px, -60px) scale(1.12); }
        }
        @keyframes particle-float {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.6; }
          50% { transform: translateY(-18px) scale(1.4); opacity: 1; }
        }
        .register-bg-aurora-1 { animation: drift-1 24s ease-in-out infinite; }
        .register-bg-aurora-2 { animation: drift-2 28s ease-in-out infinite; }
        .register-bg-aurora-3 { animation: drift-3 32s ease-in-out infinite; }
        .register-bg-particle { animation: particle-float 6s ease-in-out infinite; }
      `}</style>
    </div>
  );
}

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const captchaRef = useRef(null);

  // Password strength checker
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const verifyOtp = async () => {
    if (!otp) {
      toast.error("Please enter the OTP.");
      return;
    }

    try {
      const res = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, otp }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("OTP verified. You can now complete registration.");
        setEmailVerified(true);
      } else {
        toast.error(` ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      toast.error(" Verification failed.");
    }
  };

  const handleResendOtp = async () => {
    try {
      const res = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("OTP resent to your email.");
      } else {
        toast.error(` ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to resend OTP.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!isOtpSent) {
      try {
        const res = await fetch("/api/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: formData.email }),
        });

        const data = await res.json();

        if (res.ok) {
          toast.success(" OTP sent to your email.");
          setIsOtpSent(true);
        } else {
          toast.error(` ${data.error}`);
        }
      } catch (error) {
        console.error(error);
        toast.error(" Failed to send OTP.");
      }

      setLoading(false);
      return; // Wait for OTP to be entered
    }

    if (!emailVerified) {
      toast.error("Please verify the OTP sent to your email.");
      setLoading(false);
      return;
    }

    if (!captchaToken) {
      toast.error("Please complete the CAPTCHA before creating your account.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...formData, captchaToken }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(" Registration successful!");
        setFormData({ username: "", email: "", password: "" });
        setCaptchaToken(null);
        setOtp("");
        setIsOtpSent(false);
        setEmailVerified(false);
      } else {
        toast.error(` ${data.error || "Registration failed"}`);
        captchaRef.current?.reset();
        setCaptchaToken(null);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(" Server error. Try again later.");
    }

    setLoading(false);
  };

  const passwordStrength = formData.password
    ? getPasswordStrength(formData.password)
    : null;

  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center p-4">
      <RegisterBackground />
      <Toaster position="top-center" />

      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-lime-500 rounded-xl mb-6">
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
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl p-4 max-w-md w-full space-y-6">
            <h1 className="text-3xl font-bold text-white mb-2">
              Create Account
            </h1>
            <p className="text-gray-400 text-sm">
              Enter your details to get started
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl p-8 max-w-md w-full space-y-6">
          <div className="space-y-6">
            {/* Username Field */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Username
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
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Username"
                  className="w-full pl-12 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-400 text-white placeholder-slate-500 transition-all duration-200"
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Email Address
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
                      d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                    />
                  </svg>
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                  className="w-full pl-12 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-400 text-white placeholder-slate-500 transition-all duration-200"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
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
                  name="password"
                  value={formData.password}
                  autoComplete="new-password"
                  onChange={handleChange}
                  placeholder="Password"
                  className="w-full pl-12 pr-10 py-3 bg-zinc-800 border border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-400 text-white placeholder-slate-500 transition-all duration-200"
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

              {/* Password Strength Indicator */}
              {passwordStrength && (
                <div className="space-y-2 mt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-400">
                      Password Strength
                    </span>
                    <span
                      className={`text-xs font-semibold ${passwordStrength.color}`}
                    >
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-full ${passwordStrength.bg} transition-all duration-500 ease-out rounded-full`}
                      style={{ width: passwordStrength.width }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
            {isOtpSent && !emailVerified && (
              <div className="mt-4 space-y-2">
                <label className="block text-white text-sm font-medium">
                  Enter OTP
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="6-digit code"
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white"
                />

                {/* Verify + Resend Buttons side by side */}
                <div className="flex gap-4 mt-3">
                  <button
                    type="button"
                    onClick={verifyOtp}
                    className="w-full bg-lime-400 hover:bg-lime-500 text-black font-semibold py-3 rounded-lg text-sm transition-colors duration-200"
                  >
                    Verify OTP
                  </button>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="w-full py-3 bg-transparent border-lime-400 border-2 text-lime-400 hover:bg-lime-500 hover:text-black font-semibold rounded-lg text-sm transition-colors duration-200"
                  >
                    Resend OTP
                  </button>
                </div>
              </div>
            )}

            {/* reCAPTCHA — shown only after email is verified so token stays fresh */}
            {emailVerified && (
              <div className="flex justify-center py-2">
                <ReCAPTCHA
                  ref={captchaRef}
                  sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
                  onChange={(token) => setCaptchaToken(token)}
                  theme="dark"
                />
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-lime-400 hover:bg-lime-500 text-black font-semibold py-3 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mt-2"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                  <span>Creating Account...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span>
                    {!isOtpSent
                      ? "Send OTP"
                      : !emailVerified
                        ? "Verify OTP First"
                        : "Create Account"}
                  </span>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              )}
            </button>

            {/* Back to Sign In */}
            <div className="text-center mt-2">
              <a
                href="/login"
                className="text-lime-500 underline underline-offset-2 hover:text-lime-400 text-sm transition-colors duration-200"
              >
                Already have a account? Sign In
              </a>
            </div>
          </div>
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
    </div>
  );
}
