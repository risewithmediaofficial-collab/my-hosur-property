import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheckIcon, EnvelopeIcon, LockClosedIcon, PhoneIcon, MapPinIcon, UserIcon, UserCircleIcon, EyeIcon, EyeSlashIcon, SparklesIcon } from "../components/AppIcons";
import BrandLogo from "../components/BrandLogo";
import { loginUser, resendOtp, signupUser, verifyOtp as verifyOtpApi, verifyWidgetToken, forgotPassword, resetPassword } from "../services/api/authApi";
import useAuth from "../hooks/useAuth";
import useScrollToTop from "../hooks/useScrollToTop";
import AnimatedOTPInput from "../components/AnimatedOTPInput";
import { AnimatedCharactersLoginPage } from "../components/ui/animated-characters-login-page";
import loginIllustration from "../assets/Wavy_Gen-01_Single-07.jpg";

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

const Field = ({ label, icon: Icon, id, ...props }) => {
  const defaultId = React.useId();
  const inputId = id || defaultId;
  return (
    <MotionDiv variants={item} className="auth-field-wrap group relative pt-2">
      <label
        htmlFor={inputId}
        className={`origin-start absolute top-[34px] block -translate-y-1/2 cursor-text px-1 text-xs font-semibold text-slate-400 transition-all pointer-events-none z-10
          group-focus-within:top-2 group-focus-within:text-[10px] group-focus-within:text-navy group-focus-within:font-bold
          has-[+div>input:not(:placeholder-shown)]:top-2 has-[+div>input:not(:placeholder-shown)]:text-[10px] has-[+div>input:not(:placeholder-shown)]:font-bold has-[+div>input:not(:placeholder-shown)]:text-navy
          ${Icon ? "left-12" : "left-4"}`}
      >
        <span className="inline-flex bg-white px-1.5">{label}</span>
      </label>
      <div className="auth-input-shell">
        {Icon ? <Icon className="auth-input-icon" /> : null}
        <input
          id={inputId}
          placeholder=" "
          className={`auth-input ${Icon ? "auth-input-with-icon" : ""}`}
          {...props}
        />
      </div>
    </MotionDiv>
  );
};

const SelectField = ({ label, icon: Icon, id, children, ...props }) => {
  const defaultId = React.useId();
  const inputId = id || defaultId;
  return (
    <MotionDiv variants={item} className="auth-field-wrap group relative pt-2">
      <label
        htmlFor={inputId}
        className={`origin-start absolute top-[34px] block -translate-y-1/2 cursor-text px-1 text-xs font-semibold text-slate-400 transition-all pointer-events-none z-10
          group-focus-within:top-2 group-focus-within:text-[10px] group-focus-within:text-navy group-focus-within:font-bold
          has-[+div>select:not([value=""]):not(:disabled)]:top-2 has-[+div>select:not([value=""]):not(:disabled)]:text-[10px] has-[+div>select:not([value=""]):not(:disabled)]:font-bold has-[+div>select:not([value=""]):not(:disabled)]:text-navy
          has-[+div>select]:top-2 has-[+div>select]:text-[10px] has-[+div>select]:font-bold has-[+div>select]:text-navy
          ${Icon ? "left-12" : "left-4"}`}
      >
        <span className="inline-flex bg-white px-1.5">{label}</span>
      </label>
      <div className="auth-input-shell">
        {Icon ? <Icon className="auth-input-icon" /> : null}
        <select
          id={inputId}
          className={`auth-input auth-select ${Icon ? "auth-input-with-icon" : ""}`}
          {...props}
        >
          {children}
        </select>
      </div>
    </MotionDiv>
  );
};

