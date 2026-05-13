import { useCallback, useEffect, useState } from "react";
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
} from "../services/api/adminApi";
import toast from "react-hot-toast";
import PropertyPostingForm from "../components/PropertyPostingForm";
import DashboardSidebar from "../components/DashboardSidebar";
import { deleteProperty, fetchProperties } from "../services/api/propertyApi";
import { PROPERTY_PLACEHOLDER_IMAGE } from "../constants/propertyMedia";
import { 
  UsersIcon,
  ChartBarIcon,
  HomeModernIcon,
  BanknotesIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
  FunnelIcon
} from "@heroicons/react/24/outline";

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
  const [activeTab, setActiveTab] = useState("overview");
  const [editingNotes, setEditingNotes] = useState(false);
  const [tempNotes, setTempNotes] = useState("");
  
  // Email state
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [emailTarget, setEmailTarget] = useState(null); // 'all', or user._id
  const [sendingEmail, setSendingEmail] = useState(false);

  const navigate = useNavigate();
  const tabs = [
    { id: "overview", label: "Overview", icon: ChartBarIcon },
    { id: "users", label: "Users", icon: UsersIcon },
    { id: "properties", label: "Properties", icon: HomeModernIcon },
    { id: "leads", label: "Requests & Leads", icon: ChatBubbleLeftRightIcon },
    { id: "payments", label: "Payments", icon: BanknotesIcon },
    { id: "settings", label: "Settings", icon: Cog6ToothIcon },
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
        fetchAdminPayments(token),
        fetchAdminPropertyApplications(token, { status: "all", limit: 100 }),
        fetchAdminLeads(token, { limit: 50 }),
        fetchAdminCustomerRequests(token, { limit: 50 }),
        fetchAdminLeadUnlocks(token, { limit: 50 }),
        fetchAdminLeadPrice(token),
      ]);

      if (metricsRes.status === "fulfilled") setMetrics(metricsRes.value);
      if (usersRes.status === "fulfilled") setUsers(usersRes.value.items || []);
      if (paymentsRes.status === "fulfilled") setPayments(paymentsRes.value.items || []);
      if (propertyRes.status === "fulfilled") setPropertyListings(propertyRes.value.items || []);
      if (leadsRes.status === "fulfilled") setLeads(leadsRes.value.items || []);
      if (customerRequestsRes.status === "fulfilled") setCustomerRequests(customerRequestsRes.value.items || []);
      if (leadUnlocksRes.status === "fulfilled") setLeadUnlocks(leadUnlocksRes.value.items || []);
      if (leadPriceRes.status === "fulfilled") setLeadPrice(Number(leadPriceRes.value.value || 200));
    } finally {
      setLoading(false);
    }
  }, [token]);

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

  const openProperty = (propertyId) => {
    navigate(`/property/${propertyId}`);
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
      stats={[
        { label: "Users", value: metrics.users || users.length || 0 },
        { label: "Posted Properties", value: propertyListings.length || metrics.properties || 0 },
        { label: "Payments", value: payments.length },
        { label: "Lead Requests", value: leads.length },
      ]}
      navItems={tabs.map((tab) => ({
        key: tab.id,
        label: tab.label,
        icon: <tab.icon className="h-4 w-4" />,
        active: activeTab === tab.id,
        onClick: setActiveTab,
      }))}
    >
        {activeTab === "overview" && (
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(metrics).map(([k, v]) => (
              <article key={k} className="dashboard-stat p-4 text-center">
                <p className="text-sm capitalize text-slate-500">{k.replace(/([A-Z])/g, ' $1').trim()}</p>
                <p className="mt-1 text-3xl font-extrabold text-slate-900">{v}</p>
              </article>
            ))}
          </section>
        )}

        {activeTab === "settings" && (
          <div className="space-y-6">
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
          <article className="dashboard-shell relative p-6">
            <div className="mb-4 space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="inline-flex items-center gap-2 text-lg font-bold"><UsersIcon className="h-5 w-5 text-sage" />Registered Users ({metrics.users || users.length})</h2>
                <div className="flex gap-2">
                  <button onClick={() => openEmailModal("all")} className="rounded-lg bg-ink px-3 py-1.5 text-xs text-white shadow-soft hover:bg-[#8b6b3f]">
                    📧 Broadcast Email
                  </button>
                  <button onClick={exportToExcel} className="rounded-lg bg-green-600 px-3 py-1.5 text-xs text-white hover:bg-green-700 shadow-soft">
                    📥 Export CSV
                  </button>
                </div>
              </div>
              <div className="flex w-full flex-col gap-2 sm:flex-row">
                <input 
                  type="text" 
                  placeholder="Filter users by name, email or phone..." 
                  className="soft-input flex-1 rounded-xl px-4 py-2 text-xs md:text-sm border-2 border-clay/40 focus:border-sage transition-all"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className={`rounded-xl border-2 px-3 py-2 transition-all flex items-center gap-1.5 text-xs font-bold ${showFilters ? "bg-sage border-sage text-white" : "border-clay/40 text-ink/70 bg-white hover:bg-stone"}`}
                >
                  <FunnelIcon className="h-4 w-4" />
                  Filter
                </button>
              </div>

              {showFilters && (
                <div className="flex flex-wrap gap-2 animate-fade-in p-3 bg-stone/50 rounded-xl border border-clay/30">
                  <div className="flex-1 min-w-[120px]">
                    <label className="block text-[10px] font-bold text-ink/60 uppercase mb-1">Filter by Role</label>
                    <select 
                      className="w-full rounded-lg border border-clay/60 px-2 py-1.5 text-xs bg-white"
                      value={filterRole}
                      onChange={(e) => setFilterRole(e.target.value)}
                    >
                      <option value="all">All Roles</option>
                      <option value="customer">Customer</option>
                      <option value="seller">Seller</option>
                      <option value="agent">Agent</option>
                      <option value="broker">Broker</option>
                      <option value="builder">Builder</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="flex-1 min-w-[120px]">
                    <label className="block text-[10px] font-bold text-ink/60 uppercase mb-1">Filter by Status</label>
                    <select 
                      className="w-full rounded-lg border border-clay/60 px-2 py-1.5 text-xs bg-white"
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
                    className="self-end text-[10px] font-bold text-red-500 hover:underline px-2 py-1"
                  >
                    Clear All
                  </button>
                </div>
              )}
            </div>
            <div className="overflow-x-auto">
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
          <article className="dashboard-shell p-6">
            <h2 className="text-lg font-bold text-slate-900">Platform Payments</h2>
            <div className="mt-3 overflow-x-auto text-sm">
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
                </tbody>
              </table>
            </div>
          </article>
        )}

        {activeTab === "properties" && (
          <section className="dashboard-shell p-6">
            <h2 className="text-lg font-bold text-slate-900">Posted Properties</h2>
            <p className="mt-1 text-sm text-slate-600">
              Properties go live as soon as users publish them. Open any listing to review it, see who posted it, or delete it from the platform.
            </p>
            <div className="mt-3 overflow-x-auto">
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
                        <button type="button" onClick={() => openProperty(p._id)} className="block">
                          <img
                            src={p.images?.[0] || PROPERTY_PLACEHOLDER_IMAGE}
                            alt={p.title}
                            className="h-12 w-12 rounded-md border border-clay object-cover"
                          />
                        </button>
                      </td>
                      <td className="py-2">
                        <button type="button" onClick={() => openProperty(p._id)} className="text-left transition hover:text-sage">
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
                          <button onClick={() => openProperty(p._id)} className="rounded-md border border-clay bg-white px-3 py-1 text-xs font-semibold hover:bg-stone">
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
          <div className="space-y-6">
            <section className="dashboard-shell p-6">
              <h2 className="text-lg font-bold text-slate-900">Customer Call / Inquiry Requests</h2>
              <p className="mt-1 text-sm text-slate-600">All customer requests are stored here for admin tracking and audit.</p>
              <div className="mt-3 overflow-x-auto">
                <table className="dashboard-table min-w-full text-left text-sm">
                  <thead className="whitespace-nowrap">
                    <tr className="border-b border-clay">
                      <th className="py-2">Date</th>
                      <th className="py-2">Property</th>
                      <th className="py-2">Customer</th>
                      <th className="py-2">Posted By</th>
                      <th className="py-2">Intent</th>
                      <th className="py-2">Message</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((l) => (
                      <tr key={l._id} className="border-b border-clay/60 align-top">
                        <td className="py-2">{new Date(l.createdAt).toLocaleString("en-IN")}</td>
                        <td className="py-2">
                          <p className="font-semibold">{l.propertyId?.title || "N/A"}</p>
                          <p className="text-xs text-ink/65">{l.propertyId?.location?.city || ""}</p>
                        </td>
                        <td className="py-2">
                          <p>{l.userId?.name || l.contactInfo?.name || "N/A"}</p>
                          <p className="text-xs text-ink/65">{l.userId?.email || l.contactInfo?.email || "N/A"}</p>
                          <p className="text-xs text-ink/65">{l.userId?.phone || l.contactInfo?.phone || "N/A"}</p>
                        </td>
                        <td className="py-2">
                          <p>{l.ownerId?.name || "N/A"}</p>
                          <p className="text-xs text-ink/65">{l.ownerId?.email || "N/A"}</p>
                        </td>
                        <td className="py-2">{l.intentType}</td>
                        <td className="py-2 max-w-xs">{l.contactInfo?.message || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <article className="dashboard-shell p-6">
                <h2 className="text-lg font-bold text-slate-900">Customer Property Requests</h2>
                <div className="mt-3 overflow-x-auto">
                  <table className="dashboard-table min-w-full text-left text-sm">
                    <thead className="whitespace-nowrap">
                      <tr className="border-b border-clay">
                        <th className="py-2">Customer</th>
                        <th className="py-2">Requirement</th>
                        <th className="py-2">Budget/Location</th>
                        <th className="py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customerRequests.map((item) => (
                        <tr key={item._id} className="border-b border-clay/60 align-top">
                          <td className="py-2">
                            <p className="font-semibold">{item.customerName}</p>
                            <p className="text-xs text-ink/65">{item.contactDetails?.email || "-"}</p>
                            <p className="text-xs text-ink/65">{item.contactDetails?.phone || "-"}</p>
                          </td>
                          <td className="py-2">
                            <p className="font-semibold">{item.propertyType}</p>
                            <p className="text-xs text-ink/65">{item.additionalRequirements || "-"}</p>
                          </td>
                          <td className="py-2">Rs. {item.budgetMin || 0} - Rs. {item.budgetMax || 0}<br />{item.location?.city}, {item.location?.area}</td>
                          <td className="py-2">{item.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </article>

              <article className="dashboard-shell p-6">
                <h2 className="text-lg font-bold text-slate-900">Lead Unlock Purchase Records</h2>
                <div className="mt-3 overflow-x-auto">
                  <table className="dashboard-table min-w-full text-left text-sm">
                    <thead className="whitespace-nowrap">
                      <tr className="border-b border-clay">
                        <th className="py-2">Agent</th>
                        <th className="py-2">Customer</th>
                        <th className="py-2">Amount</th>
                        <th className="py-2">Status</th>
                        <th className="py-2">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leadUnlocks.map((item) => (
                        <tr key={item._id} className="border-b border-clay/60">
                          <td className="py-2">{item.agentId?.name || "N/A"}</td>
                          <td className="py-2">{item.customerId?.name || "N/A"}</td>
                          <td className="py-2">Rs. {item.amount}</td>
                          <td className="py-2">{item.status}</td>
                          <td className="py-2">{new Date(item.createdAt).toLocaleString("en-IN")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </article>
            </section>
          </div>
        )}
    </DashboardSidebar>

      {/* View User Modal Overlay */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-clay/60">
            <div className="flex justify-between items-center p-5 border-b border-clay bg-stone">
              <h3 className="font-bold text-lg">User Details</h3>
              <button onClick={() => setSelectedUser(null)} className="text-ink/50 hover:text-ink text-2xl leading-none">&times;</button>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xl font-extrabold">{selectedUser.name}</p>
                  <p className="text-sm text-ink/70">{selectedUser.email}</p>
                  <p className="text-sm text-ink/70">{selectedUser.phone || "No phone provided"}</p>
                  <p className="text-sm text-ink/70">{selectedUser.address || "No address provided"}</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-wide text-sage">{selectedUser.role}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${selectedUser.status === "deactivated" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                  {selectedUser.status || "active"}
                </span>
              </div>
              
              <div className="grid grid-cols-1 gap-3 border-t border-clay pt-4 text-sm sm:grid-cols-2">
                <div className="bg-stone p-3 rounded-xl border border-clay/50">
                  <p className="text-xs text-ink/60 mb-1">Active Plan</p>
                  <p className="font-semibold">{selectedUser.activePlanName || "Free Plan"}</p>
                  <p className="text-[10px] text-ink/60 mt-0.5">{selectedUser.activePlan?.expiresAt ? `Valid till ${new Date(selectedUser.activePlan.expiresAt).toLocaleDateString("en-IN")}` : "No expiry"}</p>
                </div>
                <div className="bg-stone p-3 rounded-xl border border-clay/50">
                  <p className="text-xs text-ink/60 mb-1">Properties (Total: {selectedUser.propertyStats?.total || 0})</p>
                  <p className="text-xs font-semibold text-sage">Live: {selectedUser.propertyStats?.approved || 0}</p>
                  <p className="text-xs font-semibold text-amber-600 mt-0.5">Pending/Other: {selectedUser.propertyStats?.pending || 0}</p>
                </div>
              </div>

              {["agent", "broker"].includes(selectedUser.role) && (
                <div className="bg-stone p-3 rounded-xl border border-clay/50 text-sm">
                  <p className="text-xs text-ink/60 mb-1">Agent Lead Pipeline</p>
                  <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                    <p>Total Matches Sent: <span className="font-bold">{selectedUser.customerLeadStats?.got || 0}</span></p>
                    <p>Total Leads Unlocked: <span className="font-bold text-sage">{selectedUser.customerLeadStats?.bought || 0}</span></p>
                  </div>
                </div>
              )}

              <div className="bg-stone p-3 rounded-xl border border-clay/50 text-sm">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-xs text-ink/60">Admin Notes (Private)</p>
                  {!editingNotes ? (
                    <button onClick={() => setEditingNotes(true)} className="text-[10px] font-bold text-sage hover:underline">Edit</button>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={() => { setEditingNotes(false); setTempNotes(selectedUser.adminNotes || ""); }} className="text-[10px] font-bold text-ink/60 hover:underline">Cancel</button>
                      <button onClick={onSaveNotes} className="text-[10px] font-bold text-sage hover:underline">Save</button>
                    </div>
                  )}
                </div>
                {!editingNotes ? (
                  <p className="text-sm text-ink whitespace-pre-wrap">{selectedUser.adminNotes || <span className="text-ink/40 italic">No notes added.</span>}</p>
                ) : (
                  <textarea 
                    className="w-full rounded-lg border border-clay/60 p-2 text-sm bg-white" 
                    rows={3} 
                    value={tempNotes} 
                    onChange={(e) => setTempNotes(e.target.value)}
                    placeholder="Add details about this member here..."
                  />
                )}
              </div>

              <div className="mt-4">
                <p className="text-xs font-bold text-ink/60 uppercase tracking-tight mb-2">Properties Posted by {selectedUser.name}</p>
                {userProperties.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1 thin-scrollbar">
                    {userProperties.map(p => (
                      <div key={p._id} className="flex flex-col gap-2 rounded-xl border border-clay/40 bg-stone p-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-xs font-bold truncate max-w-[180px]">{p.title}</p>
                          <p className="text-[10px] text-ink/50">Rs. {Number(p.price || 0).toLocaleString("en-IN")}</p>
                          <p className="text-[10px] text-ink/60">{p.location?.city} — {p.status}</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => { setSelectedUser(null); openProperty(p._id); }} className="text-[10px] font-bold text-ink/80 border border-clay px-2 py-1 rounded-md hover:bg-clay/20">
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
                  <p className="text-xs text-ink/50 italic py-2">This user hasn't posted any properties yet.</p>
                )}
              </div>
            </div>
            
            <div className="flex flex-col gap-4 border-t border-clay bg-stone p-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-ink/60 flex-1">
                {selectedUser.status === "deactivated" 
                  ? "User is currently restricted from logging in and accessing the platform."
                  : "If this user is cheating or misbehaving, you can deactivate their account."}
              </p>
              <div className="flex gap-2">
                <button 
                  onClick={() => { setSelectedUser(null); openEmailModal(selectedUser._id); }}
                  className="px-4 py-2 rounded-lg text-sm font-bold shadow transition bg-ink text-white hover:opacity-90"
                >
                  Send Email
                </button>
                <button 
                  onClick={() => onToggleUserStatus(selectedUser)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold shadow transition ${selectedUser.status === "deactivated" ? "bg-sage text-white hover:opacity-90" : "bg-red-600 text-white hover:bg-red-700"}`}
                >
                  {selectedUser.status === "deactivated" ? "Reactivate User" : "Deactivate User"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {emailModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-clay/50 pb-4">
              <h2 className="text-xl font-bold">{emailTarget === "all" ? "Broadcast Email to All" : "Send Email to User"}</h2>
              <button onClick={() => setEmailModalOpen(false)} className="text-ink/60 hover:text-ink">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={onSendEmail} className="mt-6 flex flex-col gap-4">
              <div>
                <label className="mb-1 block text-sm font-bold text-ink">Subject</label>
                <input
                  type="text"
                  required
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full rounded-xl border border-clay p-3 text-sm focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
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
                  className="w-full rounded-xl border border-clay p-3 text-sm focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
                  placeholder="Type your message here... (HTML tags like <br/> or <b> are supported internally)"
                />
              </div>
              <div className="mt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setEmailModalOpen(false)} className="rounded-xl px-4 py-2 text-sm font-bold text-ink/70 hover:bg-stone">
                  Cancel
                </button>
                <button type="submit" disabled={sendingEmail} className="uiverse-btn rounded-xl bg-ink px-6 py-2 text-sm font-bold text-white disabled:opacity-70">
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
