import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import useAuth from "../hooks/useAuth";
import { fetchMyCustomerRequests, createCustomerRequest } from "../services/api/customerRequestApi";
import { fetchMyNotifications, markNotificationRead } from "../services/api/notificationApi";

const STATUS_CONFIG = {
  pending: { label: "Pending", cls: "bg-amber-100 text-amber-700" },
  open: { label: "Open", cls: "bg-stone text-ink/70" },
  matched: { label: "Matched", cls: "bg-sage/15 text-sage" },
  closed: { label: "Closed", cls: "bg-clay/30 text-ink/50" },
};

const initialForm = { city: "", area: "", budgetMin: "", budgetMax: "", propertyType: "Plot", additionalRequirements: "" };

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
    <main className="mx-auto max-w-7xl px-4 py-12 md:px-8">
      <div className="flex h-64 items-center justify-center gap-3 text-ink/60">
        Loading your dashboard...
      </div>
    </main>
  );

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 md:px-8">
      <header className="rounded-2xl bg-gradient-to-r from-ink via-ink/90 to-ink/80 p-6 text-white shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium opacity-80">Welcome back</p>
            <h1 className="text-2xl font-extrabold">{user?.name}</h1>
            <p className="mt-1 text-sm opacity-70">Customer Dashboard</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <StatPill label="Total Requests" value={requests.length} />
            <StatPill label="Unread" value={unreadCount} />
          </div>
        </div>
      </header>

      <nav className="flex gap-1 rounded-xl border border-clay/60 bg-white p-1 shadow-soft">
        {[
          { key: "requests", label: "My Requirements", icon: "📋" },
          { key: "notifications", label: `Notifications${unreadCount ? ` (${unreadCount})` : ""}`, icon: "🔔" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${tab === t.key ? "bg-ink text-white shadow" : "text-ink/60 hover:text-ink"}`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </nav>

      {tab === "requests" && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">My Property Requirements</h2>
            <button
              onClick={() => setShowForm((v) => !v)}
              className="rounded-lg bg-sage px-4 py-2 text-sm font-semibold text-white shadow hover:opacity-90"
            >
              {showForm ? "✕ Cancel" : "+ New Requirement"}
            </button>
          </div>

          {showForm && (
            <form onSubmit={onSubmitRequest} className="rounded-2xl border border-clay/70 bg-white p-6 shadow-soft space-y-4">
              <h3 className="font-bold text-ink">Submit a Requirement</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <input className="soft-input rounded-lg px-3 py-2 text-sm" placeholder="City *" value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} />
                <input className="soft-input rounded-lg px-3 py-2 text-sm" placeholder="Area *" value={form.area} onChange={(e) => setForm((f) => ({ ...f, area: e.target.value }))} />
                <input className="soft-input rounded-lg px-3 py-2 text-sm" type="number" min="0" placeholder="Budget Min" value={form.budgetMin} onChange={(e) => setForm((f) => ({ ...f, budgetMin: e.target.value }))} />
                <input className="soft-input rounded-lg px-3 py-2 text-sm" type="number" min="0" placeholder="Budget Max *" value={form.budgetMax} onChange={(e) => setForm((f) => ({ ...f, budgetMax: e.target.value }))} />
                <select className="soft-input rounded-lg px-3 py-2 text-sm" value={form.propertyType} onChange={(e) => setForm((f) => ({ ...f, propertyType: e.target.value }))}>
                  {["Plot", "House", "Apartment", "Commercial", "Land"].map((v) => <option key={v}>{v}</option>)}
                </select>
              </div>
              <textarea className="soft-input w-full min-h-[90px] rounded-lg px-3 py-2 text-sm" placeholder="Additional requirements (optional)" value={form.additionalRequirements} onChange={(e) => setForm((f) => ({ ...f, additionalRequirements: e.target.value }))} />
              <button disabled={submitting} className="rounded-lg bg-ink px-6 py-2.5 text-sm font-bold text-white disabled:opacity-60">
                {submitting ? "Submitting..." : "Submit Request"}
              </button>
            </form>
          )}

          {requests.length === 0 ? (
            <div className="pt-10 text-center text-ink/50">No requirements submitted yet.</div>
          ) : (
            <div className="space-y-3">
              {requests.map((req) => {
                const cfg = STATUS_CONFIG[req.status] || STATUS_CONFIG.open;
                return (
                  <div key={req._id} className="rounded-2xl border border-clay/70 bg-white p-5 shadow-soft hover:shadow-md transition-shadow">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.cls}`}>{cfg.label}</span>
                          <span className="rounded-full bg-stone px-2.5 py-0.5 text-xs font-semibold text-ink/70">{req.propertyType}</span>
                        </div>
                        <p className="mt-2 font-semibold text-ink">{req.location?.city}, {req.location?.area}</p>
                        {req.budgetMax > 0 && (
                          <p className="mt-0.5 text-sm text-ink/70">Budget: Rs.{(req.budgetMin || 0).toLocaleString()} - Rs.{(req.budgetMax || 0).toLocaleString()}</p>
                        )}
                        {req.additionalRequirements && (
                          <p className="mt-1 text-xs text-ink/60">{req.additionalRequirements}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-ink/50">{new Date(req.createdAt).toLocaleDateString("en-IN")}</p>
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
          <h2 className="text-lg font-bold">Notifications</h2>
          {notifications.length === 0 ? (
            <div className="pt-10 text-center text-ink/50">No notifications.</div>
          ) : (
            notifications.map((n) => (
              <div key={n._id} className={`rounded-2xl border p-4 transition-all ${n.readAt ? "border-clay/50 bg-stone/50" : "border-sage/40 bg-sage/5 shadow-soft"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-ink">{n.title}</p>
                    <p className="mt-1 text-sm text-ink/70">{n.message}</p>
                    <p className="mt-1.5 text-xs text-ink/50">{new Date(n.createdAt).toLocaleString("en-IN")}</p>
                  </div>
                  {!n.readAt && (
                    <button onClick={() => onMarkRead(n._id)} className="shrink-0 rounded-lg border border-clay px-3 py-1 text-xs font-semibold hover:bg-stone transition-colors">
                      Mark read
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </section>
      )}
    </main>
  );
};

const StatPill = ({ label, value }) => (
  <div className="rounded-xl bg-white/10 px-4 py-2 text-center backdrop-blur">
    <p className="text-xs font-medium opacity-80">{label}</p>
    <p className="text-xl font-extrabold">{value}</p>
  </div>
);

export default CustomerDashboardPage;
