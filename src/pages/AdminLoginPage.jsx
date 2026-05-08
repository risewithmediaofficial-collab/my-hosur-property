import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useAuth from "../hooks/useAuth";
import { adminLoginUser } from "../services/api/adminAuthApi";
import { ShieldCheckIcon } from "@heroicons/react/24/outline";

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);

  const onChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const data = await adminLoginUser(form);
      login(data);
      toast.success("Admin login successful");
      navigate("/admin/dashboard");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to reach the admin login service. Check that the project backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <form onSubmit={onSubmit} className="form-modern glass-panel uiverse-card rounded-3xl border border-white/80 bg-white/90 p-7 shadow-soft">
        <span className="content-chip"><ShieldCheckIcon className="h-3.5 w-3.5" />Secure Access</span>
        <h1 className="mt-3 text-3xl font-extrabold">Admin Login</h1>
        <p className="mt-1 text-sm text-ink/65">Use admin username/email and password.</p>

        <div className="mt-5 space-y-3">
          <input
            className="w-full rounded-xl px-3 py-2.5"
            placeholder="Username or Email"
            value={form.username}
            onChange={(e) => onChange("username", e.target.value)}
            required
          />
          <input
            className="w-full rounded-xl px-3 py-2.5"
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(e) => onChange("password", e.target.value)}
            required
          />
        </div>

        <button disabled={loading} className="uiverse-btn mt-5 w-full rounded-xl bg-ink py-2.5 text-sm font-semibold text-stone disabled:opacity-60">
          {loading ? "Signing in..." : "Login as Admin"}
        </button>
      </form>
    </main>
  );
};

export default AdminLoginPage;
