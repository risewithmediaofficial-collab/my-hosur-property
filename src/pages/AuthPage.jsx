import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { ShieldCheckIcon, EnvelopeIcon, LockClosedIcon, PhoneIcon, MapPinIcon, UserIcon, UserCircleIcon } from "../components/AppIcons";
import BrandLogo from "../components/BrandLogo";
import { loginUser, resendOtp, signupUser, verifyOtp } from "../services/api/authApi";
import useAuth from "../hooks/useAuth";
import useScrollToTop from "../hooks/useScrollToTop";
import { auth } from "../lib/firebase";

const MotionDiv = motion.div;
const AUTH_FORM = {
  name: "",
  email: "",
  phone: "",
  address: "",
  password: "",
  role: "buyer",
};

const fade = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -16, transition: { duration: 0.25 } },
};

const stagger = {
  show: { transition: { staggerChildren: 0.07 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] } },
};

const Field = ({ label, icon: Icon, ...props }) => (
  <MotionDiv variants={item} className="auth-field-wrap">
    <label className="auth-label">{label}</label>
    <div className="auth-input-shell">
      {Icon ? <Icon className="auth-input-icon" /> : null}
      <input className={`auth-input ${Icon ? "auth-input-with-icon" : ""}`} {...props} />
    </div>
  </MotionDiv>
);

const SelectField = ({ label, icon: Icon, children, ...props }) => (
  <MotionDiv variants={item} className="auth-field-wrap">
    <label className="auth-label">{label}</label>
    <div className="auth-input-shell">
      {Icon ? <Icon className="auth-input-icon" /> : null}
      <select className={`auth-input auth-select ${Icon ? "auth-input-with-icon" : ""}`} {...props}>
        {children}
      </select>
    </div>
  </MotionDiv>
);

