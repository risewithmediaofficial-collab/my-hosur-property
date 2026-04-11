import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { loginUser, requestOtp, signupUser, socialLogin, verifyOtp } from "../services/api/authApi";
import useAuth from "../hooks/useAuth";
import { loadExternalScript } from "../utils/loadExternalScript";

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const redirectTo = location.state?.from?.pathname || "/dashboard";
  const [mode, setMode] = useState("login");
  const [useOtp, setUseOtp] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", role: "buyer", canPostProperty: false, otp: "" });
  const googleButtonRef = useRef(null);
  const googleInitializedRef = useRef(false);
  const facebookInitializedRef = useRef(false);

  const onChange = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!googleClientId || googleInitializedRef.current) return;

    loadExternalScript("https://accounts.google.com/gsi/client").then((ok) => {
      if (!ok || !window.google?.accounts?.id || googleInitializedRef.current) return;

      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async (response) => {
          if (!response?.credential) {
            toast.error("Google sign-in failed");
            return;
          }
          try {
            const data = await socialLogin({ provider: "google", token: response.credential });
            login(data);
            toast.success("Signed in with Google");
            navigate(redirectTo);
          } catch (error) {
            toast.error(error.response?.data?.message || "Google sign-in failed");
          }
        },
      });

      if (googleButtonRef.current) {
        googleButtonRef.current.innerHTML = "";
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "signin_with",
          width: 200,
        });
      }
      googleInitializedRef.current = true;
    });
  }, [login, navigate, redirectTo]);

  const facebookSignIn = async () => {
    const appId = import.meta.env.VITE_FACEBOOK_APP_ID;
    if (!appId) {
      toast.error("Facebook App ID missing");
      return;
    }

    const ok = await loadExternalScript("https://connect.facebook.net/en_US/sdk.js");
    if (!ok || !window.FB) {
      toast.error("Unable to load Facebook SDK");
      return;
    }

    if (!facebookInitializedRef.current) {
      window.FB.init({
        appId,
        cookie: true,
        xfbml: false,
        version: "v20.0",
      });
      facebookInitializedRef.current = true;
    }

    window.FB.login(
      async (response) => {
        if (!response.authResponse?.accessToken) {
          toast.error("Facebook login cancelled");
          return;
        }

        try {
          const data = await socialLogin({ provider: "facebook", token: response.authResponse.accessToken });
          login(data);
          toast.success("Signed in with Facebook");
          navigate(redirectTo);
        } catch (error) {
          toast.error(error.response?.data?.message || "Facebook sign-in failed");
        }
      },
      { scope: "public_profile,email" }
    );
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (useOtp) {
        if (!form.otp) {
          await requestOtp({ email: form.email });
          toast.success("OTP sent (demo: 123456)");
          return;
        }
        const data = await verifyOtp({ email: form.email, otp: form.otp });
        login(data);
        navigate(redirectTo);
        return;
      }

      const data = mode === "signup" ? await signupUser(form) : await loginUser(form);
      login(data);
      navigate(redirectTo);
    } catch (error) {
      toast.error(error.response?.data?.message || "Authentication failed");
    }
  };

  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <form onSubmit={submit} className="form-modern glass-panel rounded-2xl border border-white/70 bg-white/60 p-6 shadow-soft">
        <h1 className="text-2xl font-bold">{mode === "login" ? "Login" : "Create account"}</h1>
        <p className="mt-1 text-sm text-ink/65">Email/password, OTP, Google or Facebook sign in.</p>

        <div className="mt-4 grid grid-cols-2 gap-2 items-center">
          <div ref={googleButtonRef} />
          <button type="button" onClick={facebookSignIn} className="rounded-lg border border-clay px-3 py-2 text-sm font-semibold">Facebook</button>
        </div>

        <div className="mt-5 space-y-3">
          {mode === "signup" && <input className="w-full rounded-lg px-3 py-2" placeholder="Name" value={form.name} onChange={(e) => onChange("name", e.target.value)} required />}
          <input className="w-full rounded-lg px-3 py-2" placeholder="Email" type="email" value={form.email} onChange={(e) => onChange("email", e.target.value)} required />
          {mode === "signup" && <input className="w-full rounded-lg px-3 py-2" placeholder="Phone" value={form.phone} onChange={(e) => onChange("phone", e.target.value)} />}
          {!useOtp && <input className="w-full rounded-lg px-3 py-2" placeholder="Password" type="password" value={form.password} onChange={(e) => onChange("password", e.target.value)} required />}
          {mode === "signup" && (
            <select className="w-full rounded-lg px-3 py-2" value={form.role} onChange={(e) => onChange("role", e.target.value)}>
              <option value="buyer">Buyer/Tenant</option>
              <option value="customer">Customer</option>
              <option value="seller">Property Owner</option>
              <option value="agent">Agent</option>
              <option value="broker">Broker</option>
              <option value="builder">Builder</option>
            </select>
          )}
          {mode === "signup" && (
            <label className="soft-input flex items-center gap-2 rounded-lg px-3 py-2 text-sm">
              <input
                type="checkbox"
                checked={Boolean(form.canPostProperty)}
                onChange={(e) => onChange("canPostProperty", e.target.checked)}
              />
              Enable property posting for this account
            </label>
          )}
          {useOtp && <input className="w-full rounded-lg px-3 py-2" placeholder="Enter OTP" value={form.otp} onChange={(e) => onChange("otp", e.target.value)} />}
        </div>

        <button className="mt-5 w-full rounded-lg bg-ink py-2.5 text-sm font-semibold text-stone">
          {useOtp ? (form.otp ? "Verify OTP" : "Request OTP") : mode === "login" ? "Login" : "Signup"}
        </button>

        <div className="mt-4 flex justify-between text-sm">
          <button type="button" className="text-sage" onClick={() => setMode((m) => (m === "login" ? "signup" : "login"))}>
            {mode === "login" ? "Need an account? Signup" : "Already have account? Login"}
          </button>
          <button type="button" className="text-sage" onClick={() => setUseOtp((v) => !v)}>
            {useOtp ? "Use password" : "Use OTP"}
          </button>
        </div>
      </form>
    </main>
  );
};

export default AuthPage;