const PasswordField = ({ label, icon: Icon, showForgotPasswordLink, onForgotPasswordClick, id, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  const defaultId = React.useId();
  const inputId = id || defaultId;
  return (
    <div>
      <MotionDiv variants={item} className="auth-field-wrap group relative pt-2">
        <label
          htmlFor={inputId}
          className={`origin-start absolute top-[34px] block -translate-y-1/2 cursor-text px-1 text-xs font-semibold text-slate-400 transition-all pointer-events-none z-10
            group-focus-within:top-2 group-focus-within:text-[10px] group-focus-within:text-navy group-focus-within:font-bold
            has-[+div>input:not(:placeholder-shown)]:top-2 has-[+div>input:not(:placeholder-shown)]:text-[10px] has-[+div>input:not(:placeholder-shown)]:font-bold has-[+div>input:not(:placeholder-shown)]:text-navy
            ${Icon ? "left-12" : "left-4"}`}
        >
          <span className="inline-flex bg-white px-1.5">{label}</span>
        </label>
        <div className="auth-input-shell" style={{ position: "relative" }}>
          {Icon ? <Icon className="auth-input-icon" /> : null}
          <input
            id={inputId}
            placeholder=" "
            type={showPassword ? "text" : "password"}
            className={`auth-input ${Icon ? "auth-input-with-icon" : ""}`}
            style={{ paddingRight: "48px" }}
            {...props}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: "12px",
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              color: "#94a3b8",
              padding: "0 8px",
              zIndex: 5,
            }}
          >
            {showPassword ? (
              <EyeSlashIcon style={{ width: "20px", height: "20px" }} />
            ) : (
              <EyeIcon style={{ width: "20px", height: "20px" }} />
            )}
          </button>
        </div>
      </MotionDiv>
      {showForgotPasswordLink && (
        <button
          type="button"
          className="auth-toggle-btn mt-2 text-right w-full"
          style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px", color: "#0f172a" }}
          onClick={onForgotPasswordClick}
        >
          Forgot Password?
        </button>
      )}
    </div>
  );
};

