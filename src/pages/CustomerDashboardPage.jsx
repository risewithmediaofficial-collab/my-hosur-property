import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import DashboardSidebar from "../components/DashboardSidebar";
import Loader from "../components/Loader";
import useAuth from "../hooks/useAuth";
import { fetchMyCustomerRequests, createCustomerRequest } from "../services/api/customerRequestApi";
import { fetchMyNotifications, markNotificationRead } from "../services/api/notificationApi";

const STATUS_CONFIG = {
  pending: { label: "Pending", cls: "bg-amber-100 text-amber-700" },
  open: { label: "Open", cls: "bg-slate-100 text-slate-700" },
  matched: { label: "Matched", cls: "bg-blue-100 text-blue-700" },
  closed: { label: "Closed", cls: "bg-slate-200 text-slate-500" },
};

const initialForm = { city: "", area: "", budgetMin: "", budgetMax: "", propertyType: "Agricultural Land", additionalRequirements: "" };

const CustomerDashboardPage = () => {
  const { token, user } = useAuth();

  const [requests, setRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [tab, setTab] = useState("requests");

  const loadAll = useCallback(async () => {
    try {
      const [reqRes, notifRes] = await Promise.allSettled([
        fetchMyCustomerRequests(token),
        fetchMyNotifications(token),
      ]);
      if (reqRes.status === "fulfilled") setRequests(reqRes.value.items || []);
      if (notifRes.status === "fulfilled") setNotifications(notifRes.value.items || []);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const onSubmitRequest = async (e) => {
    e.preventDefault();
    if (!form.city || !form.area || !form.budgetMax) {
      toast.error("City, area, and max budget are required");
      return;
    }
    try {
      setSubmitting(true);
      await createCustomerRequest(token, {
        location: { city: form.city, area: form.area },
        budgetMin: Number(form.budgetMin || 0),
        budgetMax: Number(form.budgetMax),
        propertyType: form.propertyType,
        additionalRequirements: form.additionalRequirements,
      });
      toast.success("Request submitted. Agents will be notified.");
      setForm(initialForm);
      setShowForm(false);
      loadAll();
    } catch (e) {
      toast.error(e.response?.data?.message || "Unable to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  const onMarkRead = async (id) => {
    try {
      await markNotificationRead(token, id);
      setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, readAt: new Date().toISOString() } : n));
    } catch { toast.error("Unable to mark"); }
  };

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  if (loading) return (
    <main className="min-h-screen bg-slate-50 pt-6 md:pl-80">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <Loader text="Loading your dashboard..." />
      </div>
    </main>
  );

  return (
    <DashboardSidebar
      title={user?.name || "Customer"}
      subtitle="Customer Dashboard"
      description="Track your property requests and notifications from a clean sidebar interface."
      navItems={[
        { key: "requests", label: "My Requirements", icon: "📋", badge: requests.length },
        { key: "notifications", label: `Notifications${unreadCount ? ` (${unreadCount})` : ""}`, icon: "🔔", badge: unreadCount },
      ].map((item) => ({
        ...item,
        active: tab === item.key,
        onClick: setTab,
      }))}
    >
      <section className="grid gap-4 sm:grid-cols-2">
        <div className="dashboard-stat p-5">
          <p className="text-sm text-slate-500">Total requests</p>
          <p className="mt-2 text-3xl font-extrabold text-slate-900">{requests.length}</p>
        </div>
        <div className="dashboard-stat p-5">
          <p className="text-sm text-slate-500">Unread notifications</p>
          <p className="mt-2 text-3xl font-extrabold text-slate-900">{unreadCount}</p>
        </div>
      </section>

      {tab === "requests" && (
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-900">My Property Requirements</h2>
            <button
              onClick={() => setShowForm((v) => !v)}
              className="dashboard-primary px-4 py-2 text-sm"
            >
              {showForm ? "✕ Cancel" : "+ New Requirement"}
            </button>
          </div>

          {showForm && (
            <form onSubmit={onSubmitRequest} className="dashboard-shell space-y-4 p-6">
              <h3 className="font-bold text-slate-900">Submit a Requirement</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <input className="soft-input rounded-lg px-3 py-2 text-sm" placeholder="City *" value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} />
                <input className="soft-input rounded-lg px-3 py-2 text-sm" placeholder="Area *" value={form.area} onChange={(e) => setForm((f) => ({ ...f, area: e.target.value }))} />
                <input className="soft-input rounded-lg px-3 py-2 text-sm" type="number" min="0" placeholder="Budget Min" value={form.budgetMin} onChange={(e) => setForm((f) => ({ ...f, budgetMin: e.target.value }))} />
                <input className="soft-input rounded-lg px-3 py-2 text-sm" type="number" min="0" placeholder="Budget Max *" value={form.budgetMax} onChange={(e) => setForm((f) => ({ ...f, budgetMax: e.target.value }))} />
                <select className="soft-input rounded-lg px-3 py-2 text-sm" value={form.propertyType} onChange={(e) => setForm((f) => ({ ...f, propertyType: e.target.value }))}>
                  {["Agricultural Land", "Industrial Land", "Commercial Land", "House", "Apartment", "Commercial Building"].map((v) => <option key={v}>{v}</option>)}
                </select>
              </div>
              <textarea className="soft-input w-full min-h-[90px] rounded-lg px-3 py-2 text-sm" placeholder="Additional requirements (optional)" value={form.additionalRequirements} onChange={(e) => setForm((f) => ({ ...f, additionalRequirements: e.target.value }))} />
              <button disabled={submitting} className="dashboard-primary px-6 py-2.5 text-sm disabled:opacity-60">
                {submitting ? "Submitting..." : "Submit Request"}
              </button>
            </form>
          )}

          {requests.length === 0 ? (
            <div className="dashboard-empty pt-10 text-center">No requirements submitted yet.</div>
          ) : (
            <div className="space-y-3">
              {requests.map((req) => {
                const cfg = STATUS_CONFIG[req.status] || STATUS_CONFIG.open;
                return (
                  <div key={req._id} className="dashboard-shell p-5 transition-shadow hover:shadow-lg">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.cls}`}>{cfg.label}</span>
                          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">{req.propertyType}</span>
                        </div>
                        <p className="mt-2 font-semibold text-slate-900">{req.location?.city}, {req.location?.area}</p>
                        {req.budgetMax > 0 && (
                          <p className="mt-0.5 text-sm text-slate-600">Budget: Rs.{(req.budgetMin || 0).toLocaleString()} - Rs.{(req.budgetMax || 0).toLocaleString()}</p>
                        )}
                        {req.additionalRequirements && (
                          <p className="mt-1 text-xs text-slate-500">{req.additionalRequirements}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500">{new Date(req.createdAt).toLocaleDateString("en-IN")}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {tab === "notifications" && (
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">Notifications</h2>
          {notifications.length === 0 ? (
            <div className="dashboard-empty pt-10 text-center">No notifications.</div>
          ) : (
            notifications.map((n) => (
              <div key={n._id} className={`rounded-2xl border p-4 transition-all ${n.readAt ? "border-slate-200 bg-slate-50" : "border-blue-200 bg-blue-50/60 shadow-sm"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900">{n.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{n.message}</p>
                    <p className="mt-1.5 text-xs text-slate-500">{new Date(n.createdAt).toLocaleString("en-IN")}</p>
                  </div>
                  {!n.readAt && (
                    <button onClick={() => onMarkRead(n._id)} className="dashboard-secondary shrink-0 px-3 py-1 text-xs">
                      Mark read
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </section>
      )}
    </DashboardSidebar>
  );
};

export default CustomerDashboardPage;
