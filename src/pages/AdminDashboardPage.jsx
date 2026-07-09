import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import useAuth from "../hooks/useAuth";
import {
  fetchAdminCustomerRequests,
  fetchAdminLeadPrice,
  fetchAdminLeads,
  fetchAdminLeadUnlocks,
  fetchAdminMetrics,
  fetchAdminPayments,
  fetchAdminPropertyApplications,
  fetchAdminUsers,
  updateAdminLeadPrice,
  toggleUserStatus,
  updateAdminUserNotes,
  sendAdminEmail,
  deleteAdminUser,
  deleteAdminLead,
  deleteAdminCustomerRequest,
  deleteAdminLeadUnlock,
} from "../services/api/adminApi";
import toast from "react-hot-toast";
import PropertyPostingForm from "../components/PropertyPostingForm";
import DashboardSidebar from "../components/DashboardSidebar";
import useBodyScrollLock from "../hooks/useBodyScrollLock";
import { deleteProperty, fetchProperties } from "../services/api/propertyApi";
import { PROPERTY_PLACEHOLDER_IMAGE } from "../constants/propertyMedia";
import { getPropertyImageAlt, getPropertyPath } from "../utils/seo";
import {
  AdjustmentsHorizontalIcon,
  ArrowDownTrayIcon,
  UsersIcon,
  ChartBarIcon,
  HomeModernIcon,
  BanknotesIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
  EnvelopeIcon,
  TicketIcon,
  XMarkIcon,
} from "../components/AppIcons";

const formatCustomerRequestLabel = (item) => {
  if (item.requestCategory === "loan") return "Loan";
  if (item.requestCategory === "interior") return `${item.serviceType || "Interior"} Interior`;
  if (item.requestCategory === "construction") return `${item.serviceType || "Construction"} Construction`;
  if (item.requestCategory === "property_rent") return `${item.propertyType || "Property"} Rent`;
  if (item.requestCategory === "property_sell") return `${item.propertyType || "Property"} Sell`;
  return item.propertyType || "Property";
};

const formatAdminDate = (value) => new Date(value).toLocaleDateString("en-IN");

