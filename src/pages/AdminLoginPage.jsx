import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useAuth from "../hooks/useAuth";
import useScrollToTop from "../hooks/useScrollToTop";
import { adminLoginUser } from "../services/api/adminAuthApi";
import { ShieldCheckIcon } from "../components/AppIcons";

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const scrollToTop = useScrollToTop();
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
      scrollToTop();
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
    <main className="page-shell-muted mx-auto flex min-h-screen max-w-md items-center px-4 py-12">
      <form onSubmit={onSubmit} className="marketing-card w-full p-7">
        <span className="content-chip"><ShieldCheckIcon className="h-3.5 w-3.5" />Secure Access</span>
        <h1 className="mt-3 text-3xl font-extrabold text-navy">Admin Login</h1>
        <p className="mt-1 text-sm text-slate-600">Use admin username/email and password.</p>

        <div className="mt-5 space-y-3">
          <input
            className="site-input w-full"
            placeholder="Username or Email"
            value={form.username}
            onChange={(e) => onChange("username", e.target.value)}
            required
          />
          <input
            className="site-input w-full"
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(e) => onChange("password", e.target.value)}
            required
          />
        </div>

        <button disabled={loading} className="site-button-primary mt-5 w-full rounded-lg py-3 text-sm font-bold disabled:opacity-60">
          {loading ? "Signing in..." : "Login as Admin"}
        </button>
      </form>
    </main>
  );
};

export default AdminLoginPage;
