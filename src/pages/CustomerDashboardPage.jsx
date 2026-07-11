import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  BellIcon,
  BookmarkIcon,
  ChatBubbleLeftRightIcon,
  ClipboardDocumentListIcon,
  HomeModernIcon,
  PlusIcon,
  Squares2X2Icon,
} from "../components/AppIcons";
import DashboardSidebar from "../components/DashboardSidebar";
import Loader from "../components/Loader";
import useAuth from "../hooks/useAuth";
import { createCustomerRequest, fetchMyCustomerRequests } from "../services/api/customerRequestApi";
import { fetchMyNotifications, markNotificationRead } from "../services/api/notificationApi";
import { fetchSavedProperties } from "../services/api/userApi";
import { PROPERTY_REQUEST_TYPES } from "../constants/serviceRequests";
import PropertyCard from "../components/PropertyCard";
import { getInquiryHistory } from "../utils/inquiryHistory";

const STATUS_CONFIG = {
  open: { label: "Open", cls: "bg-slate-100 text-slate-700" },
  matched: { label: "Matched", cls: "bg-slate-100 text-slate-700" },
  closed: { label: "Closed", cls: "bg-slate-200 text-slate-500" },
};

const PROPERTY_TYPE_OPTIONS = PROPERTY_REQUEST_TYPES;

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

const formatRequestTitle = (item) => {
  if (item.requestCategory === "loan") return "Loan";
  if (item.requestCategory === "interior") return `${item.serviceType || "Interior"} Interior`;
  if (item.requestCategory === "construction") return `${item.serviceType || "Construction"} Construction`;
  if (item.requestCategory === "property_rent") return `${item.propertyType || "Property"} Rent`;
  if (item.requestCategory === "property_sell") return `${item.propertyType || "Property"} Sell`;
  return item.propertyType || "Property";
};

const CustomerDashboardPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { token, user } = useAuth();

  const [requests, setRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [tab, setTab] = useState(searchParams.get("tab") || "overview");

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [reqRes, notifRes, savedRes] = await Promise.allSettled([fetchMyCustomerRequests(token), fetchMyNotifications(token), fetchSavedProperties(token)]);
      if (reqRes.status === "fulfilled") setRequests(reqRes.value.items || []);
      if (notifRes.status === "fulfilled") setNotifications(notifRes.value.items || []);
      if (savedRes.status === "fulfilled") setSaved(savedRes.value.items || []);
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
        requestCategory: "property_buy",
        location: { city: form.city.trim(), area: form.area.trim() },
        budgetMin: Number(form.budgetMin || 0),
        budgetMax: Number(form.budgetMax || 0),
        propertyType: form.propertyType,
        additionalRequirements: form.additionalRequirements.trim(),
      });
      toast.success("Requirement submitted and shared with matching property owners and agents.");
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
      setNotifications((previous) =>
        previous.map((item) => (item._id === id ? { ...item, readAt: new Date().toISOString() } : item))
      );
    } catch {
      toast.error("Unable to mark notification as read");
    }
  };

  const unreadCount = useMemo(() => notifications.filter((item) => !item.readAt).length, [notifications]);
  const inquiryHistory = useMemo(() => getInquiryHistory(user?._id), [user?._id, requests.length, notifications.length]);
  const openCount = useMemo(() => requests.filter((item) => item.status === "open").length, [requests]);
  const matchedCount = useMemo(() => requests.filter((item) => item.status === "matched").length, [requests]);
  const matchNotifications = useMemo(() => notifications.filter((item) => item.type === "match"), [notifications]);
  const latestRequests = useMemo(() => requests.slice(0, 3), [requests]);
  const matchedRequests = useMemo(
    () => requests.filter((item) => (item.matchedAgents?.length || 0) > 0 || item.status === "matched"),
    [requests]
  );

  const allowedTabs = ["overview", "requests", "matches", "notifications", "saved", "inquiries"];

  useEffect(() => {
    const nextTab = searchParams.get("tab");
    if (nextTab && allowedTabs.includes(nextTab) && nextTab !== tab) {
      setTab(nextTab);
    }
  }, [searchParams, tab]);

  useEffect(() => {
    const current = searchParams.get("tab") || "overview";
    if (tab !== current) {
      setSearchParams(tab === "overview" ? {} : { tab }, { replace: true });
    }
  }, [searchParams, setSearchParams, tab]);

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
      stats={[
        { label: "Requirements", value: requests.length, icon: <ClipboardDocumentListIcon className="h-4 w-4" /> },
        { label: "Open", value: openCount, icon: <Squares2X2Icon className="h-4 w-4" /> },
        { label: "Matches", value: matchedCount, icon: <HomeModernIcon className="h-4 w-4" /> },
        { label: "Unread", value: unreadCount, icon: <BellIcon className="h-4 w-4" /> },
        { label: "Saved", value: saved.length, icon: <BookmarkIcon className="h-4 w-4" /> },
      ]}
      navItems={[
        { key: "overview", label: "Overview", icon: <Squares2X2Icon className="h-4 w-4" />, badge: undefined },
        { key: "requests", label: "My Requests", icon: <ClipboardDocumentListIcon className="h-4 w-4" />, badge: requests.length || undefined },
        { key: "matches", label: "Matches", icon: <HomeModernIcon className="h-4 w-4" />, badge: matchedCount || undefined },
        { key: "notifications", label: "Notifications", icon: <BellIcon className="h-4 w-4" />, badge: unreadCount || undefined },
        { key: "inquiries", label: "Property Chats", icon: <ChatBubbleLeftRightIcon className="h-4 w-4" />, badge: inquiryHistory.length || undefined },
        { key: "saved", label: "Saved", icon: <BookmarkIcon className="h-4 w-4" />, badge: saved.length || undefined },
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
                <p className="dashboard-kicker">Customer activity</p>
                <h2 className="dashboard-display mt-3 text-4xl font-semibold text-slate-900">Welcome, {user?.name}</h2>
                <p className="dashboard-muted mt-2 text-sm">
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
              { label: "Total Requirements", value: requests.length },
              { label: "Open Requirements", value: openCount },
              { label: "Matched Requirements", value: matchedCount },
              { label: "Unread Notifications", value: unreadCount },
              { label: "Saved Properties", value: saved.length },
              { label: "Property Chats", value: inquiryHistory.length },
            ].map((item) => (
              <div key={item.label} className="dashboard-stat p-5 text-slate-900">
                <p className="text-sm uppercase tracking-[0.18em] text-slate-600">{item.label}</p>
                <p className="mt-4 text-4xl font-extrabold text-slate-900">{item.value}</p>
              </div>
            ))}
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="dashboard-shell p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="dashboard-display text-2xl font-semibold text-slate-900">Recent requirements</h3>
                  <p className="dashboard-muted mt-1 text-sm">Your latest submitted property requirements.</p>
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
                              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                                {formatRequestTitle(item)}
                              </span>
                            </div>
                            <p className="mt-2 font-semibold text-slate-900">
                              {item.location?.city}, {item.location?.area}
                            </p>
                            {item.budgetMin || item.budgetMax ? (
                              <p className="mt-1 text-sm text-slate-600">{formatBudget(item.budgetMin, item.budgetMax)}</p>
                            ) : null}
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-slate-500">{fmtDate(item.createdAt)}</p>
                            <p className="mt-1 text-xs font-semibold text-slate-700">{item.matchedAgents?.length || 0} matches</p>
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
                  <h3 className="dashboard-display text-2xl font-semibold text-slate-900">Property-side responses</h3>
                  <p className="dashboard-muted mt-1 text-sm">Agents and owners responding to your requirements.</p>
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
              <h2 className="dashboard-display text-2xl font-semibold text-slate-900">My Requests</h2>
              <p className="dashboard-muted mt-1 text-sm">Post and manage property or service requests you want the team to respond to.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setShowForm((value) => !value)} className="dashboard-primary px-4 py-2 text-sm">
                <PlusIcon className="h-4 w-4" />
                {showForm ? "Cancel" : "Property Requirement"}
              </button>
              <button onClick={() => navigate("/request-service")} className="dashboard-secondary px-4 py-2 text-sm">
                <PlusIcon className="h-4 w-4" />
                Service Request
              </button>
            </div>
          </div>

          {showForm ? (
            <form onSubmit={onSubmitRequest} className="dashboard-shell space-y-4 p-6">
              <h3 className="dashboard-display text-2xl font-semibold text-slate-900">Submit a Requirement</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  className="dashboard-control"
                  placeholder=" "
                  value={form.city}
                  onChange={(event) => setForm((previous) => ({ ...previous, city: event.target.value }))}
                />
                <input
                  className="dashboard-control"
                  placeholder=" "
                  value={form.area}
                  onChange={(event) => setForm((previous) => ({ ...previous, area: event.target.value }))}
                />
                <input
                  className="dashboard-control"
                  type="number"
                  min="0"
                  placeholder=" "
                  value={form.budgetMin}
                  onChange={(event) => setForm((previous) => ({ ...previous, budgetMin: event.target.value }))}
                />
                <input
                  className="dashboard-control"
                  type="number"
                  min="0"
                  placeholder=" "
                  value={form.budgetMax}
                  onChange={(event) => setForm((previous) => ({ ...previous, budgetMax: event.target.value }))}
                />
                <select
                  className="dashboard-control"
                  value={form.propertyType}
                  onChange={(event) => setForm((previous) => ({ ...previous, propertyType: event.target.value }))}
                >
                  {PROPERTY_TYPE_OPTIONS.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>
              <textarea
                className="dashboard-control min-h-[110px]"
                placeholder=" "
                value={form.additionalRequirements}
                onChange={(event) => setForm((previous) => ({ ...previous, additionalRequirements: event.target.value }))}
              />
              <button disabled={submitting} className="dashboard-primary px-6 py-2.5 text-sm disabled:opacity-60">
                {submitting ? "Submitting..." : "Submit Requirement"}
              </button>
            </form>
          ) : null}

          {requests.length === 0 ? (
            <div className="dashboard-empty p-10 text-center">No requirements submitted yet.</div>
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
                          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                            {formatRequestTitle(item)}
                          </span>
                        </div>
                        <p className="mt-3 text-lg font-semibold text-slate-900">
                          {item.location?.city}, {item.location?.area}
                        </p>
                        {item.budgetMin || item.budgetMax ? (
                          <p className="mt-1 text-sm text-slate-600">{formatBudget(item.budgetMin, item.budgetMax)}</p>
                        ) : null}
                        {item.additionalRequirements ? <p className="mt-2 text-sm text-slate-500">{item.additionalRequirements}</p> : null}
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500">{fmtDate(item.createdAt)}</p>
                        <p className="mt-2 text-xs font-semibold text-slate-700">
                          {item.matchedAgents?.length || 0} agent / owner responses
                        </p>
                      </div>
                    </div>

                    {item.matchedAgents?.length ? (
                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        {item.matchedAgents.map((agent) => (
                          <div key={agent._id} className="dashboard-subpanel p-4">
                            <p className="font-semibold text-slate-900">{agent.name}</p>
                            <p className="mt-1 text-sm capitalize text-slate-600">{agent.role}</p>
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
            <h2 className="dashboard-display text-2xl font-semibold text-slate-900">Matched Responses</h2>
            <p className="dashboard-muted mt-1 text-sm">Owners and agents who responded to the requirements you posted.</p>
          </div>

          {matchedRequests.length === 0 ? (
            <div className="dashboard-empty p-10 text-center">No property-side responses yet.</div>
          ) : (
            <div className="space-y-4">
              {matchedRequests.map((item) => (
                <div key={item._id} className="dashboard-shell p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-600">Requirement Match</p>
                      <h3 className="dashboard-display mt-2 text-xl font-semibold text-slate-900">
                        {formatRequestTitle(item)} in {item.location?.area}, {item.location?.city}
                      </h3>
                      {item.budgetMin || item.budgetMax ? (
                        <p className="mt-1 text-sm text-slate-600">{formatBudget(item.budgetMin, item.budgetMax)}</p>
                      ) : null}
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
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
              <h3 className="dashboard-display text-2xl font-semibold text-slate-900">Recent match notifications</h3>
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
            <h2 className="dashboard-display text-2xl font-semibold text-slate-900">Notifications</h2>
            <p className="dashboard-muted mt-1 text-sm">Track every update related to your requirements and account activity.</p>
          </div>
          {notifications.length === 0 ? (
            <div className="dashboard-empty p-10 text-center">No notifications yet.</div>
          ) : (
            notifications.map((item) => (
              <div
                key={item._id}
                className={`rounded-2xl border p-4 transition-all ${
                  item.readAt ? "border-slate-200 bg-slate-50" : "border-slate-200 bg-white shadow-sm"
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

      {tab === "inquiries" && (
        <section className="dashboard-shell p-6">
          <div className="mb-6">
            <h2 className="dashboard-display text-2xl font-semibold text-slate-900">Property Chat History</h2>
            <p className="dashboard-muted mt-1 text-sm">Every property contact request you sent is listed here for easy follow-up.</p>
          </div>
          {inquiryHistory.length === 0 ? (
            <div className="dashboard-empty p-10 text-center">No property chats yet.</div>
          ) : (
            <div className="space-y-4">
              {inquiryHistory.map((item) => (
                <div key={item.id} className="dashboard-subpanel p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-900">{item.propertyTitle}</p>
                      <p className="text-sm text-slate-600">{item.propertyLocation || "Hosur property inquiry"}</p>
                      <p className="mt-1 text-xs text-slate-500">Posted by: {item.ownerName} • {new Date(item.createdAt).toLocaleString("en-IN")}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                      item.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : item.status === "rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                    }`}>
                      {item.status || "pending"}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-slate-700">{item.message}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {tab === "saved" && (
        <section className="dashboard-shell p-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="dashboard-display text-2xl font-semibold text-slate-900">Saved Properties</h2>
              <p className="dashboard-muted text-sm">Quick access to the homes you bookmarked.</p>
            </div>
            <button onClick={() => navigate("/listings")} className="dashboard-secondary px-4 py-2 text-sm">
              Explore Listings
            </button>
          </div>
          {saved.length === 0 ? (
            <div className="dashboard-empty p-12 text-center">You haven&apos;t saved any properties yet.</div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {saved.map((item) => (
                <PropertyCard key={item._id} item={item} />
              ))}
            </div>
          )}
        </section>
      )}
    </DashboardSidebar>
  );
};

export default CustomerDashboardPage;
