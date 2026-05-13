import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import DashboardSidebar from "../components/DashboardSidebar";
import Loader from "../components/Loader";
import useAuth from "../hooks/useAuth";
import { createCustomerRequest, fetchMyCustomerRequests } from "../services/api/customerRequestApi";
import { fetchMyNotifications, markNotificationRead } from "../services/api/notificationApi";

const STATUS_CONFIG = {
  open: { label: "Open", cls: "bg-slate-100 text-slate-700" },
  matched: { label: "Matched", cls: "bg-[#f5e8d4] text-[#8b6b3f]" },
  closed: { label: "Closed", cls: "bg-slate-200 text-slate-500" },
};

const PROPERTY_TYPE_OPTIONS = ["Apartment", "Villa", "Independent House", "Plot", "Commercial"];

const initialForm = {
  city: "",
  area: "",
  budgetMin: "",
  budgetMax: "",
  propertyType: "Apartment",
  additionalRequirements: "",
};

const fmtDate = (value) => new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
const fmtDateTime = (value) => new Date(value).toLocaleString("en-IN");
const formatBudget = (min, max) => `Rs.${Number(min || 0).toLocaleString("en-IN")} - Rs.${Number(max || 0).toLocaleString("en-IN")}`;

const CustomerDashboardPage = () => {
  const { token, user } = useAuth();

  const [requests, setRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [tab, setTab] = useState("overview");

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [reqRes, notifRes] = await Promise.allSettled([fetchMyCustomerRequests(token), fetchMyNotifications(token)]);
      if (reqRes.status === "fulfilled") setRequests(reqRes.value.items || []);
      if (notifRes.status === "fulfilled") setNotifications(notifRes.value.items || []);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const onSubmitRequest = async (event) => {
    event.preventDefault();
    if (!form.city || !form.area || !form.budgetMax) {
      toast.error("City, area, and max budget are required");
      return;
    }

    try {
      setSubmitting(true);
      await createCustomerRequest(token, {
        location: { city: form.city.trim(), area: form.area.trim() },
        budgetMin: Number(form.budgetMin || 0),
        budgetMax: Number(form.budgetMax || 0),
        propertyType: form.propertyType,
        additionalRequirements: form.additionalRequirements.trim(),
      });
      toast.success("Requirement submitted and shared with matching property owners/agents.");
      setForm(initialForm);
      setShowForm(false);
      loadAll();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to submit requirement");
    } finally {
      setSubmitting(false);
    }
  };

  const onMarkRead = async (id) => {
    try {
      await markNotificationRead(token, id);
      setNotifications((prev) =>
        prev.map((item) => (item._id === id ? { ...item, readAt: new Date().toISOString() } : item))
      );
    } catch {
      toast.error("Unable to mark notification as read");
    }
  };

  const unreadCount = useMemo(() => notifications.filter((item) => !item.readAt).length, [notifications]);
  const openCount = useMemo(() => requests.filter((item) => item.status === "open").length, [requests]);
  const matchedCount = useMemo(() => requests.filter((item) => item.status === "matched").length, [requests]);
  const matchNotifications = useMemo(
    () => notifications.filter((item) => item.type === "match"),
    [notifications]
  );
  const latestRequests = useMemo(() => requests.slice(0, 3), [requests]);
  const matchedRequests = useMemo(
    () => requests.filter((item) => (item.matchedAgents?.length || 0) > 0 || item.status === "matched"),
    [requests]
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 pt-6 md:pl-80">
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
          <Loader text="Loading your customer dashboard..." />
        </div>
      </main>
    );
  }

  return (
    <DashboardSidebar
      title={user?.name || "Customer"}
      subtitle="Customer Dashboard"
      description="Track your requirements, receive property-side responses, and manage dashboard activity from one cleaner workspace."
      navItems={[
        { key: "overview", label: "Overview", icon: "📊", badge: undefined },
        { key: "requests", label: "My Requirements", icon: "📋", badge: requests.length || undefined },
        { key: "matches", label: "Matches", icon: "🏠", badge: matchedCount || undefined },
        { key: "notifications", label: "Notifications", icon: "🔔", badge: unreadCount || undefined },
      ].map((item) => ({
        ...item,
        active: tab === item.key,
        onClick: setTab,
      }))}
    >
      {tab === "overview" && (
        <div className="space-y-6">
          <section className="dashboard-shell p-6 md:p-7">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="dashboard-kicker text-[#8b6b3f]">Customer activity</p>
                <h2 className="mt-3 text-3xl font-extrabold text-slate-900">Welcome, {user?.name}</h2>
                <p className="mt-2 text-sm text-slate-600">
                  Post property requirements, monitor responses from property owners and agents, and stay on top of every follow-up.
                </p>
              </div>
              <button onClick={() => setTab("requests")} className="dashboard-primary px-6 py-3 text-sm">
                Manage Requirements
              </button>
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Total Requirements", value: requests.length, color: "from-blue-500 to-blue-700" },
              { label: "Open Requirements", value: openCount, color: "from-slate-600 to-slate-800" },
              { label: "Matched Requirements", value: matchedCount, color: "from-emerald-500 to-emerald-700" },
              { label: "Unread Notifications", value: unreadCount, color: "from-amber-500 to-orange-600" },
            ].map((item) => (
              <div key={item.label} className="dashboard-shell border border-slate-200 bg-white p-5 text-slate-900">
                <p className="text-sm uppercase tracking-[0.18em] text-slate-600">{item.label}</p>
                <p className="mt-4 text-4xl font-extrabold text-slate-900">{item.value}</p>
              </div>
            ))}
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="dashboard-shell p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Recent requirements</h3>
                  <p className="mt-1 text-sm text-slate-600">Your latest submitted property requirements.</p>
                </div>
                <button onClick={() => setTab("requests")} className="dashboard-secondary px-4 py-2 text-xs">
                  View all
                </button>
              </div>

              <div className="mt-5 space-y-3">
                {latestRequests.length === 0 ? (
                  <div className="dashboard-empty p-8 text-center">No requirements submitted yet.</div>
                ) : (
                  latestRequests.map((item) => {
                    const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.open;
                    return (
                      <div key={item._id} className="dashboard-subpanel p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.cls}`}>{cfg.label}</span>
                              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">{item.propertyType}</span>
                            </div>
                            <p className="mt-2 font-semibold text-slate-900">{item.location?.city}, {item.location?.area}</p>
                            <p className="mt-1 text-sm text-slate-600">{formatBudget(item.budgetMin, item.budgetMax)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-slate-500">{fmtDate(item.createdAt)}</p>
                            <p className="mt-1 text-xs font-semibold text-[#8b6b3f]">{item.matchedAgents?.length || 0} matches</p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="dashboard-shell p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Property-side responses</h3>
                  <p className="mt-1 text-sm text-slate-600">Agents and owners responding to your requirements.</p>
                </div>
                <button onClick={() => setTab("matches")} className="dashboard-secondary px-4 py-2 text-xs">
                  Open matches
                </button>
              </div>

              <div className="mt-5 space-y-3">
                {matchNotifications.length === 0 ? (
                  <div className="dashboard-empty p-8 text-center">No responses yet. Matching activity will appear here.</div>
                ) : (
                  matchNotifications.slice(0, 4).map((item) => (
                    <div key={item._id} className="dashboard-subpanel p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900">{item.title}</p>
                          <p className="mt-1 text-sm text-slate-600">{item.message}</p>
                          <p className="mt-2 text-xs text-slate-500">{fmtDateTime(item.createdAt)}</p>
                        </div>
                        {!item.readAt ? (
                          <button onClick={() => onMarkRead(item._id)} className="dashboard-primary shrink-0 px-3 py-1.5 text-xs">
                            Mark read
                          </button>
                        ) : null}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        </div>
      )}

      {tab === "requests" && (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900">My Property Requirements</h2>
              <p className="mt-1 text-sm text-slate-600">Post and manage the requirements you want owners and agents to respond to.</p>
            </div>
            <button onClick={() => setShowForm((value) => !value)} className="dashboard-primary px-4 py-2 text-sm">
              {showForm ? "Cancel" : "+ New Requirement"}
            </button>
          </div>

          {showForm ? (
            <form onSubmit={onSubmitRequest} className="dashboard-shell space-y-4 p-6">
              <h3 className="font-bold text-slate-900">Submit a Requirement</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  className="soft-input rounded-lg px-3 py-2 text-sm"
                  placeholder="City *"
                  value={form.city}
                  onChange={(event) => setForm((prev) => ({ ...prev, city: event.target.value }))}
                />
                <input
                  className="soft-input rounded-lg px-3 py-2 text-sm"
                  placeholder="Area *"
                  value={form.area}
                  onChange={(event) => setForm((prev) => ({ ...prev, area: event.target.value }))}
                />
                <input
                  className="soft-input rounded-lg px-3 py-2 text-sm"
                  type="number"
                  min="0"
                  placeholder="Budget Min"
                  value={form.budgetMin}
                  onChange={(event) => setForm((prev) => ({ ...prev, budgetMin: event.target.value }))}
                />
                <input
                  className="soft-input rounded-lg px-3 py-2 text-sm"
                  type="number"
                  min="0"
                  placeholder="Budget Max *"
                  value={form.budgetMax}
                  onChange={(event) => setForm((prev) => ({ ...prev, budgetMax: event.target.value }))}
                />
                <select
                  className="soft-input rounded-lg px-3 py-2 text-sm"
                  value={form.propertyType}
                  onChange={(event) => setForm((prev) => ({ ...prev, propertyType: event.target.value }))}
                >
                  {PROPERTY_TYPE_OPTIONS.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>
              <textarea
                className="soft-input w-full min-h-[100px] rounded-lg px-3 py-2 text-sm"
                placeholder="Additional requirements (optional)"
                value={form.additionalRequirements}
                onChange={(event) => setForm((prev) => ({ ...prev, additionalRequirements: event.target.value }))}
              />
              <button disabled={submitting} className="dashboard-primary px-6 py-2.5 text-sm disabled:opacity-60">
                {submitting ? "Submitting..." : "Submit Requirement"}
              </button>
            </form>
          ) : null}

          {requests.length === 0 ? (
            <div className="dashboard-empty pt-10 text-center">No requirements submitted yet.</div>
          ) : (
            <div className="space-y-4">
              {requests.map((item) => {
                const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.open;
                return (
                  <div key={item._id} className="dashboard-shell p-5 transition-shadow hover:shadow-lg">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.cls}`}>{cfg.label}</span>
                          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">{item.propertyType}</span>
                        </div>
                        <p className="mt-3 text-lg font-semibold text-slate-900">{item.location?.city}, {item.location?.area}</p>
                        <p className="mt-1 text-sm text-slate-600">{formatBudget(item.budgetMin, item.budgetMax)}</p>
                        {item.additionalRequirements ? (
                          <p className="mt-2 text-sm text-slate-500">{item.additionalRequirements}</p>
                        ) : null}
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500">{fmtDate(item.createdAt)}</p>
                        <p className="mt-2 text-xs font-semibold text-[#8b6b3f]">
                          {item.matchedAgents?.length || 0} agent / owner responses
                        </p>
                      </div>
                    </div>

                    {item.matchedAgents?.length ? (
                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        {item.matchedAgents.map((agent) => (
                          <div key={agent._id} className="dashboard-subpanel p-4">
                            <p className="font-semibold text-slate-900">{agent.name}</p>
                            <p className="mt-1 text-sm text-slate-600 capitalize">{agent.role}</p>
                            <p className="mt-1 text-sm text-slate-500">{agent.phone || "Phone not shared yet"}</p>
                            <p className="mt-1 text-sm text-slate-500">{agent.email || "Email not shared yet"}</p>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {tab === "matches" && (
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Matched Responses</h2>
            <p className="mt-1 text-sm text-slate-600">Owners and agents who responded to the requirements you posted.</p>
          </div>

          {matchedRequests.length === 0 ? (
            <div className="dashboard-empty pt-10 text-center">No property-side responses yet.</div>
          ) : (
            <div className="space-y-4">
              {matchedRequests.map((item) => (
                <div key={item._id} className="dashboard-shell p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8b6b3f]">Requirement Match</p>
                      <h3 className="mt-2 text-lg font-semibold text-slate-900">
                        {item.propertyType} in {item.location?.area}, {item.location?.city}
                      </h3>
                      <p className="mt-1 text-sm text-slate-600">{formatBudget(item.budgetMin, item.budgetMax)}</p>
                    </div>
                    <span className="rounded-full bg-[#f5e8d4] px-3 py-1 text-xs font-semibold text-[#8b6b3f]">
                      {item.matchedAgents?.length || 0} matches
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {(item.matchedAgents || []).map((agent) => (
                      <div key={agent._id} className="dashboard-subpanel p-4">
                        <p className="font-semibold text-slate-900">{agent.name}</p>
                        <p className="mt-1 text-sm capitalize text-slate-600">{agent.role}</p>
                        <p className="mt-2 text-sm text-slate-500">{agent.phone || "Phone unavailable"}</p>
                        <p className="mt-1 text-sm text-slate-500">{agent.email || "Email unavailable"}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {matchNotifications.length ? (
            <div className="dashboard-shell p-5">
              <h3 className="text-lg font-bold text-slate-900">Recent match notifications</h3>
              <div className="mt-4 space-y-3">
                {matchNotifications.map((item) => (
                  <div key={item._id} className="dashboard-subpanel p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{item.title}</p>
                        <p className="mt-1 text-sm text-slate-600">{item.message}</p>
                        <p className="mt-1.5 text-xs text-slate-500">{fmtDateTime(item.createdAt)}</p>
                      </div>
                      {!item.readAt ? (
                        <button onClick={() => onMarkRead(item._id)} className="dashboard-secondary shrink-0 px-3 py-1 text-xs">
                          Mark read
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </section>
      )}

      {tab === "notifications" && (
        <section className="space-y-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Notifications</h2>
            <p className="mt-1 text-sm text-slate-600">Track every update related to your requirements and account activity.</p>
          </div>
          {notifications.length === 0 ? (
            <div className="dashboard-empty pt-10 text-center">No notifications yet.</div>
          ) : (
            notifications.map((item) => (
              <div
                key={item._id}
                className={`rounded-2xl border p-4 transition-all ${
                  item.readAt ? "border-slate-200 bg-slate-50" : "border-[#eadbc4] bg-[#fff8ef] shadow-sm"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{item.message}</p>
                    <p className="mt-1.5 text-xs text-slate-500">{fmtDateTime(item.createdAt)}</p>
                  </div>
                  {!item.readAt ? (
                    <button onClick={() => onMarkRead(item._id)} className="dashboard-secondary shrink-0 px-3 py-1 text-xs">
                      Mark read
                    </button>
                  ) : null}
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