const AuthPage = () => {
  const navigate = useNavigate();
  const scrollToTop = useScrollToTop();
  const location = useLocation();
  const { login } = useAuth();
  const redirectTo = location.state?.from?.pathname || "/dashboard";

  const [mode, setMode] = useState("login");
  const [step, setStep] = useState("credentials");
  const [form, setForm] = useState(AUTH_FORM);
  const [otpCode, setOtpCode] = useState("");
  const [otpState, setOtpState] = useState(null);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [otpExpiryCountdown, setOtpExpiryCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [firebaseConfirmation, setFirebaseConfirmation] = useState(null);
  const recaptchaVerifierRef = useRef(null);

  const onChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
    if (resendCountdown <= 0) return undefined;

    const timer = window.setTimeout(() => {
      setResendCountdown((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [resendCountdown]);

  useEffect(() => {
    if (otpExpiryCountdown <= 0) return undefined;

    const timer = window.setTimeout(() => {
      setOtpExpiryCountdown((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [otpExpiryCountdown]);

  const resetOtpFlow = () => {
    setStep("credentials");
    setOtpCode("");
    setOtpState(null);
    setFirebaseConfirmation(null);
    setResendCountdown(0);
    setOtpExpiryCountdown(0);
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    resetOtpFlow();
  };

  const getRecaptchaVerifier = () => {
    if (!recaptchaVerifierRef.current) {
      recaptchaVerifierRef.current = new RecaptchaVerifier(auth, "firebase-recaptcha-container", {
        size: "invisible",
      });
    }

    return recaptchaVerifierRef.current;
  };

  const sendFirebaseOtp = async (challenge) => {
    if (challenge.provider !== "firebase") return null;

    const phoneNumber = challenge.firebasePhoneNumber;
    if (!phoneNumber) {
      throw new Error("Firebase phone number is missing from the OTP challenge.");
    }

    const confirmation = await signInWithPhoneNumber(auth, phoneNumber, getRecaptchaVerifier());
    setFirebaseConfirmation(confirmation);
    return confirmation;
  };

  const submit = async (event) => {
    event.preventDefault();

    // Validation for login mode
    if (mode === "login" && !form.email && !form.phone) {
      toast.error("Please enter your email address or mobile number");
      return;
    }

    setLoading(true);

    try {
      if (step === "otp") {
        let firebaseIdToken = "";

        if (otpState?.provider === "firebase") {
          if (!firebaseConfirmation) {
            throw new Error("OTP session expired. Please resend the code.");
          }

          const firebaseCredential = await firebaseConfirmation.confirm(otpCode.trim());
          firebaseIdToken = await firebaseCredential.user.getIdToken();
        }

        const data = await verifyOtp({
          challengeId: otpState?.challengeId,
          ...(firebaseIdToken ? { firebaseIdToken } : { otp: otpCode.trim() }),
        });

        login(data);
        toast.success(mode === "signup" ? "Account verified successfully" : "Welcome back");
        scrollToTop();
        navigate(redirectTo);
      } else {
        const payload =
          mode === "signup"
            ? { ...form }
            : {
                email: form.email || undefined,
                phone: form.phone || undefined,
                password: form.password,
              };

        const challenge = mode === "signup" ? await signupUser(payload) : await loginUser(payload);
        await sendFirebaseOtp(challenge);
        setOtpState(challenge);
        setOtpCode("");
        setStep("otp");
        setResendCountdown(challenge.resendAvailableInSeconds || 0);
        setOtpExpiryCountdown(challenge.expiresInSeconds || 0);
        toast.success(challenge.message || "OTP sent successfully");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!otpState?.challengeId || resendCountdown > 0) return;

    setLoading(true);
    try {
      const refreshedChallenge = await resendOtp({ challengeId: otpState.challengeId });
      await sendFirebaseOtp(refreshedChallenge);
      setOtpState(refreshedChallenge);
      setOtpCode("");
      setResendCountdown(refreshedChallenge.resendAvailableInSeconds || 0);
      setOtpExpiryCountdown(refreshedChallenge.expiresInSeconds || 0);
      toast.success(refreshedChallenge.message || "A new OTP has been sent");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Unable to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  const isSignup = mode === "signup";
  const submitDisabled = loading;
  const isOtpStep = step === "otp";
  const headingText = isOtpStep
    ? "Verify your mobile number"
    : isSignup
      ? "Create your account"
      : "Welcome back";
  const subText = isOtpStep
    ? `Enter the one-time password sent to ${otpState?.destination || "your registered mobile number"}.`
    : isSignup
      ? "Create a simple profile to browse listings, connect with sellers, and manage your property activity."
      : "Sign in to access saved listings, leads, and account activity in one place.";
  const statusText = isSignup ? "New account" : "Secure access";

  return (
    <>
      <style>{`
        .auth-page {
          min-height: calc(100vh - 178px);
          max-height: calc(100vh - 178px);
          display: grid;
          grid-template-columns: minmax(520px, 1fr) minmax(420px, 500px);
          grid-template-areas: "hero form";
          gap: clamp(28px, 4vw, 72px);
          background: #ffffff;
          font-family: 'Inter', sans-serif;
          overflow: hidden;
          padding: 0 clamp(36px, 5vw, 72px);
        }
        @media (max-width: 900px) {
          .auth-page {
            grid-template-columns: 1fr;
            grid-template-areas: "form";
            gap: 0;
            min-height: auto;
            max-height: none;
            overflow: visible;
            padding: 0;
          }
          .auth-left {
            display: none !important;
          }
        }

        .auth-left {
          grid-area: hero;
          height: 100%;
          overflow: hidden;
          background: #f8fafc;
          border-right: 1px solid #e5e7eb;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          align-items: flex-start;
          padding: clamp(28px, 4vh, 48px) 0 32px;
          min-width: 0;
        }
        .auth-left-img {
          position: absolute;
          inset: 0;
          object-fit: cover;
          width: 100%;
          height: 100%;
          opacity: 0.06;
        }
        .auth-left-overlay {
          position: absolute;
          inset: 0;
          background: rgba(255, 255, 255, 0.9);
        }
        .auth-left-content {
          position: relative;
          z-index: 1;
          max-width: 520px;
          margin: 0;
          text-align: left;
        }
        .auth-left-logo {
          display: inline-flex;
          align-items: center;
          padding: 10px 14px;
          border: 1px solid #e5e7eb;
          border-radius: 18px;
          background: #ffffff;
          box-shadow: 0 12px 30px rgba(0, 66, 162, 0.08);
          margin-bottom: 22px;
        }
        .auth-left-logo-img {
          width: 280px;
          max-width: 100%;
        }
        .auth-left-heading {
          margin: 0 0 14px;
          font-size: clamp(30px, 3.4vw, 48px);
          font-weight: 800;
          color: #111111;
          line-height: 1.08;
          letter-spacing: -1.2px;
          max-width: 440px;
        }
        .auth-left-sub {
          margin: 0;
          max-width: 390px;
          font-size: 15px;
          line-height: 1.65;
          color: #555555;
        }
        .auth-stats {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
          margin-top: 28px;
          max-width: 460px;
        }
        @media (max-height: 820px) {
          .auth-left {
            padding-top: 40px;
          }
          .auth-left-content {
            margin-top: 0;
          }
        }
        .auth-stat-item {
          padding: 14px 0;
          border-top: 1px solid #e5e7eb;
        }
        .auth-stat-num {
          font-size: 26px;
          line-height: 1;
          font-weight: 700;
          color: #111111;
        }
        .auth-stat-label {
          margin-top: 8px;
          font-size: 11px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .auth-right {
          grid-area: form;
          position: relative;
          z-index: 3;
          display: flex;
          align-items: flex-start;
          justify-content: flex-end;
          padding: clamp(28px, 4vh, 48px) 0 32px;
          overflow: visible;
          background: #ffffff;
          height: 100%;
          min-width: 0;
        }
        .auth-card {
          position: relative;
          z-index: 4;
          width: 100%;
          max-width: 460px;
          flex: 0 0 min(460px, 100%);
        }
        .auth-card-signup {
          margin-top: -8px;
        }
        .auth-card-surface {
          padding: 24px 30px 28px;
          border: 1px solid #e2e8f0;
          border-radius: 24px;
          background: #ffffff;
          box-shadow: 0 16px 32px rgba(17, 17, 17, 0.04);
          max-height: calc(100vh - 220px);
          overflow-y: auto;
          overflow-x: hidden;
        }
        .auth-card-surface::-webkit-scrollbar {
          width: 8px;
        }
        .auth-card-surface::-webkit-scrollbar-track {
          background: transparent;
        }
        .auth-card-surface::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
          transition: background 0.2s ease;
        }
        .auth-card-surface::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        @media (min-width: 1024px) {
          .auth-card-surface {
            padding: 30px;
          }
        }
        @media (max-width: 900px) {
          .auth-right {
            padding: 18px 18px 32px;
            justify-content: center;
            overflow: visible;
            height: auto;
          }
          .auth-card-surface {
            padding: 20px 22px 22px;
            border-radius: 22px;
            max-height: calc(100vh - 150px);
          }
          .auth-card-signup {
            margin-top: 0;
          }
        }

        .auth-brand-mobile {
          display: none;
          margin-bottom: 18px;
        }
        .auth-brand-mobile-img {
          width: 220px;
          max-width: 100%;
        }
        @media (max-width: 900px) {
          .auth-brand-mobile {
            display: block;
          }
        }

        .auth-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 18px;
        }
        .auth-badge {
          display: inline-flex;
          align-items: center;
          padding: 0;
        }
        .auth-badge-logo {
          width: 150px;
          max-width: 40vw;
        }
        .auth-badge-icon {
          width: 14px;
          height: 14px;
        }
        .auth-status {
          font-size: 11px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .auth-mode-switch {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px;
          padding: 4px;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          background: #f5f5f5;
          margin-bottom: 22px;
        }
        .auth-mode-btn {
          border: none;
          border-radius: 12px;
          background: transparent;
          color: #475569;
          font-size: 14px;
          font-weight: 700;
          padding: 12px 16px;
          cursor: pointer;
          transition: background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
        }
        .auth-mode-btn.is-active {
          background: #ffffff;
          color: #111111;
          box-shadow: 0 8px 18px rgba(17, 17, 17, 0.06);
        }

        .auth-heading-wrap {
          margin-bottom: 18px;
        }
        .auth-title {
          margin: 0;
          font-size: clamp(28px, 2.6vw, 36px);
          line-height: 1.1;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.9px;
        }
        .auth-subtitle {
          margin: 12px 0 0;
          font-size: 15px;
          line-height: 1.55;
          color: #64748b;
          max-width: 420px;
        }

        .auth-fields {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .auth-field-wrap {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .auth-label {
          font-size: 12px;
          font-weight: 700;
          color: #334155;
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }
        .auth-input-shell {
          position: relative;
          display: flex;
          align-items: center;
          min-height: 52px;
          border: 1px solid #dbe0e6;
          border-radius: 14px;
          background: #ffffff;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .auth-input-shell:focus-within {
          border-color: #111111;
          box-shadow: 0 0 0 3px rgba(17, 17, 17, 0.08);
        }
        .auth-input-icon {
          position: absolute;
          left: 16px;
          width: 17px;
          height: 17px;
          color: #94a3b8;
          pointer-events: none;
        }
        .auth-input {
          width: 100%;
          min-height: 52px;
          border: none;
          background: transparent;
          color: #0f172a;
          font-size: 15px;
          font-family: inherit;
          outline: none;
          padding: 0 16px;
        }
        .auth-input::placeholder {
          color: #9aa7b9;
        }
        .auth-input-with-icon {
          padding-left: 48px;
        }
        .auth-select {
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%2394A3B8'%3E%3Cpath fill-rule='evenodd' d='M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z' clip-rule='evenodd'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 16px center;
          background-size: 18px;
          padding-right: 46px;
        }

        .auth-free-badge {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 14px 16px;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          background: #fafafa;
          color: #475569;
          font-size: 13px;
          line-height: 1.6;
        }
        .auth-free-badge-icon {
          width: 16px;
          height: 16px;
          color: #64748b;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .auth-submit {
          width: 100%;
          min-height: 54px;
          border: none;
          border-radius: 10px;
          background: #f79e26;
          color: #ffffff;
          font-size: 16px;
          font-weight: 700;
          font-family: inherit;
          letter-spacing: 0.2px;
          cursor: pointer;
          transition: background 0.18s ease, opacity 0.18s ease, transform 0.2s ease, box-shadow 0.2s ease;
          box-shadow: 0 4px 14px rgba(247, 158, 38, 0.35);
        }
        .auth-submit:hover:not(:disabled) {
          background: #d77f09;
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(247, 158, 38, 0.4);
        }
        .auth-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .auth-secondary-btn {
          border: 1px solid #d5dce5;
          background: #ffffff;
          color: #0f172a;
          border-radius: 10px;
          min-height: 48px;
          padding: 0 16px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: border-color 0.18s ease, transform 0.18s ease, background 0.18s ease;
        }
        .auth-secondary-btn:hover:not(:disabled) {
          border-color: #94a3b8;
          background: #f8fafc;
          transform: translateY(-1px);
        }
        .auth-secondary-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }
        .auth-otp-note {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 14px 16px;
          border-radius: 16px;
          border: 1px solid #cbd5e1;
          background: #f8fafc;
          color: #475569;
          font-size: 13px;
          line-height: 1.6;
        }
        .auth-otp-note strong {
          color: #0f172a;
        }
        .auth-otp-note code {
          font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
          font-size: 12px;
          color: #b45309;
        }

        .auth-support-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 18px;
        }
        .auth-support-copy {
          font-size: 13px;
          color: #64748b;
        }
        .auth-support-copy strong {
          color: #0f172a;
        }
        .auth-support-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .auth-toggle-btn {
          border: none;
          background: transparent;
          padding: 0;
          color: #111111;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
        }
        .auth-toggle-btn:hover {
          text-decoration: underline;
        }
        .auth-security-note {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 20px;
          padding-top: 18px;
          border-top: 1px solid #e2e8f0;
          color: #64748b;
          font-size: 12px;
          line-height: 1.6;
        }
        .auth-security-icon {
          width: 16px;
          height: 16px;
          color: #111111;
          flex-shrink: 0;
        }

        @media (max-width: 560px) {
          .auth-topbar,
          .auth-support-row {
            flex-direction: column;
            align-items: flex-start;
          }
          .auth-support-actions {
            width: 100%;
            justify-content: space-between;
          }
          .auth-mode-btn {
            padding: 11px 12px;
            font-size: 13px;
          }
          .auth-title {
            font-size: 2rem;
          }
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        .auth-spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          margin-right: 8px;
          border: 2px solid rgba(255, 255, 255, 0.35);
          border-top-color: #ffffff;
          border-radius: 999px;
          vertical-align: middle;
          animation: spin 0.7s linear infinite;
        }
      `}</style>

      <div className="auth-page">
        <div id="firebase-recaptcha-container" />
        <div className="auth-left">
          <img
            className="auth-left-img"
            src="https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=1200&q=80"
            alt="Modern buildings in Hosur"
          />
          <div className="auth-left-overlay" />

          <div className="auth-left-content">
            <div className="auth-left-logo">
              <BrandLogo className="auth-left-logo-img" />
            </div>
            <h2 className="auth-left-heading">Find your perfect home in Hosur.</h2>
            <p className="auth-left-sub">
              Browse verified listings, connect with genuine sellers, and manage your property journey with less friction.
            </p>

            <div className="auth-stats">
              {[
                ["2,400+", "Listings"],
                ["1,200+", "Buyers"],
                ["98%", "Satisfaction"],
              ].map(([num, label]) => (
                <div className="auth-stat-item" key={label}>
                  <div className="auth-stat-num">{num}</div>
                  <div className="auth-stat-label">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="auth-right">
          <motion.div className={`auth-card ${isSignup ? "auth-card-signup" : ""}`} initial="hidden" animate="show" variants={fade}>
            <div className="auth-brand-mobile">
              <BrandLogo className="auth-brand-mobile-img" />
            </div>

            <div className="auth-card-surface">
              <div className="auth-topbar">
                <div className="auth-badge">
                  <BrandLogo className="auth-badge-logo" />
                </div>
                <div className="auth-status">{statusText}</div>
              </div>

              <div className="auth-mode-switch">
                <button
                  type="button"
                  className={`auth-mode-btn ${!isSignup ? "is-active" : ""}`}
                  onClick={() => {
                    switchMode("login");
                  }}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  className={`auth-mode-btn ${isSignup ? "is-active" : ""}`}
                  onClick={() => {
                    switchMode("signup");
                  }}
                >
                  Create Account
                </button>
              </div>

              <AnimatePresence mode="wait">
                <motion.div key={mode} variants={fade} initial="hidden" animate="show" exit="exit">
                  <div className="auth-heading-wrap">
                    <h1 className="auth-title">{headingText}</h1>
                    <p className="auth-subtitle">{subText}</p>
                  </div>

                  <form onSubmit={submit}>
                    <motion.div className="auth-fields" variants={stagger} initial="hidden" animate="show">
                      {isOtpStep ? (
                        <>
                          <Field
                            label="One-Time Password"
                            icon={ShieldCheckIcon}
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            maxLength={6}
                            placeholder="Enter 6-digit OTP"
                            value={otpCode}
                            onChange={(event) => setOtpCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                            required
                          />

                          <motion.div variants={item} className="auth-otp-note">
                            <ShieldCheckIcon className="auth-free-badge-icon" />
                            <span>
                              OTP expires in <strong>{Math.max(0, otpExpiryCountdown)} seconds</strong>.
                              {!isSignup ? " This keeps your account sign-in protected." : " We’ll activate your account right after verification."}
                              {otpState?.developmentOtp ? (
                                <>
                                  {" "}
                                  Dev OTP: <code>{otpState.developmentOtp}</code>
                                </>
                              ) : null}
                            </span>
                          </motion.div>
                        </>
                      ) : (
                        <>
                          {isSignup ? (
                            <Field
                              label="Full Name"
                              icon={UserIcon}
                              placeholder="Ravi Kumar"
                              value={form.name}
                              onChange={(event) => onChange("name", event.target.value)}
                              required
                            />
                          ) : null}

                          <Field
                            label="Email Address"
                            icon={EnvelopeIcon}
                            type="email"
                            autoComplete="email"
                            placeholder="you@example.com"
                            value={form.email}
                            onChange={(event) => onChange("email", event.target.value)}
                            required={isSignup}
                          />

                          {isSignup ? (
                            <Field
                              label="Mobile Number"
                              icon={PhoneIcon}
                              type="tel"
                              inputMode="tel"
                              autoComplete="tel"
                              placeholder="9994005086"
                              value={form.phone}
                              onChange={(event) => onChange("phone", event.target.value)}
                              required
                            />
                          ) : (
                            <Field
                              label="Mobile Number (Optional)"
                              icon={PhoneIcon}
                              type="tel"
                              inputMode="tel"
                              autoComplete="tel"
                              placeholder="9994005086"
                              value={form.phone}
                              onChange={(event) => onChange("phone", event.target.value)}
                            />
                          )}

                          {isSignup ? (
                            <Field
                              label="Address"
                              icon={MapPinIcon}
                              placeholder="Hosur, Tamil Nadu"
                              value={form.address}
                              onChange={(event) => onChange("address", event.target.value)}
                            />
                          ) : null}

                          <Field
                            label="Password"
                            icon={LockClosedIcon}
                            type="password"
                            autoComplete={isSignup ? "new-password" : "current-password"}
                            placeholder="Enter your password"
                            value={form.password}
                            onChange={(event) => onChange("password", event.target.value)}
                            required
                          />

                          {isSignup ? (
                            <SelectField
                              label="I Am A"
                              icon={UserCircleIcon}
                              value={form.role}
                              onChange={(event) => onChange("role", event.target.value)}
                            >
                              <option value="buyer">Buyer / Tenant</option>
                              <option value="seller">Property Seller</option>
                              <option value="agent">Agent</option>
                              <option value="broker">Broker</option>
                              <option value="builder">Builder</option>
                              <option value="customer">Customer</option>
                            </SelectField>
                          ) : null}

                          {isSignup ? (
                            <motion.div variants={item} className="auth-free-badge">
                              <ShieldCheckIcon className="auth-free-badge-icon" />
                              <span>
                                New accounts include <strong>1 free property listing</strong> for 90 days.
                              </span>
                            </motion.div>
                          ) : null}
                        </>
                      )}

                      <motion.div variants={item}>
                        <button type="submit" className="auth-submit" disabled={submitDisabled}>
                          {loading ? <span className="auth-spinner" /> : null}
                          {loading
                            ? "Please wait..."
                            : isOtpStep
                              ? "Verify & Continue"
                              : isSignup
                                ? "Send OTP"
                                : "Send Login OTP"}
                        </button>
                      </motion.div>
                    </motion.div>

                    <div className="auth-support-row">
                      <div className="auth-support-copy">
                        {isOtpStep ? (
                          <span>
                            Sending to <strong>{otpState?.destination || "your mobile number"}</strong>
                          </span>
                        ) : isSignup ? (
                          <span>
                            Already registered? <strong>Sign in to continue.</strong>
                          </span>
                        ) : (
                          <span>
                            New here? <strong>Create an account in minutes.</strong>
                          </span>
                        )}
                      </div>

                      <div className="auth-support-actions">
                        {isOtpStep ? (
                          <>
                            <button
                              type="button"
                              className="auth-secondary-btn"
                              onClick={handleResendOtp}
                              disabled={loading || resendCountdown > 0}
                            >
                              {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : "Resend OTP"}
                            </button>
                            <button
                              type="button"
                              className="auth-toggle-btn"
                              onClick={resetOtpFlow}
                            >
                              Edit Details
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            className="auth-toggle-btn"
                            onClick={() => {
                              switchMode(isSignup ? "login" : "signup");
                            }}
                          >
                            {isSignup ? "Back to Sign In" : "Create Account"}
                          </button>
                        )}
                      </div>
                    </div>
                  </form>

                  <div className="auth-security-note">
                    <ShieldCheckIcon className="auth-security-icon" />
                    {isOtpStep
                      ? "Your one-time password is short-lived and verified securely before access is granted."
                      : "Secure sign-in for saved listings, leads, and account activity."}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default AuthPage;
