import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheckIcon, EnvelopeIcon, LockClosedIcon, PhoneIcon, MapPinIcon, UserIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import { loginUser, requestOtp, signupUser, socialLogin, verifyOtp } from "../services/api/authApi";
import useAuth from "../hooks/useAuth";
import { loadExternalScript } from "../utils/loadExternalScript";

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
  <motion.div variants={item} className="auth-field-wrap">
    <label className="auth-label">{label}</label>
    <div className="auth-input-shell">
      {Icon ? <Icon className="auth-input-icon" /> : null}
      <input className={`auth-input ${Icon ? "auth-input-with-icon" : ""}`} {...props} />
    </div>
  </motion.div>
);

const SelectField = ({ label, icon: Icon, children, ...props }) => (
  <motion.div variants={item} className="auth-field-wrap">
    <label className="auth-label">{label}</label>
    <div className="auth-input-shell">
      {Icon ? <Icon className="auth-input-icon" /> : null}
      <select className={`auth-input auth-select ${Icon ? "auth-input-with-icon" : ""}`} {...props}>
        {children}
      </select>
    </div>
  </motion.div>
);

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const redirectTo = location.state?.from?.pathname || "/dashboard";

  const [mode, setMode] = useState("login");
  const [useOtp, setUseOtp] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    role: "buyer",
    otp: "",
  });
  const [loading, setLoading] = useState(false);

  const googleBtnRef = useRef(null);
  const googleInitRef = useRef(false);

  const onChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId || googleInitRef.current) return;

    loadExternalScript("https://accounts.google.com/gsi/client").then((ok) => {
      if (!ok || !window.google?.accounts?.id || googleInitRef.current) return;

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async ({ credential }) => {
          if (!credential) {
            toast.error("Google sign-in failed");
            return;
          }

          try {
            const data = await socialLogin({ provider: "google", token: credential });
            login(data);
            toast.success("Signed in with Google");
            navigate(redirectTo);
          } catch (error) {
            toast.error(error.response?.data?.message || "Google sign-in failed");
          }
        },
      });

      if (googleBtnRef.current) {
        googleBtnRef.current.innerHTML = "";
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "signin_with",
          shape: "pill",
          width: Math.min(420, googleBtnRef.current.offsetWidth || 320),
        });
      }

      googleInitRef.current = true;
    });
  }, [login, navigate, redirectTo]);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      if (useOtp) {
        if (!form.otp) {
          await requestOtp({ email: form.email });
          toast.success("OTP sent. Demo code: 123456");
          setLoading(false);
          return;
        }

        const data = await verifyOtp({ email: form.email, otp: form.otp });
        login(data);
        navigate(redirectTo);
        return;
      }

      const data = mode === "signup" ? await signupUser(form) : await loginUser(form);
      login(data);
      toast.success(mode === "signup" ? "Account created successfully" : "Welcome back");
      navigate(redirectTo);
    } catch (error) {
      toast.error(error.response?.data?.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const isSignup = mode === "signup";
  const headingText = isSignup ? "Create your account" : "Welcome back";
  const subText = isSignup
    ? "Create a simple profile to browse listings, connect with sellers, and manage your property activity."
    : "Sign in to access saved listings, leads, and account activity in one place.";
  const statusText = useOtp ? "OTP sign in" : isSignup ? "New account" : "Secure access";

  return (
    <>
      <style>{`
        .auth-page {
          min-height: 100%;
          display: grid;
          grid-template-columns: minmax(0, 1.02fr) minmax(0, 0.98fr);
          background: #f8fafc;
          font-family: 'Manrope', sans-serif;
        }
        @media (max-width: 900px) {
          .auth-page {
            grid-template-columns: 1fr;
            min-height: 100%;
          }
          .auth-left {
            display: none !important;
          }
        }

        .auth-left {
          position: relative;
          overflow: hidden;
          background: linear-gradient(180deg, #1d4ed8 0%, #1e40af 52%, #1e3a8a 100%);
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 56px 56px 56px;
        }
        .auth-left-img {
          position: absolute;
          inset: 0;
          object-fit: cover;
          width: 100%;
          height: 100%;
          opacity: 0.12;
        }
        .auth-left-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(15, 23, 42, 0.24) 0%, rgba(15, 23, 42, 0.88) 100%);
        }
        .auth-left-content {
          position: relative;
          z-index: 1;
          max-width: 520px;
          margin-top: -96px;
        }
        .auth-left-logo {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.04);
          color: rgba(255, 255, 255, 0.82);
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-bottom: 28px;
        }
        .auth-left-logo span {
          color: #bfdbfe;
        }
        .auth-left-heading {
          margin: 0 0 14px;
          font-size: clamp(30px, 4vw, 52px);
          font-weight: 800;
          color: #ffffff;
          line-height: 1.08;
          letter-spacing: -1.2px;
          max-width: 440px;
        }
        .auth-left-sub {
          margin: 0;
          max-width: 390px;
          font-size: 15px;
          line-height: 1.75;
          color: rgba(226, 232, 240, 0.68);
        }
        .auth-stats {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
          margin-top: 34px;
          max-width: 460px;
        }
        @media (max-height: 820px) {
          .auth-left {
            padding-top: 40px;
          }
          .auth-left-content {
            margin-top: -150px;
          }
        }
        .auth-stat-item {
          padding: 14px 0;
          border-top: 1px solid rgba(255, 255, 255, 0.14);
        }
        .auth-stat-num {
          font-size: 26px;
          line-height: 1;
          font-weight: 700;
          color: #ffffff;
        }
        .auth-stat-label {
          margin-top: 8px;
          font-size: 11px;
          font-weight: 600;
          color: rgba(226, 232, 240, 0.56);
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .auth-right {
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 24px 28px 40px;
          overflow-y: auto;
          background: #f8fafc;
        }
        .auth-card {
          width: 100%;
          max-width: 500px;
        }
        .auth-card-signup {
          margin-top: -8px;
        }
        .auth-card-surface {
          padding: 26px 32px 32px;
          border: 1px solid #e2e8f0;
          border-radius: 24px;
          background: #ffffff;
          box-shadow: 0 18px 45px rgba(15, 23, 42, 0.06);
        }
        @media (min-width: 1024px) {
          .auth-card-surface {
            padding: 36px;
          }
        }
        @media (max-width: 900px) {
          .auth-right {
            padding: 18px 18px 32px;
          }
          .auth-card-surface {
            padding: 20px 22px 22px;
            border-radius: 22px;
          }
          .auth-card-signup {
            margin-top: 0;
          }
        }

        .auth-brand-mobile {
          display: none;
          margin-bottom: 18px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #0f172a;
        }
        .auth-brand-mobile span {
          color: #475569;
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
          gap: 6px;
          padding: 0;
          border-radius: 999px;
          background: transparent;
          color: #64748b;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1.2px;
          text-transform: uppercase;
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
          background: #f8fafc;
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
          color: #0f172a;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.08);
        }

        .auth-heading-wrap {
          margin-bottom: 18px;
        }
        .auth-title {
          margin: 0;
          font-size: clamp(30px, 3vw, 38px);
          line-height: 1.1;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.9px;
        }
        .auth-subtitle {
          margin: 12px 0 0;
          font-size: 15px;
          line-height: 1.65;
          color: #64748b;
          max-width: 420px;
        }

        .auth-google-wrap {
          margin-bottom: 8px;
        }
        .auth-google-wrap > div {
          width: 100%;
          overflow: hidden;
          border-radius: 999px;
        }
        .auth-divider {
          display: flex;
          align-items: center;
          gap: 14px;
          margin: 20px 0 22px;
        }
        .auth-divider-line {
          flex: 1;
          height: 1px;
          background: #e2e8f0;
        }
        .auth-divider-text {
          font-size: 12px;
          font-weight: 600;
          color: #94a3b8;
        }

        .auth-fields {
          display: flex;
          flex-direction: column;
          gap: 16px;
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
          min-height: 56px;
          border: 1px solid #dbe0e6;
          border-radius: 14px;
          background: #ffffff;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .auth-input-shell:focus-within {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
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
          min-height: 56px;
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
          background: #f8fafc;
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
          min-height: 58px;
          border: none;
          border-radius: 16px;
          background: #2563eb;
          color: #ffffff;
          font-size: 16px;
          font-weight: 700;
          font-family: inherit;
          letter-spacing: 0.2px;
          cursor: pointer;
          transition: background 0.18s ease, opacity 0.18s ease;
        }
        .auth-submit:hover:not(:disabled) {
          background: #1d4ed8;
        }
        .auth-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
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
          color: #2563eb;
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
          color: #2563eb;
          flex-shrink: 0;
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
        <div className="auth-left">
          <img
            className="auth-left-img"
            src="https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=1200&q=80"
            alt="Modern buildings in Hosur"
          />
          <div className="auth-left-overlay" />

          <div className="auth-left-content">
            <div className="auth-left-logo">
              <ShieldCheckIcon className="auth-badge-icon" />
              My<span>Hosur</span>Property
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
            <div className="auth-brand-mobile">My<span>Hosur</span>Property</div>

            <div className="auth-card-surface">
              <div className="auth-topbar">
                <div className="auth-badge">
                  <ShieldCheckIcon className="auth-badge-icon" />
                  MyHosurProperty
                </div>
                <div className="auth-status">{statusText}</div>
              </div>

              <div className="auth-mode-switch">
                <button
                  type="button"
                  className={`auth-mode-btn ${!isSignup ? "is-active" : ""}`}
                  onClick={() => {
                    setMode("login");
                    setUseOtp(false);
                  }}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  className={`auth-mode-btn ${isSignup ? "is-active" : ""}`}
                  onClick={() => {
                    setMode("signup");
                    setUseOtp(false);
                  }}
                >
                  Create Account
                </button>
              </div>

              <AnimatePresence mode="wait">
                <motion.div key={`${mode}-${useOtp}`} variants={fade} initial="hidden" animate="show" exit="exit">
                  <div className="auth-heading-wrap">
                    <h1 className="auth-title">{headingText}</h1>
                    <p className="auth-subtitle">{subText}</p>
                  </div>

                  <div className="auth-google-wrap">
                    <div ref={googleBtnRef} />
                  </div>

                  <div className="auth-divider">
                    <div className="auth-divider-line" />
                    <span className="auth-divider-text">or continue with email</span>
                    <div className="auth-divider-line" />
                  </div>

                  <form onSubmit={submit}>
                    <motion.div className="auth-fields" variants={stagger} initial="hidden" animate="show">
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
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={(event) => onChange("email", event.target.value)}
                        required
                      />

                      {isSignup ? (
                        <Field
                          label="Phone Number"
                          icon={PhoneIcon}
                          type="tel"
                          placeholder="+91 98765 43210"
                          value={form.phone}
                          onChange={(event) => onChange("phone", event.target.value)}
                        />
                      ) : null}

                      {isSignup ? (
                        <Field
                          label="Address"
                          icon={MapPinIcon}
                          placeholder="Hosur, Tamil Nadu"
                          value={form.address}
                          onChange={(event) => onChange("address", event.target.value)}
                        />
                      ) : null}

                      {!useOtp ? (
                        <Field
                          label="Password"
                          icon={LockClosedIcon}
                          type="password"
                          placeholder="Enter your password"
                          value={form.password}
                          onChange={(event) => onChange("password", event.target.value)}
                          required
                        />
                      ) : null}

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

                      {useOtp ? (
                        <Field
                          label="OTP Code"
                          icon={ShieldCheckIcon}
                          placeholder="Enter the 6-digit OTP"
                          value={form.otp}
                          onChange={(event) => onChange("otp", event.target.value)}
                        />
                      ) : null}

                      {isSignup ? (
                        <motion.div variants={item} className="auth-free-badge">
                          <ShieldCheckIcon className="auth-free-badge-icon" />
                          <span>
                            New accounts include <strong>1 free property listing</strong> for 30 days.
                          </span>
                        </motion.div>
                      ) : null}

                      <motion.div variants={item}>
                        <button type="submit" className="auth-submit" disabled={loading}>
                          {loading ? <span className="auth-spinner" /> : null}
                          {loading ? "Please wait..." : useOtp ? (form.otp ? "Verify OTP" : "Send OTP") : isSignup ? "Create Account" : "Sign In"}
                        </button>
                      </motion.div>
                    </motion.div>

                    <div className="auth-support-row">
                      <div className="auth-support-copy">
                        {isSignup ? (
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
                        <button
                          type="button"
                          className="auth-toggle-btn"
                          onClick={() => {
                            setMode((currentMode) => (currentMode === "login" ? "signup" : "login"));
                            setUseOtp(false);
                          }}
                        >
                          {isSignup ? "Back to Sign In" : "Create Account"}
                        </button>
                        <button type="button" className="auth-toggle-btn" onClick={() => setUseOtp((currentValue) => !currentValue)}>
                          {useOtp ? "Use Password Instead" : "Sign In with OTP"}
                        </button>
                      </div>
                    </div>
                  </form>

                  <div className="auth-security-note">
                    <ShieldCheckIcon className="auth-security-icon" />
                    Secure sign-in for saved listings, leads, and account activity.
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