const AuthPage = () => {
  const navigate = useNavigate();
  const scrollToTop = useScrollToTop();
  const location = useLocation();
  const { login } = useAuth();
  const fromState = location.state?.from;
  const redirectTo = useMemo(() => {
    if (!fromState) {
      return new URLSearchParams(location.search).get("redirect") || "/dashboard";
    }
    if (typeof fromState === "string") {
      return fromState;
    }
    return (fromState.pathname || "/dashboard") + (fromState.search || "") + (fromState.hash || "");
  }, [fromState, location.search]);

  const [mode, setMode] = useState("login");
  const [step, setStep] = useState("credentials");
  const [form, setForm] = useState(AUTH_FORM);
  const [otpCode, setOtpCode] = useState("");
  const [otpState, setOtpState] = useState(null);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [otpExpiryCountdown, setOtpExpiryCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [widgetReady, setWidgetReady] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const onChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
    // Setup MSG91 OTP Widget configuration
    window.configuration = {
      widgetId: "366665654b6e353536353634",
      tokenAuth: "522920Tfroc6Ag56a22618dP1",
      exposeMethods: true,
      exposedMethod: true,
      container: "otp-container",
      success: (data) => {
        console.log("MSG91 widget verified successfully on frontend:", data);
      },
      failure: (error) => {
        console.error("MSG91 widget failed on frontend:", error);
      }
    };

    const existingScript = document.getElementById("msg91-otp-script");
    if (existingScript) {
      if (typeof window.initSendOTP === "function") {
        try {
          window.initSendOTP(window.configuration);
          setWidgetReady(true);
          console.log("MSG91 widget re-initialized from existing script.");
        } catch (e) {
          console.error("Error re-calling initSendOTP:", e);
        }
      } else {
        const handleLoad = () => {
          if (typeof window.initSendOTP === "function") {
            try {
              window.initSendOTP(window.configuration);
              setWidgetReady(true);
              console.log("MSG91 widget initialized after existing script load event.");
            } catch (e) {
              console.error("Error calling initSendOTP after load:", e);
            }
          }
        };
        existingScript.addEventListener("load", handleLoad);
        return () => {
          existingScript.removeEventListener("load", handleLoad);
        };
      }
      return () => {};
    }

    let scriptLoaded = false;
    const urls = [
      "https://verify.msg91.com/otp-provider.js",
      "https://verify.phone91.com/otp-provider.js"
    ];

    let index = 0;
    const attemptLoad = () => {
      if (scriptLoaded) return;
      
      const s = document.createElement("script");
      s.src = urls[index];
      s.async = true;
      s.id = "msg91-otp-script";
      
      s.onload = () => {
        scriptLoaded = true;
        if (typeof window.initSendOTP === "function") {
          try {
            window.initSendOTP(window.configuration);
            setWidgetReady(true);
            console.log("MSG91 widget script loaded and initialized successfully.");
          } catch (e) {
            console.error("Error calling initSendOTP:", e);
          }
        }
      };

      s.onerror = () => {
        index++;
        if (index < urls.length) {
          attemptLoad();
        } else {
          console.warn("Failed to load MSG91 SendOTP scripts. Falling back to backend OTP handling.");
        }
      };

      document.head.appendChild(s);
    };

    attemptLoad();

    return () => {};
  }, []);

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
    setNewPassword("");
    setConfirmNewPassword("");
    setOtpState(null);
    setResendCountdown(0);
    setOtpExpiryCountdown(0);
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setConfirmPassword("");
    setConfirmNewPassword("");
    resetOtpFlow();
  };

  const submit = async (event) => {
    event.preventDefault();

    // ΓöÇΓöÇ Hard guard: login mode NEVER shows OTP. If step is somehow "otp" from
    //    a stale signup session, reset it and re-submit as a normal login.
    if (mode === "login" && (step === "otp" || step === "forgot_otp")) {
      resetOtpFlow();
      setLoading(false);
      return;
    }

    // Validation for login mode
    if (mode === "login" && !form.phone) {
      toast.error("Please enter your WhatsApp mobile number");
      return;
    }

    // Confirm password validation for signup
    if (mode === "signup" && step === "credentials" && form.password !== confirmPassword) {
      toast.error("Passwords do not match. Please re-enter your confirm password.");
      return;
    }

    if (mode === "forgot_password" && !form.email && !form.phone) {
      toast.error("Please enter your email address or mobile number to reset password");
      return;
    }

    setLoading(true);

    try {
      if (step === "forgot_otp") {
        if (!otpState?.challengeId) {
          toast.error("OTP session expired or invalid. Please start again.");
          setLoading(false);
          return;
        }
        if (!newPassword || newPassword.length < 6) {
          toast.error("Password must be at least 6 characters long.");
          setLoading(false);
          return;
        }
        if (newPassword !== confirmNewPassword) {
          toast.error("Passwords do not match. Please re-enter confirm password.");
          setLoading(false);
          return;
        }
        console.log("[OTP] Resetting password via backend...");
        const res = await resetPassword({
          challengeId: otpState.challengeId,
          otp: otpCode.trim(),
          newPassword: newPassword.trim(),
        });
        console.log("[OTP] resetPassword success:", res);
        toast.success(res?.message || "Password updated successfully.");
        setMode("login");
        setStep("credentials");
        setOtpCode("");
        setNewPassword("");
        setOtpState(null);
        setLoading(false);
        return;
      }

      // ΓöÇΓöÇ Signup OTP verify step ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
      if (step === "otp" && mode === "signup") {
        // ΓöÇΓöÇ MSG91 Widget OTP verify path ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
        if (otpState?.provider === "msg91_widget" && typeof window.verifyOtp === "function") {
          console.log("[OTP] Using MSG91 widget verifyOtp for code:", otpCode.trim());
          window.verifyOtp(
            otpCode.trim(),
            async (token) => {
              console.log("[OTP] MSG91 widget verifyOtp success, access-token received:", token);
              try {
                const data = await verifyWidgetToken({
                  token,
                  name: form.name,
                  email: form.email,
                  phone: form.phone,
                  address: form.address,
                  password: form.password,
                  role: form.role,
                  mode: "signup",
                });
                console.log("[OTP] verifyWidgetToken success:", data);
                login(data);
                toast.success("Account verified successfully");
                scrollToTop();
                navigate(redirectTo);
              } catch (err) {
                const msg = err?.response?.data?.message || err?.message || "Server verification failed.";
                console.error("[OTP] verifyWidgetToken error:", msg, err?.response?.data);
                toast.error(msg);
                setLoading(false);
              }
            },
            (err) => {
              const msg = err?.message || "Incorrect OTP. Please try again.";
              console.error("[OTP] MSG91 widget verifyOtp failure:", err);
              toast.error(msg);
              setLoading(false);
            }
          );
          return;
        }

        // ΓöÇΓöÇ Backend OTP verify path (challenge-based) ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
        if (!otpState?.challengeId) {
          toast.error("OTP session expired or invalid. Please start again.");
          setLoading(false);
          return;
        }

        console.log("[OTP] Verifying OTP via backend. challengeId:", otpState?.challengeId);
        const data = await verifyOtpApi({
          challengeId: otpState.challengeId,
          otp: otpCode.trim(),
        });
        console.log("[OTP] Backend verifyOtp success:", data);

        login(data);
        toast.success("Account verified successfully");
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

        if (mode === "signup") {
          // ΓöÇΓöÇ Always use backend WhatsApp OTP for signup ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
          // The MSG91 widget sends SMS/Voice ΓÇö NOT WhatsApp.
          // Our backend calls MSG91's WhatsApp outbound API directly.
          console.log("[signup] Sending OTP via backend WhatsApp API...");
          try {
            const challenge = await signupUser(payload);
            console.log("[signup] OTP challenge response:", challenge);
            setOtpState(challenge);
            setOtpCode("");
            setStep("otp");
            setResendCountdown(challenge?.resendAvailableInSeconds || 0);
            setOtpExpiryCountdown(challenge?.expiresInSeconds || 0);
            toast.success(challenge?.message || "OTP sent to your WhatsApp number.");
            setLoading(false);
          } catch (backendErr) {
            const msg = backendErr?.response?.data?.message || backendErr?.message || "Failed to send OTP";
            console.error("[signup] OTP send failed:", msg, backendErr?.response?.data);
            toast.error(msg);
            setLoading(false);
          }
        } else if (mode === "forgot_password") {
          // ΓöÇΓöÇ Forgot password path ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
          console.log("[OTP] Sending forgot password request to backend...");
          try {
            const res = await forgotPassword({
              email: form.email || undefined,
              phone: form.phone || undefined,
            });
            console.log("[OTP] forgotPassword response:", res);
            setOtpState(res);
            setOtpCode("");
            setStep("forgot_otp");
            setResendCountdown(res?.resendAvailableInSeconds || 0);
            setOtpExpiryCountdown(res?.expiresInSeconds || 0);
            toast.success(res?.message || "OTP sent successfully. Check your device.");
          } catch (err) {
            const msg = err?.response?.data?.message || err?.message || "Failed to send reset OTP";
            toast.error(msg);
          } finally {
            setLoading(false);
          }
        } else {
          // ΓöÇΓöÇ Login path ΓÇö ALWAYS direct, NO OTP ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
          console.log("[login] Sending login request to backend...");
          const data = await loginUser(payload);
          console.log("[login] loginUser response:", data);
          if (data?.token) {
            login(data);
            toast.success("Welcome back");
            scrollToTop();
            navigate(redirectTo);
          } else {
            console.warn("[login] Unexpected loginUser response shape:", data);
            toast.error("Unexpected response from server. Please try again.");
            setLoading(false);
          }
        }
      }
    } catch (error) {
      let msg = error?.response?.data?.message;
      if (!msg || typeof msg !== "string" || msg.includes("<html") || msg.includes("502 Bad Gateway")) {
        if (error?.response?.status === 502 || error?.response?.status === 503) {
          msg = "Server is temporarily unavailable (502 Bad Gateway). Please ensure the backend service is running.";
        } else {
          msg = (typeof error?.response?.data?.message === "string" ? error.response.data.message : null) || error?.message || "Authentication failed";
        }
      }
      console.error("[OTP] submit() caught error:", msg, error?.response?.data || "");
      toast.error(msg);
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!otpState?.challengeId || resendCountdown > 0) return;

    setLoading(true);
    try {
      if (otpState?.provider === "msg91_widget" && window.retryOtp) {
        window.retryOtp(
          undefined,
          (res) => {
            setOtpCode("");
            setResendCountdown(45);
            setOtpExpiryCountdown(300);
            toast.success("A fresh OTP has been sent.");
            setLoading(false);
          },
          (err) => {
            toast.error(err?.message || "Unable to resend OTP via widget");
            setLoading(false);
          }
        );
        return;
      }

      console.log("[OTP] Resending OTP for challengeId:", otpState?.challengeId);
      const refreshedChallenge = await resendOtp({ challengeId: otpState.challengeId });
      console.log("[OTP] resendOtp response:", refreshedChallenge);
      setOtpState(refreshedChallenge);
      setOtpCode("");
      setResendCountdown(refreshedChallenge?.resendAvailableInSeconds || 0);
      setOtpExpiryCountdown(refreshedChallenge?.expiresInSeconds || 0);
      toast.success(refreshedChallenge?.message || "A new OTP has been sent");
    } catch (error) {
      const msg = error?.response?.data?.message || error?.message || "Unable to resend OTP";
      console.error("[OTP] resendOtp error:", msg, error?.response?.data || "");
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const isSignup = mode === "signup";
  const isForgot = mode === "forgot_password";
  // "otp" step is ONLY valid for signup; login is always direct (no OTP)
  const isOtpStep = step === "forgot_otp" || (step === "otp" && mode === "signup");
  const submitDisabled = loading;

  const headingText = step === "forgot_otp"
    ? "Reset your password"
    : (step === "otp" && mode === "signup")
      ? (otpState?.channel === "whatsapp" ? "Verify your WhatsApp number" : "Verify your email address")
      : isForgot
        ? "Forgot password?"
        : isSignup
          ? "Sign Up for Requesting & Posting"
          : "Sign In for Requesting & Posting";

  const subText = step === "forgot_otp"
    ? `Enter the one-time password sent to your registered WhatsApp number and choose a new password.`
    : (step === "otp" && mode === "signup")
      ? `Enter the one-time password sent to ${otpState?.destination || "your registered WhatsApp number"}.`
      : isForgot
        ? "Enter your registered email address or WhatsApp number. We'll send an OTP to your registered WhatsApp number to reset your password."
        : isSignup
          ? "Create a free account to submit property requirements, request loans & services, and post free property listings."
          : "Sign in to manage your property requests, post free property listings, and connect with genuine buyers and owners.";

  const statusText = isForgot ? "Recovery mode" : isSignup ? "New account" : "Secure access";

  return (
    <>
      <style>{`
        .auth-centered-page {
          min-height: calc(100vh - 130px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 16px 60px;
          background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
          position: relative;
          overflow: hidden;
          font-family: 'Inter', sans-serif;
        }
        .auth-bg-glow {
          position: absolute;
          border-radius: 9999px;
          filter: blur(90px);
          pointer-events: none;
          z-index: 1;
        }
        .auth-bg-glow-1 {
          width: 420px;
          height: 420px;
          background: rgba(0, 66, 162, 0.07);
          top: -60px;
          left: 15%;
        }
        .auth-bg-glow-2 {
          width: 380px;
          height: 380px;
          background: rgba(255, 153, 20, 0.08);
          bottom: -40px;
          right: 15%;
        }
        .auth-container {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 480px;
          margin: 0 auto;
        }
        .auth-card {
          width: 100%;
        }
        .auth-card-signup {
          max-width: 520px;
          margin: 0 auto;
        }
        .auth-card-surface {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 28px;
          padding: 32px 36px 36px;
          box-shadow: 0 20px 50px -10px rgba(0, 66, 162, 0.1), 0 0 1px 1px rgba(0, 0, 0, 0.02);
        }
        @media (max-width: 640px) {
          .auth-centered-page {
            padding: 20px 12px 40px;
            min-height: auto;
          }
          .auth-card-surface {
            padding: 24px 20px 28px;
            border-radius: 24px;
          }
        }

        .auth-brand-logo {
          height: 36px;
          max-width: 160px;
          object-fit: contain;
          margin: 0 auto;
        }

        .auth-mode-switch {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 6px;
          padding: 5px;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          background: #f1f5f9;
          margin-bottom: 22px;
        }
        .auth-mode-btn {
          border: none;
          border-radius: 12px;
          background: transparent;
          color: #475569;
          font-size: 14px;
          font-weight: 800;
          padding: 10px 16px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-align: center;
        }
        .auth-mode-btn.is-active {
          background: #0042a2;
          color: #ffffff;
          box-shadow: 0 4px 14px rgba(0, 66, 162, 0.22);
        }

        .auth-heading-wrap {
          margin-bottom: 22px;
        }
        .auth-highlight-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #fff7ed;
          border: 1px solid #fed7aa;
          color: #ea580c;
          border-radius: 9999px;
          padding: 4px 12px;
          font-size: 11px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          margin-bottom: 10px;
          box-shadow: 0 2px 6px rgba(234, 88, 12, 0.06);
        }
        .auth-title {
          margin: 0;
          font-size: clamp(24px, 2.6vw, 32px);
          line-height: 1.2;
          font-weight: 900;
          color: #0042a2;
          letter-spacing: -0.8px;
        }
        .auth-title-highlight {
          color: #ff9914;
          background: linear-gradient(135deg, #ff9914 0%, #ea580c 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          display: inline;
        }
        .auth-subtitle {
          margin: 8px auto 0;
          font-size: 13.5px;
          line-height: 1.55;
          color: #64748b;
          max-width: 390px;
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
          border-color: #0042a2;
          box-shadow: 0 0 0 3px rgba(0, 66, 162, 0.1);
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
          -webkit-appearance: none;
          -moz-appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='2.2' stroke='%230042a2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5' /%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 16px center;
          background-size: 18px;
          padding-right: 46px;
        }

        .auth-free-badge {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 12px 14px;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          background: #fafafa;
          color: #475569;
          font-size: 12.5px;
          line-height: 1.5;
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
          min-height: 52px;
          border: none;
          border-radius: 12px;
          background: #f79e26;
          color: #ffffff;
          font-size: 15.5px;
          font-weight: 800;
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
          min-height: 44px;
          padding: 0 16px;
          font-size: 13.5px;
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
          padding: 12px 14px;
          border-radius: 14px;
          border: 1px solid #cbd5e1;
          background: #f8fafc;
          color: #475569;
          font-size: 12.5px;
          line-height: 1.5;
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
          color: #0042a2;
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
          color: #ff9914;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
        }
        .auth-toggle-btn:hover {
          text-decoration: underline;
          color: #ea580c;
        }
        .auth-security-note {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 22px;
          padding-top: 16px;
          border-top: 1px solid #f1f5f9;
          color: #64748b;
          font-size: 11.5px;
          line-height: 1.5;
          text-align: center;
        }
        .auth-security-icon {
          width: 15px;
          height: 15px;
          color: #0042a2;
          flex-shrink: 0;
        }

        @media (max-width: 640px) {
          .auth-centered-page {
            padding: 16px 12px 32px;
            min-height: auto;
          }
          .auth-card-surface {
            padding: 24px 18px 24px;
            border-radius: 20px;
          }
          .auth-brand-logo {
            height: 32px;
          }
          .auth-mode-switch {
            margin-bottom: 18px;
          }
          .auth-heading-wrap {
            margin-bottom: 18px;
          }
          .auth-title {
            font-size: clamp(20px, 5.5vw, 26px);
          }
          .auth-subtitle {
            font-size: 12.5px;
          }
          .auth-mode-btn {
            padding: 9px 10px;
            font-size: 13px;
          }
          .auth-submit {
            min-height: 48px;
            font-size: 15px;
          }
          .auth-support-row {
            flex-direction: column;
            align-items: center;
            text-align: center;
            gap: 8px;
          }
          .auth-support-actions {
            width: 100%;
            justify-content: center;
          }
        }

        @media (max-width: 380px) {
          .auth-centered-page {
            padding: 10px 8px 20px;
          }
          .auth-card-surface {
            padding: 18px 12px 20px;
            border-radius: 16px;
          }
          .auth-mode-btn {
            font-size: 12px;
            padding: 8px 6px;
          }
          .auth-input-shell {
            min-height: 46px;
          }
          .auth-input {
            font-size: 14px;
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

      <div className="auth-centered-page">
        <div className="auth-bg-glow auth-bg-glow-1" />
        <div className="auth-bg-glow auth-bg-glow-2" />

        <div className="auth-container">
          <motion.div className={`auth-card ${isSignup ? "auth-card-signup" : ""}`} initial="hidden" animate="show" variants={fade}>
            <div className="auth-card-surface">
              <div className="auth-card-header text-center mb-5">
                <BrandLogo className="auth-brand-logo mx-auto" />
                <p className="mt-1.5 text-[11px] font-semibold text-slate-400">
                  Powered by <span className="font-bold text-navy">Gyes Property &amp; Construction</span>
                </p>
              </div>

              {!isOtpStep && !isForgot && (
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
                    Sign Up
                  </button>
                </div>
              )}

              <AnimatePresence mode="wait">
                <motion.div key={mode} variants={fade} initial="hidden" animate="show" exit="exit">
                  <div className="auth-heading-wrap text-center">
                    {!isOtpStep && !isForgot && (
                      <div className="auth-highlight-pill mx-auto">
                        <SparklesIcon className="h-3.5 w-3.5 text-orange shrink-0" />
                        <span>Property Requests &amp; Free Posting</span>
                      </div>
                    )}
                    <h1 className="auth-title">
                      {isForgot || isOtpStep ? (
                        headingText
                      ) : isSignup ? (
                        <>
                          Sign Up for <span className="auth-title-highlight">Requesting &amp; Posting</span>
                        </>
                      ) : (
                        <>
                          Sign In for <span className="auth-title-highlight">Requesting &amp; Posting</span>
                        </>
                      )}
                    </h1>
                    <p className="auth-subtitle mx-auto">{subText}</p>
                  </div>

                  <form onSubmit={submit} noValidate>
                    <motion.div className="auth-fields" variants={stagger} initial="hidden" animate="show">
                      {step === "forgot_otp" ? (
                        <>
                           <MotionDiv variants={item} className="auth-field-wrap">
                             <label className="auth-label">One-Time Password</label>
                             <div className="flex justify-center py-2">
                               <AnimatedOTPInput
                                 value={otpCode}
                                 onChange={setOtpCode}
                               />
                             </div>
                           </MotionDiv>

                          <PasswordField
                            label="New Password"
                            icon={LockClosedIcon}
                            placeholder=" "
                            value={newPassword}
                            onChange={(event) => setNewPassword(event.target.value)}
                            required
                          />

                          <PasswordField
                            label="Confirm New Password"
                            icon={LockClosedIcon}
                            placeholder=" "
                            value={confirmNewPassword}
                            onChange={(event) => setConfirmNewPassword(event.target.value)}
                            required
                          />

                          <motion.div variants={item} className="auth-otp-note">
                            <ShieldCheckIcon className="auth-free-badge-icon" />
                            <span>
                              OTP expires in <strong>{Math.max(0, otpExpiryCountdown)} seconds</strong>.
                              {otpState?.developmentOtp ? (
                                <>
                                  {" "}
                                  Dev OTP: <code>{otpState.developmentOtp}</code>
                                </>
                              ) : null}
                            </span>
                          </motion.div>
                        </>
                      ) : step === "otp" ? (
                        <>
                           <MotionDiv variants={item} className="auth-field-wrap">
                             <label className="auth-label">One-Time Password</label>
                             <div className="flex justify-center py-2">
                               <AnimatedOTPInput
                                 value={otpCode}
                                 onChange={setOtpCode}
                               />
                             </div>
                           </MotionDiv>

                          <motion.div variants={item} className="auth-otp-note">
                            <ShieldCheckIcon className="auth-free-badge-icon" />
                            <span>
                              OTP expires in <strong>{Math.max(0, otpExpiryCountdown)} seconds</strong>.
                              {!isSignup ? " This keeps your account sign-in protected." : (otpState?.channel === "whatsapp" ? " WeΓÇÖll activate your account right after WhatsApp verification." : " WeΓÇÖll activate your account right after email verification.")}
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
                              placeholder=" "
                              value={form.name}
                              onChange={(event) => onChange("name", event.target.value)}
                              required
                            />
                          ) : null}

                          {/* Email shown for both signup (optional) and login */}
                          <Field
                            label="Email Address (Optional)"
                            icon={EnvelopeIcon}
                            type="email"
                            autoComplete="email"
                            placeholder=" "
                            value={form.email}
                            onChange={(event) => onChange("email", event.target.value)}
                          />

                          <Field
                            label="WhatsApp Mobile Number"
                            icon={PhoneIcon}
                            type="tel"
                            inputMode="tel"
                            autoComplete="tel"
                            placeholder=" "
                            value={form.phone}
                            onChange={(event) => onChange("phone", event.target.value)}
                            required
                          />

                          {!isForgot && (
                            <PasswordField
                              label="Password"
                              icon={LockClosedIcon}
                              autoComplete={isSignup ? "new-password" : "current-password"}
                              placeholder=" "
                              value={form.password}
                              onChange={(event) => onChange("password", event.target.value)}
                              required
                              showForgotPasswordLink={mode === "login"}
                              onForgotPasswordClick={() => switchMode("forgot_password")}
                            />
                          )}

                          {isSignup && (
                            <PasswordField
                              label="Confirm Password"
                              icon={LockClosedIcon}
                              autoComplete="new-password"
                              placeholder=" "
                              value={confirmPassword}
                              onChange={(event) => setConfirmPassword(event.target.value)}
                              required
                            />
                          )}

                          {isSignup ? (
                            <motion.div variants={item} className="auth-free-badge">
                              <ShieldCheckIcon className="auth-free-badge-icon" />
                              <span>
                                New accounts include <strong>verified property posting access</strong>.
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
                            : step === "forgot_otp"
                              ? "Reset Password"
                              : isOtpStep
                                ? "Verify & Continue"
                                : isForgot
                                  ? "Send OTP"
                                  : isSignup
                                    ? "Send OTP"
                                    : "Sign In"}
                        </button>
                      </motion.div>
                    </motion.div>

                    <div className="auth-support-row">
                      <div className="auth-support-copy">
                        {isOtpStep ? (
                          <span>
                            Sending to <strong>{otpState?.destination || "your email address"}</strong>
                          </span>
                        ) : isForgot ? (
                          <span>
                            Remember password? <strong>Sign in to continue.</strong>
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
                              if (isForgot) {
                                switchMode("login");
                              } else {
                                switchMode(isSignup ? "login" : "signup");
                              }
                            }}
                          >
                            {isForgot ? "Back to Sign In" : isSignup ? "Back to Sign In" : "Create Account"}
                          </button>
                        )}
                      </div>
                    </div>
                  </form>

                  <div className="auth-security-note">
                    <ShieldCheckIcon className="auth-security-icon" />
                    {isOtpStep
                      ? "Your one-time password is short-lived and securely verified before access is granted."
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