const AdminDashboardPage = () => {
  const { token } = useAuth();
  const [metrics, setMetrics] = useState({});
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [propertyListings, setPropertyListings] = useState([]);
  const [leads, setLeads] = useState([]);
  const [customerRequests, setCustomerRequests] = useState([]);
  const [leadUnlocks, setLeadUnlocks] = useState([]);
  const [leadPrice, setLeadPrice] = useState(200);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userProperties, setUserProperties] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [paymentPlanFilter, setPaymentPlanFilter] = useState("all");
  const [paymentPlanOptions, setPaymentPlanOptions] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [leadView, setLeadView] = useState("inquiries");
  const [selectedLeadItem, setSelectedLeadItem] = useState(null);
  const [editingNotes, setEditingNotes] = useState(false);
  const [tempNotes, setTempNotes] = useState("");
  
  // Email state
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [emailTarget, setEmailTarget] = useState(null); // 'all', or user._id
  const [sendingEmail, setSendingEmail] = useState(false);

  const navigate = useNavigate();
  useBodyScrollLock(Boolean(selectedUser) || emailModalOpen || Boolean(selectedLeadItem));

  const overviewStats = [
    { key: "users", label: "Users", value: metrics.users || users.length || 0, icon: <UsersIcon className="h-5 w-5" /> },
    { key: "properties", label: "Properties", value: metrics.properties || propertyListings.length || 0, icon: <HomeModernIcon className="h-5 w-5" /> },
    { key: "payments", label: "Payments", value: metrics.payments || payments.length || 0, icon: <BanknotesIcon className="h-5 w-5" /> },
    { key: "leads", label: "Lead Requests", value: metrics.leads || leads.length || 0, icon: <TicketIcon className="h-5 w-5" /> },
  ];

  const exportToExcel = () => {
    const headers = ["Name", "Email", "Phone", "Address", "Role", "Status", "Plan", "Credits", "Prop Added", "Matches Sent", "Leads Bought", "Admin Notes", "Date Joined"];
    const rows = users.map(u => [
      u.name,
      u.email,
      u.phone || "-",
      u.address || "-",
      u.role,
      u.status || "active",
      u.activePlanName || "Free",
      u.activePlan?.leadCredits ?? u.leadCredits ?? 0,
      u.propertyStats?.total || 0,
      u.customerLeadStats?.got || 0,
      u.customerLeadStats?.bought || 0,
      u.adminNotes || "-",
      new Date(u.createdAt).toLocaleDateString("en-IN")
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.map(cell => `"${cell}"`).join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `registered_users_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [metricsRes, usersRes, paymentsRes, propertyRes, leadsRes, customerRequestsRes, leadUnlocksRes, leadPriceRes] = await Promise.allSettled([
        fetchAdminMetrics(token),
        fetchAdminUsers(token),
        fetchAdminPayments(token, {
          limit: 50,
          ...(paymentPlanFilter !== "all" ? { planId: paymentPlanFilter } : {}),
        }),
        fetchAdminPropertyApplications(token, { status: "all", limit: 100 }),
        fetchAdminLeads(token, { limit: 50 }),
        fetchAdminCustomerRequests(token, { limit: 50 }),
        fetchAdminLeadUnlocks(token, { limit: 50 }),
        fetchAdminLeadPrice(token),
      ]);

      if (metricsRes.status === "fulfilled") setMetrics(metricsRes.value);
      if (usersRes.status === "fulfilled") setUsers(usersRes.value.items || []);
      if (paymentsRes.status === "fulfilled") {
        setPayments(paymentsRes.value.items || []);
        setPaymentPlanOptions(paymentsRes.value.planOptions || []);
      }
      if (propertyRes.status === "fulfilled") setPropertyListings(propertyRes.value.items || []);
      if (leadsRes.status === "fulfilled") setLeads(leadsRes.value.items || []);
      if (customerRequestsRes.status === "fulfilled") setCustomerRequests(customerRequestsRes.value.items || []);
      if (leadUnlocksRes.status === "fulfilled") setLeadUnlocks(leadUnlocksRes.value.items || []);
      if (leadPriceRes.status === "fulfilled") setLeadPrice(Number(leadPriceRes.value.value || 200));
    } finally {
      setLoading(false);
    }
  }, [paymentPlanFilter, token]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (selectedUser) {
      fetchProperties({ ownerId: selectedUser._id, status: "all" }, token)
        .then((res) => setUserProperties(res.items || []))
        .catch(() => setUserProperties([]));
    } else {
      setUserProperties([]);
    }
  }, [selectedUser, token]);

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.phone && u.phone.includes(userSearch));
    
    const matchesRole = filterRole === "all" || u.role === filterRole;
    const matchesStatus = filterStatus === "all" || (u.status || "active") === filterStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const inquiryNewCount = leads.filter((item) => item.status === "pending").length;
  const customerRequestNewCount = customerRequests.filter((item) => item.status === "open").length;
  const leadUnlockNewCount = leadUnlocks.filter((item) => item.status === "created").length;
  const leadQueueCount = inquiryNewCount + customerRequestNewCount + leadUnlockNewCount;

  const tabs = useMemo(
    () => [
      { id: "overview", label: "Overview", icon: ChartBarIcon },
      { id: "users", label: "Users", icon: UsersIcon, badge: metrics.users || users.length || 0 },
      { id: "properties", label: "Properties", icon: HomeModernIcon, badge: propertyListings.length || metrics.properties || 0 },
      { id: "leads", label: "Requests & Leads", icon: ChatBubbleLeftRightIcon, badge: leadQueueCount || leads.length + customerRequests.length + leadUnlocks.length },
      { id: "payments", label: "Payments", icon: BanknotesIcon, badge: payments.length },
      { id: "settings", label: "Settings", icon: Cog6ToothIcon },
    ],
    [customerRequests.length, leadQueueCount, leadUnlocks.length, leads.length, metrics.properties, metrics.users, payments.length, propertyListings.length, users.length]
  );

  const leadViews = useMemo(
    () => [
      {
        id: "inquiries",
        label: "Inquiry Leads",
        total: leads.length,
        newCount: inquiryNewCount,
      },
      {
        id: "requirements",
        label: "Property Requests",
        total: customerRequests.length,
        newCount: customerRequestNewCount,
      },
      {
        id: "unlocks",
        label: "Lead Unlocks",
        total: leadUnlocks.length,
        newCount: leadUnlockNewCount,
      },
    ],
    [customerRequestNewCount, customerRequests.length, inquiryNewCount, leadUnlockNewCount, leadUnlocks.length, leads.length]
  );

  const openProperty = (property) => {
    navigate(getPropertyPath(property));
  };

  const onDeleteProperty = async (propertyId, propertyTitle) => {
    if (!window.confirm(`Delete "${propertyTitle}"? This action cannot be undone.`)) return;

    try {
      await deleteProperty(token, propertyId);
      toast.success("Property deleted");
      setPropertyListings((current) => current.filter((item) => item._id !== propertyId));
      setUserProperties((current) => current.filter((item) => item._id !== propertyId));
      load();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete property");
    }
  };

  const saveLeadPrice = async () => {
    try {
      await updateAdminLeadPrice(token, Number(leadPrice || 0));
      toast.success("Lead unlock price updated");
      load();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to update lead price");
    }
  };

  const onToggleUserStatus = async (user) => {
    const newStatus = user.status === "deactivated" ? "active" : "deactivated";
    if (!window.confirm(`Are you sure you want to ${newStatus} ${user.name}?`)) return;
    try {
      await toggleUserStatus(token, user._id, newStatus);
      toast.success(`User has been ${newStatus}`);
      setSelectedUser({ ...user, status: newStatus });
      load();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to change user status");
    }
  };

  const onDeleteUser = async (user) => {
    if (!window.confirm(`Are you sure you want to PERMANENTLY DELETE user "${user.name}"? This will delete all their listings, messages, and associated accounts. This action CANNOT be undone.`)) return;
    try {
      await deleteAdminUser(token, user._id);
      toast.success("User and associated data deleted");
      setSelectedUser(null);
      load();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete user");
    }
  };

  const onDeleteLeadItem = async (type, item) => {
    const itemName = type === "inquiries" 
      ? `Inquiry Lead from ${item.userId?.name || item.contactInfo?.name || "N/A"}`
      : type === "requirements"
        ? `Property Request from ${item.customerName || "N/A"}`
        : `Lead Unlock for ${item.customerId?.name || "N/A"}`;

    if (!window.confirm(`Are you sure you want to PERMANENTLY DELETE "${itemName}"? This action CANNOT be undone.`)) return;

    try {
      if (type === "inquiries") {
        await deleteAdminLead(token, item._id);
      } else if (type === "requirements") {
        await deleteAdminCustomerRequest(token, item._id);
      } else if (type === "unlocks") {
        await deleteAdminLeadUnlock(token, item._id);
      }
      toast.success("Item deleted successfully");
      setSelectedLeadItem(null);
      load();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete item");
    }
  };

  const onSaveNotes = async () => {
    try {
      await updateAdminUserNotes(token, selectedUser._id, tempNotes);
      toast.success("Notes saved");
      setSelectedUser({ ...selectedUser, adminNotes: tempNotes });
      setEditingNotes(false);
      load();
    } catch {
      toast.error("Failed to save notes");
    }
  };

  const openUserModal = (u) => {
    setSelectedUser(u);
    setTempNotes(u.adminNotes || "");
    setEditingNotes(false);
  };

  const openLeadModal = (type, item) => {
    setSelectedLeadItem({ type, item });
  };

  const openEmailModal = (target) => {
    setEmailTarget(target);
    setEmailSubject("");
    setEmailMessage("");
    setEmailModalOpen(true);
  };

  const onSendEmail = async (e) => {
    e.preventDefault();
    try {
      setSendingEmail(true);
      const payload = {
        subject: emailSubject,
        message: emailMessage,
        isBroadcast: emailTarget === "all",
        userIds: emailTarget === "all" ? [] : [emailTarget],
      };
      const res = await sendAdminEmail(token, payload);
      toast.success(res.message || "Email sent successfully!");
      setEmailModalOpen(false);
    } catch (error) {
      console.error(error);
      const errMsg = error.response?.data?.message || error.message || "Failed to send email";
      toast.error(errMsg);
    } finally {
      setSendingEmail(false);
    }
  };

  const activeLeadView = leadViews.find((item) => item.id === leadView) || leadViews[0];

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 pt-6">
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
          <Loader text="Loading admin dashboard..." />
        </div>
      </main>
    );
  }

  return (
    <>
    <DashboardSidebar
      title="Admin Panel"
      subtitle="Platform Control"
      description="Manage users, listings, leads, payments, and settings from one clean control center."
      rootClassName="md:h-full md:min-h-0 md:overflow-hidden"
      asideClassName="md:top-0 md:h-full md:overflow-hidden"
      mainClassName="md:h-full md:overflow-y-auto"
      contentClassName="md:space-y-0 md:flex md:h-full md:min-h-0 md:flex-col md:gap-6 md:overflow-hidden"
      hideLogo={true}
      stats={[
        { label: "Users", value: metrics.users || users.length || 0, icon: <UsersIcon className="h-4 w-4" /> },
        { label: "Posted Properties", value: propertyListings.length || metrics.properties || 0, icon: <HomeModernIcon className="h-4 w-4" /> },
        { label: "Payments", value: payments.length, icon: <BanknotesIcon className="h-4 w-4" /> },
        { label: "New Queue", value: leadQueueCount, icon: <TicketIcon className="h-4 w-4" /> },
      ]}
      navItems={tabs.map((tab) => ({
        key: tab.id,
        label: tab.label,
        icon: <tab.icon className="h-4 w-4" />,
        badge: tab.badge,
        active: activeTab === tab.id,
        onClick: setActiveTab,
      }))}
    >
        {activeTab === "overview" && (
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {overviewStats.map(({ key, label, value, icon }) => (
              <article key={key} className="dashboard-stat p-5 text-left">
                <div className="flex items-center gap-3 text-slate-700">
                  <div className="rounded-full bg-slate-100 p-2.5">
                    {icon}
                  </div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">{label}</p>
                </div>
                <p className="mt-5 text-4xl font-extrabold text-slate-900">{value}</p>
              </article>
            ))}
          </section>
        )}

        {activeTab === "settings" && (
          <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto pr-1">
            <section className="dashboard-shell p-5">
              <h2 className="text-lg font-bold text-slate-900">Lead Unlock Pricing Control</h2>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <input
                  type="number"
                  min="0"
                  className="soft-input w-44 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={leadPrice}
                  onChange={(e) => setLeadPrice(e.target.value)}
                />
                <button onClick={saveLeadPrice} className="dashboard-primary px-6 py-2 text-sm">
                  Save Price
                </button>
                <span className="text-sm text-slate-600">Default is Rs. 200 per lead lock.</span>
              </div>
            </section>
            <PropertyPostingForm heading="Post Live Property (Admin)" onSuccess={load} />
          </div>
        )}

        {activeTab === "users" && (
          <article className="dashboard-shell relative flex min-h-0 flex-1 flex-col p-6">
            <div className="mb-4 space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="inline-flex items-center gap-2 text-lg font-bold text-slate-900"><UsersIcon className="h-5 w-5 text-slate-700" />Registered Users ({metrics.users || users.length})</h2>
                <div className="flex gap-2">
                  <button onClick={() => openEmailModal("all")} className="dashboard-primary px-3 py-2 text-xs">
                    <EnvelopeIcon className="h-4 w-4" />
                    Broadcast Email
                  </button>
                  <button onClick={exportToExcel} className="dashboard-secondary px-3 py-2 text-xs">
                    <ArrowDownTrayIcon className="h-4 w-4" />
                    Export CSV
                  </button>
                </div>
              </div>
              <div className="flex w-full flex-col gap-2 sm:flex-row">
                <input 
                  type="text" 
                  placeholder="Filter users by name, email or phone..." 
                  className="dashboard-control flex-1 text-sm"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all ${showFilters ? "dashboard-primary" : "dashboard-secondary"}`}
                >
                  <AdjustmentsHorizontalIcon className="h-4 w-4" />
                  Filter
                </button>
              </div>

              {showFilters && (
                <div className="dashboard-subpanel flex flex-wrap gap-3 p-4">
                  <div className="min-w-[120px] flex-1">
                    <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Filter by Role</label>
                    <select 
                      className="dashboard-control text-sm"
                      value={filterRole}
                      onChange={(e) => setFilterRole(e.target.value)}
                    >
                      <option value="all">All Roles</option>
                      <option value="customer">Customer</option>
                      <option value="seller">Seller</option>
                      <option value="agent">Agent / Media</option>
                      <option value="broker">Developer</option>
                      <option value="builder">Builder</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="min-w-[120px] flex-1">
                    <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Filter by Status</label>
                    <select 
                      className="dashboard-control text-sm"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="deactivated">Deactivated</option>
                    </select>
                  </div>
                  <button 
                    onClick={() => { setFilterRole("all"); setFilterStatus("all"); setUserSearch(""); }}
                    className="self-end px-2 py-1 text-[10px] font-bold text-slate-500 hover:text-slate-900"
                  >
                    Clear All
                  </button>
                </div>
              )}
            </div>
            <div className="min-h-0 overflow-y-auto rounded-[1.5rem] border border-slate-200/70">
              <table className="dashboard-table min-w-full text-left text-sm">
                <thead className="whitespace-nowrap">
                  <tr>
                    <th>Name / Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u._id} className="align-top transition">
                      <td>
                        <p className="font-semibold">{u.name}</p>
                        <p className="text-xs text-slate-500">{u.email}</p>
                      </td>
                      <td className="capitalize">{u.role}</td>
                      <td>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${u.status === "deactivated" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                          {u.status || "active"}
                        </span>
                      </td>
                      <td className="text-right">
                        <button onClick={() => openUserModal(u)} className="dashboard-secondary px-3 py-1 text-xs">
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        )}

        {activeTab === "payments" && (
          <article className="dashboard-shell flex min-h-0 flex-1 flex-col p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Platform Payments</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Filter payments by purchased plan to review who bought each package faster.
                </p>
              </div>
              <label className="block text-sm text-slate-700">
                <span className="mb-1 block font-medium">Filter by plan</span>
                <select
                  value={paymentPlanFilter}
                  onChange={(event) => setPaymentPlanFilter(event.target.value)}
                  className="min-w-[220px] rounded-xl border border-clay bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                >
                  <option value="all">All plans</option>
                  {paymentPlanOptions.map((plan) => (
                    <option key={plan._id} value={plan._id}>
                      {plan.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="mt-3 min-h-0 overflow-y-auto rounded-[1.5rem] border border-slate-200/70 text-sm">
              <table className="dashboard-table min-w-full text-left">
                <thead className="whitespace-nowrap">
                  <tr className="border-b border-clay">
                    <th className="py-2">User</th>
                    <th className="py-2">Plan</th>
                    <th className="py-2">Amount</th>
                    <th className="py-2">Status</th>
                    <th className="py-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p._id} className="border-b border-clay/60 align-top">
                      <td className="py-2">{p.userId?.name || "Unknown"}</td>
                      <td className="py-2 font-semibold">{p.planId?.name || "Unknown Plan"}</td>
                      <td className="py-2">Rs. {p.amount || 0}</td>
                      <td className="py-2 capitalize font-semibold">{p.status}</td>
                      <td className="py-2">{new Date(p.createdAt).toLocaleDateString("en-IN")}</td>
                    </tr>
                  ))}
                  {payments.length === 0 && (
                    <tr>
                      <td colSpan="5" className="py-6 text-center text-sm text-slate-500">
                        No payments found for the selected plan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </article>
        )}

        {activeTab === "properties" && (
          <section className="dashboard-shell flex min-h-0 flex-1 flex-col p-6">
            <h2 className="text-lg font-bold text-slate-900">Posted Properties</h2>
            <p className="mt-1 text-sm text-slate-600">
              Properties go live as soon as users publish them. Open any listing to review it, see who posted it, or delete it from the platform.
            </p>
            <div className="mt-3 min-h-0 overflow-y-auto rounded-[1.5rem] border border-slate-200/70">
              <table className="dashboard-table min-w-full text-left text-sm">
                <thead className="whitespace-nowrap">
                  <tr className="border-b border-clay">
                    <th className="py-2">Image</th>
                    <th className="py-2">Property</th>
                    <th className="py-2">Location</th>
                    <th className="py-2">Posted By</th>
                    <th className="py-2">Status</th>
                    <th className="py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {propertyListings.map((p) => (
                    <tr key={p._id} className="border-b border-clay/60 align-middle">
                      <td className="py-2">
                        <button type="button" onClick={() => openProperty(p)} className="block">
                          <img
                            src={p.images?.[0] || PROPERTY_PLACEHOLDER_IMAGE}
                            alt={getPropertyImageAlt(p)}
                            className="h-12 w-12 rounded-md border border-clay object-cover"
                            loading="lazy"
                            decoding="async"
                          />
                        </button>
                      </td>
                      <td className="py-2">
                        <button type="button" onClick={() => openProperty(p)} className="text-left transition hover:text-ink">
                          <p className="font-medium">{p.title}</p>
                          <p className="text-xs text-ink/65">
                            Rs. {Number(p.price || 0).toLocaleString("en-IN")} · {p.propertyType || "Property"} · {p.listingType || "sale"}
                          </p>
                          <p className="text-xs text-ink/50">Posted {new Date(p.createdAt).toLocaleDateString("en-IN")}</p>
                        </button>
                      </td>
                      <td className="py-2 text-ink/70">
                        <p>{p.location?.city || "-"}</p>
                        <p className="text-xs text-ink/50">{p.location?.area || "-"}</p>
                      </td>
                      <td className="py-2 text-ink/70">
                        <p className="font-medium text-ink">{p.ownerId?.name || "Unknown"}</p>
                        <p className="text-xs">{p.ownerId?.email || "No email"}</p>
                        <p className="text-xs capitalize">{p.ownerType || p.ownerId?.role || "user"}</p>
                      </td>
                      <td className="py-2">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
                          p.status === "approved"
                            ? "bg-green-100 text-green-700"
                            : p.status === "pending"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-red-100 text-red-700"
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="py-2 text-right">
                        <div className="flex flex-wrap justify-end gap-2">
                          <button onClick={() => openProperty(p)} className="rounded-md border border-clay bg-white px-3 py-1 text-xs font-semibold hover:bg-stone">
                            View
                          </button>
                          <button
                            onClick={() => onDeleteProperty(p._id, p.title)}
                            className="rounded-md bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {propertyListings.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-ink/50">No properties posted yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === "leads" && (
          <section className="dashboard-shell flex min-h-0 flex-1 flex-col p-6">
            <div className="border-b border-slate-200 pb-5">
              <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Requests & Leads Queue</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Review inquiry leads, property requests, and unlock activity from one fixed admin queue.
                  </p>
                </div>
                <div className="dashboard-chip">
                  {leadQueueCount} new / active items
                </div>
              </div>

              <div className="mt-4 grid gap-3 lg:grid-cols-3">
                {leadViews.map((view) => (
                  <button
                    key={view.id}
                    type="button"
                    onClick={() => setLeadView(view.id)}
                    className={`rounded-[1.35rem] border px-4 py-4 text-left transition ${
                      leadView === view.id
                        ? "border-slate-900 bg-[rgba(255,244,227,0.82)] shadow-[0_14px_28px_rgba(0,66,162,0.08)]"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{view.label}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {view.newCount > 0 ? `${view.newCount} new in queue` : "No new items right now"}
                        </p>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-extrabold ${
                        leadView === view.id ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"
                      }`}>
                        {view.total}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 flex min-h-0 flex-1 flex-col overflow-hidden">
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{activeLeadView.label}</h3>
                  <p className="text-sm text-slate-500">
                    Showing {activeLeadView.total} item{activeLeadView.total === 1 ? "" : "s"} with {activeLeadView.newCount} new / open.
                  </p>
                </div>
              </div>

              <div className="min-h-0 space-y-3 overflow-y-auto pr-1">
                {leadView === "inquiries" &&
                  (leads.length ? (
                    leads.map((item) => (
                      <article key={item._id} className="dashboard-subpanel rounded-[1.25rem] px-4 py-3">
                        <div className="grid gap-3 lg:grid-cols-[1.2fr_0.95fr_0.95fr_0.7fr_auto] lg:items-center">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-slate-900">{item.propertyId?.title || "Property not available"}</p>
                            <p className="mt-1 truncate text-xs text-slate-500">
                              {item.propertyId?.location?.city || "-"}{item.propertyId?.location?.area ? `, ${item.propertyId.location.area}` : ""}
                            </p>
                          </div>
                          <div className="min-w-0">
                            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Customer</p>
                            <p className="truncate text-sm font-semibold text-slate-900">{item.userId?.name || item.contactInfo?.name || "N/A"}</p>
                            <p className="truncate text-xs text-slate-500">{item.userId?.email || item.contactInfo?.email || "No email"}</p>
                          </div>
                          <div className="min-w-0">
                            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Posted By</p>
                            <p className="truncate text-sm font-semibold text-slate-900">{item.ownerId?.name || "N/A"}</p>
                            <p className="truncate text-xs text-slate-500">{item.ownerId?.email || "No email"}</p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
                              item.status === "approved"
                                ? "bg-green-100 text-green-700"
                                : item.status === "rejected"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-amber-100 text-amber-700"
                            }`}>
                              {item.status}
                            </span>
                            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{item.intentType}</span>
                          </div>
                          <div className="flex items-center justify-start gap-2 lg:justify-end">
                            <button onClick={() => openLeadModal("inquiries", item)} className="dashboard-secondary px-4 py-2 text-xs">
                              View
                            </button>
                          </div>
                        </div>
                      </article>
                    ))
                  ) : (
                    <div className="dashboard-empty px-6 py-10 text-center text-sm">No inquiry leads found.</div>
                  ))}

                {leadView === "requirements" &&
                  (customerRequests.length ? (
                    customerRequests.map((item) => (
                      <article key={item._id} className="dashboard-subpanel rounded-[1.25rem] px-4 py-3">
                        <div className="grid gap-3 lg:grid-cols-[1fr_1fr_1.15fr_0.7fr_auto] lg:items-center">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-slate-900">{formatCustomerRequestLabel(item)}</p>
                            <p className="mt-1 truncate text-xs uppercase tracking-[0.12em] text-slate-400">
                              {(item.requestCategory || "property_buy").replaceAll("_", " ")}
                            </p>
                          </div>
                          <div className="min-w-0">
                            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Customer</p>
                            <p className="truncate text-sm font-semibold text-slate-900">{item.customerName}</p>
                            <p className="truncate text-xs text-slate-500">{item.contactDetails?.email || "No email"}</p>
                          </div>
                          <div className="min-w-0">
                            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Budget / Location</p>
                            <p className="truncate text-sm font-semibold text-slate-900">
                              {item.budgetMin || item.budgetMax ? `Rs. ${item.budgetMin || 0} - Rs. ${item.budgetMax || 0}` : "Budget not shared"}
                            </p>
                            <p className="truncate text-xs text-slate-500">{item.location?.city || "-"}{item.location?.area ? `, ${item.location.area}` : ""}</p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
                              item.status === "closed"
                                ? "bg-green-100 text-green-700"
                                : item.status === "matched"
                                  ? "bg-sky-100 text-sky-700"
                                  : "bg-amber-100 text-amber-700"
                            }`}>
                              {item.status}
                            </span>
                            <span className="text-xs text-slate-500">{item.matchedAgents?.length || 0} matched</span>
                          </div>
                          <div className="flex items-center justify-start gap-2 lg:justify-end">
                            <button onClick={() => openLeadModal("requirements", item)} className="dashboard-secondary px-4 py-2 text-xs">
                              View
                            </button>
                          </div>
                        </div>
                      </article>
                    ))
                  ) : (
                    <div className="dashboard-empty px-6 py-10 text-center text-sm">No customer property requests found.</div>
                  ))}

                {leadView === "unlocks" &&
                  (leadUnlocks.length ? (
                    leadUnlocks.map((item) => (
                      <article key={item._id} className="dashboard-subpanel rounded-[1.25rem] px-4 py-3">
                        <div className="grid gap-3 lg:grid-cols-[0.95fr_0.95fr_0.9fr_1.1fr_auto] lg:items-center">
                          <div className="min-w-0">
                            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Agent</p>
                            <p className="truncate text-sm font-semibold text-slate-900">{item.agentId?.name || "N/A"}</p>
                            <p className="truncate text-xs text-slate-500">{item.agentId?.email || "No email"}</p>
                          </div>
                          <div className="min-w-0">
                            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Customer</p>
                            <p className="truncate text-sm font-semibold text-slate-900">{item.customerId?.name || "N/A"}</p>
                            <p className="truncate text-xs text-slate-500">{item.customerId?.email || "No email"}</p>
                          </div>
                          <div className="min-w-0">
                            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Amount</p>
                            <p className="text-sm font-semibold text-slate-900">Rs. {item.amount}</p>
                            <p className="truncate text-xs text-slate-500">{item.gateway || "gateway"}</p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
                              item.status === "paid"
                                ? "bg-green-100 text-green-700"
                                : item.status === "failed"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-amber-100 text-amber-700"
                            }`}>
                              {item.status}
                            </span>
                            <span className="truncate text-xs text-slate-500">
                              {item.customerRequestId?.propertyType || "Property"} - {item.customerRequestId?.location?.city || "-"}
                            </span>
                          </div>
                          <div className="flex items-center justify-start gap-2 lg:justify-end">
                            <button onClick={() => openLeadModal("unlocks", item)} className="dashboard-secondary px-4 py-2 text-xs">
                              View
                            </button>
                          </div>
                        </div>
                      </article>
                    ))
                  ) : (
                    <div className="dashboard-empty px-6 py-10 text-center text-sm">No lead unlock records found.</div>
                  ))}
              </div>
            </div>
          </section>
        )}
    </DashboardSidebar>

      {/* View User Modal Overlay */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-0 transition-opacity sm:items-center sm:p-4">
          <div className="modal-panel-white dashboard-modal flex max-h-[90dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[2rem] sm:max-h-[calc(100dvh-2rem)] sm:rounded-[2rem]" style={{ background: "#ffffff" }}>
            <div className="flex items-center justify-between border-b border-slate-200/80 px-5 py-5">
              <h3 className="dashboard-display text-2xl font-semibold">User Details</h3>
              <button onClick={() => setSelectedUser(null)} className="text-slate-400 transition hover:text-slate-900">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-5 overflow-y-auto p-5 sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xl font-extrabold">{selectedUser.name}</p>
                  <p className="text-sm text-ink/70">{selectedUser.email}</p>
                  <p className="text-sm text-ink/70">{selectedUser.phone || "No phone provided"}</p>
                  <p className="text-sm text-ink/70">{selectedUser.address || "No address provided"}</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-slate-600">{selectedUser.role}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${selectedUser.status === "deactivated" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                  {selectedUser.status || "active"}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 border-t border-slate-200 pt-4 text-sm sm:grid-cols-2">
                <div className="dashboard-subpanel p-3">
                  <p className="mb-1 text-xs text-ink/60">Active Plan</p>
                  <p className="font-semibold">{selectedUser.activePlanName || "Free Plan"}</p>
                  <p className="mt-0.5 text-[10px] text-ink/60">{selectedUser.activePlan?.expiresAt ? `Valid till ${new Date(selectedUser.activePlan.expiresAt).toLocaleDateString("en-IN")}` : "No expiry"}</p>
                </div>
                <div className="dashboard-subpanel p-3">
                  <p className="mb-1 text-xs text-ink/60">Properties (Total: {selectedUser.propertyStats?.total || 0})</p>
                  <p className="text-xs font-semibold text-slate-900">Live: {selectedUser.propertyStats?.approved || 0}</p>
                  <p className="mt-0.5 text-xs font-semibold text-amber-600">Pending/Other: {selectedUser.propertyStats?.pending || 0}</p>
                </div>
              </div>

              {["agent", "broker"].includes(selectedUser.role) && (
                <div className="dashboard-subpanel p-3 text-sm">
                  <p className="mb-1 text-xs text-ink/60">Agent Lead Pipeline</p>
                  <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                    <p>Total Matches Sent: <span className="font-bold">{selectedUser.customerLeadStats?.got || 0}</span></p>
                    <p>Total Leads Unlocked: <span className="font-bold text-slate-900">{selectedUser.customerLeadStats?.bought || 0}</span></p>
                  </div>
                </div>
              )}

              <div className="dashboard-subpanel p-3 text-sm">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs text-ink/60">Admin Notes (Private)</p>
                  {!editingNotes ? (
                    <button onClick={() => setEditingNotes(true)} className="text-[10px] font-bold text-slate-700 hover:underline">Edit</button>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={() => { setEditingNotes(false); setTempNotes(selectedUser.adminNotes || ""); }} className="text-[10px] font-bold text-ink/60 hover:underline">Cancel</button>
                      <button onClick={onSaveNotes} className="text-[10px] font-bold text-slate-700 hover:underline">Save</button>
                    </div>
                  )}
                </div>
                {!editingNotes ? (
                  <p className="whitespace-pre-wrap text-sm text-ink">{selectedUser.adminNotes || <span className="italic text-ink/40">No notes added.</span>}</p>
                ) : (
                  <textarea
                    className="dashboard-control min-h-[110px]"
                    rows={3}
                    value={tempNotes}
                    onChange={(e) => setTempNotes(e.target.value)}
                    placeholder="Add details about this member here..."
                  />
                )}
              </div>

              <div className="mt-4">
                <p className="mb-2 text-xs font-bold uppercase tracking-tight text-ink/60">Properties Posted by {selectedUser.name}</p>
                {userProperties.length > 0 ? (
                  <div className="thin-scrollbar max-h-48 space-y-2 overflow-y-auto pr-1">
                    {userProperties.map((p) => (
                      <div key={p._id} className="dashboard-subpanel flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="max-w-[180px] truncate text-xs font-bold">{p.title}</p>
                          <p className="text-[10px] text-ink/50">Rs. {Number(p.price || 0).toLocaleString("en-IN")}</p>
                          <p className="text-[10px] text-ink/60">{p.location?.city} - {p.status}</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => { setSelectedUser(null); openProperty(p); }} className="dashboard-secondary px-2 py-1 text-[10px]">
                            View Property
                          </button>
                          <button onClick={() => onDeleteProperty(p._id, p.title)} className="rounded-md bg-red-600 px-2 py-1 text-[10px] font-bold text-white hover:bg-red-700">
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="py-2 text-xs italic text-ink/50">This user hasn&apos;t posted any properties yet.</p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-4 border-t border-slate-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="flex-1 text-xs text-ink/60">
                {selectedUser.status === "deactivated"
                  ? "User is currently restricted from logging in and accessing the platform."
                  : "If this user is cheating or misbehaving, you can deactivate their account."}
              </p>
              <div className="flex gap-2">
                <button onClick={() => { setSelectedUser(null); openEmailModal(selectedUser._id); }} className="dashboard-secondary px-4 py-2 text-sm">
                  Send Email
                </button>
                <button
                  onClick={() => onToggleUserStatus(selectedUser)}
                  className={`rounded-lg px-4 py-2 text-sm font-bold shadow transition ${selectedUser.status === "deactivated" ? "bg-slate-900 text-white hover:opacity-90" : "bg-red-600 text-white hover:bg-red-700"}`}
                >
                  {selectedUser.status === "deactivated" ? "Reactivate User" : "Deactivate User"}
                </button>
                <button
                  onClick={() => onDeleteUser(selectedUser)}
                  className="rounded-lg bg-red-800 px-4 py-2 text-sm font-bold text-white shadow transition hover:bg-red-900"
                >
                  Delete User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedLeadItem && (
        <div className="fixed inset-0 z-[55] flex items-end justify-center bg-slate-950/50 p-0 transition-opacity sm:items-center sm:p-4">
          <div className="modal-panel-white dashboard-modal flex max-h-[90dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-[2rem] sm:max-h-[calc(100dvh-2rem)] sm:rounded-[2rem]" style={{ background: "#ffffff" }}>
            <div className="flex items-center justify-between border-b border-slate-200/80 px-5 py-5">
              <div>
                <h3 className="dashboard-display text-2xl font-semibold">
                  {selectedLeadItem.type === "inquiries"
                    ? "Inquiry Lead Details"
                    : selectedLeadItem.type === "requirements"
                      ? "Property Request Details"
                      : "Lead Unlock Details"}
                </h3>
                <p className="mt-1 text-sm text-slate-500">Full record view for admin review.</p>
              </div>
              <button onClick={() => setSelectedLeadItem(null)} className="text-slate-400 transition hover:text-slate-900">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-5 overflow-y-auto p-5 sm:p-6">
              {selectedLeadItem.type === "inquiries" && (
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
                      selectedLeadItem.item.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : selectedLeadItem.item.status === "rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                    }`}>
                      {selectedLeadItem.item.status}
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                      {selectedLeadItem.item.intentType}
                    </span>
                    <span className="text-xs text-slate-500">{formatAdminDate(selectedLeadItem.item.createdAt)}</span>
                  </div>

                  <div className="dashboard-subpanel p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Property</p>
                    <p className="mt-2 text-lg font-bold text-slate-900">{selectedLeadItem.item.propertyId?.title || "Property not available"}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {selectedLeadItem.item.propertyId?.location?.city || "-"}
                      {selectedLeadItem.item.propertyId?.location?.area ? `, ${selectedLeadItem.item.propertyId.location.area}` : ""}
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="dashboard-subpanel p-4">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Customer</p>
                      <p className="mt-2 font-semibold text-slate-900">{selectedLeadItem.item.userId?.name || selectedLeadItem.item.contactInfo?.name || "N/A"}</p>
                      <p className="text-sm text-slate-600">{selectedLeadItem.item.userId?.email || selectedLeadItem.item.contactInfo?.email || "No email"}</p>
                      <p className="text-sm text-slate-600">{selectedLeadItem.item.userId?.phone || selectedLeadItem.item.contactInfo?.phone || "No phone"}</p>
                    </div>
                    <div className="dashboard-subpanel p-4">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Posted By</p>
                      <p className="mt-2 font-semibold text-slate-900">{selectedLeadItem.item.ownerId?.name || "N/A"}</p>
                      <p className="text-sm text-slate-600">{selectedLeadItem.item.ownerId?.email || "No email"}</p>
                      <p className="text-sm text-slate-600">{selectedLeadItem.item.ownerId?.phone || "No phone"}</p>
                    </div>
                  </div>

                  <div className="dashboard-subpanel p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Message</p>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                      {selectedLeadItem.item.contactInfo?.message || "No message shared."}
                    </p>
                  </div>
                </>
              )}

              {selectedLeadItem.type === "requirements" && (
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
                      selectedLeadItem.item.status === "closed"
                        ? "bg-green-100 text-green-700"
                        : selectedLeadItem.item.status === "matched"
                          ? "bg-sky-100 text-sky-700"
                          : "bg-amber-100 text-amber-700"
                    }`}>
                      {selectedLeadItem.item.status}
                    </span>
                    <span className="text-xs text-slate-500">{formatAdminDate(selectedLeadItem.item.createdAt)}</span>
                  </div>

                  <div className="dashboard-subpanel p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Requirement</p>
                    <p className="mt-2 text-lg font-bold text-slate-900">{formatCustomerRequestLabel(selectedLeadItem.item)}</p>
                    <p className="mt-1 text-sm uppercase tracking-[0.12em] text-slate-400">
                      {(selectedLeadItem.item.requestCategory || "property_buy").replaceAll("_", " ")}
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="dashboard-subpanel p-4">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Customer</p>
                      <p className="mt-2 font-semibold text-slate-900">{selectedLeadItem.item.customerName}</p>
                      <p className="text-sm text-slate-600">{selectedLeadItem.item.contactDetails?.email || "No email"}</p>
                      <p className="text-sm text-slate-600">{selectedLeadItem.item.contactDetails?.phone || "No phone"}</p>
                    </div>
                    <div className="dashboard-subpanel p-4">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Budget / Location</p>
                      <p className="mt-2 font-semibold text-slate-900">
                        {selectedLeadItem.item.budgetMin || selectedLeadItem.item.budgetMax
                          ? `Rs. ${selectedLeadItem.item.budgetMin || 0} - Rs. ${selectedLeadItem.item.budgetMax || 0}`
                          : "Budget not shared"}
                      </p>
                      <p className="text-sm text-slate-600">
                        {selectedLeadItem.item.location?.city || "-"}
                        {selectedLeadItem.item.location?.area ? `, ${selectedLeadItem.item.location.area}` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="dashboard-subpanel p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Additional Requirements</p>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                      {selectedLeadItem.item.additionalRequirements || "No additional notes provided."}
                    </p>
                    <p className="mt-3 text-xs text-slate-500">{selectedLeadItem.item.matchedAgents?.length || 0} matched agents</p>
                  </div>
                </>
              )}

              {selectedLeadItem.type === "unlocks" && (
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
                      selectedLeadItem.item.status === "paid"
                        ? "bg-green-100 text-green-700"
                        : selectedLeadItem.item.status === "failed"
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                    }`}>
                      {selectedLeadItem.item.status}
                    </span>
                    <span className="text-xs text-slate-500">{formatAdminDate(selectedLeadItem.item.createdAt)}</span>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="dashboard-subpanel p-4">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Agent</p>
                      <p className="mt-2 font-semibold text-slate-900">{selectedLeadItem.item.agentId?.name || "N/A"}</p>
                      <p className="text-sm text-slate-600">{selectedLeadItem.item.agentId?.email || "No email"}</p>
                    </div>
                    <div className="dashboard-subpanel p-4">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Customer</p>
                      <p className="mt-2 font-semibold text-slate-900">{selectedLeadItem.item.customerId?.name || "N/A"}</p>
                      <p className="text-sm text-slate-600">{selectedLeadItem.item.customerId?.email || "No email"}</p>
                    </div>
                    <div className="dashboard-subpanel p-4">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Payment</p>
                      <p className="mt-2 font-semibold text-slate-900">Rs. {selectedLeadItem.item.amount}</p>
                      <p className="text-sm text-slate-600">{selectedLeadItem.item.gateway || "gateway"}</p>
                    </div>
                  </div>

                  <div className="dashboard-subpanel p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Linked Request</p>
                    <p className="mt-2 text-sm text-slate-600">
                      {selectedLeadItem.item.customerRequestId?.propertyType || "Property"} in {selectedLeadItem.item.customerRequestId?.location?.city || "-"}
                      {selectedLeadItem.item.customerRequestId?.location?.area ? `, ${selectedLeadItem.item.customerRequestId.location.area}` : ""}
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                      {selectedLeadItem.item.customerRequestId?.budgetMin || selectedLeadItem.item.customerRequestId?.budgetMax
                        ? `Rs. ${selectedLeadItem.item.customerRequestId?.budgetMin || 0} - Rs. ${selectedLeadItem.item.customerRequestId?.budgetMax || 0}`
                        : "Budget not shared"}
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-500">Use this popup to review full details without leaving the admin queue.</p>
              <div className="flex gap-2">
                {selectedLeadItem.type === "inquiries" && selectedLeadItem.item.propertyId ? (
                  <button
                    onClick={() => {
                      setSelectedLeadItem(null);
                      openProperty(selectedLeadItem.item.propertyId);
                    }}
                    className="dashboard-secondary px-4 py-2 text-sm"
                  >
                    Open Property
                  </button>
                ) : null}
                <button
                  onClick={() => onDeleteLeadItem(selectedLeadItem.type, selectedLeadItem.item)}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 transition"
                >
                  Delete Item
                </button>
                <button onClick={() => setSelectedLeadItem(null)} className="dashboard-primary px-4 py-2 text-sm">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {emailModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-950/50 p-0 sm:items-center sm:p-4">
          <div className="modal-panel-white dashboard-modal flex max-h-[90dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-[2rem] sm:max-h-[calc(100dvh-2rem)] sm:rounded-[2rem]" style={{ background: "#ffffff" }}>
            <div className="flex items-center justify-between border-b border-slate-200/80 px-6 pb-4 pt-6">
              <h2 className="dashboard-display text-2xl font-semibold">{emailTarget === "all" ? "Broadcast Email to All" : "Send Email to User"}</h2>
              <button onClick={() => setEmailModalOpen(false)} className="text-slate-400 transition hover:text-slate-900">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={onSendEmail} className="mt-6 flex flex-col gap-4 overflow-y-auto p-6">
              <div>
                <label className="mb-1 block text-sm font-bold text-ink">Subject</label>
                <input
                  type="text"
                  required
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="dashboard-control"
                  placeholder="Enter email subject"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-bold text-ink">Message</label>
                <textarea
                  required
                  rows={6}
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  className="dashboard-control min-h-[170px]"
                  placeholder="Type your message here... (HTML tags like <br/> or <b> are supported internally)"
                />
              </div>
              <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => setEmailModalOpen(false)} className="dashboard-secondary px-4 py-2 text-sm">
                  Cancel
                </button>
                <button type="submit" disabled={sendingEmail} className="dashboard-primary px-6 py-2 text-sm disabled:opacity-70">
                  {sendingEmail ? "Sending..." : "Send Email"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminDashboardPage;
