import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  updatePropertyStatus,
  toggleUserStatus,
} from "../services/api/adminApi";
import toast from "react-hot-toast";
import PropertyPostingForm from "../components/PropertyPostingForm";
import { 
  ClipboardDocumentCheckIcon, 
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
  const [pending, setPending] = useState([]);
  const [leads, setLeads] = useState([]);
  const [customerRequests, setCustomerRequests] = useState([]);
  const [leadUnlocks, setLeadUnlocks] = useState([]);
  const [leadPrice, setLeadPrice] = useState(200);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userProperties, setUserProperties] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();

  const exportToExcel = () => {
    const headers = ["Name", "Email", "Phone", "Role", "Status", "Plan", "Credits", "Prop Added", "Matches Sent", "Leads Bought", "Date Joined"];
    const rows = users.map(u => [
      u.name,
      u.email,
      u.phone || "-",
      u.role,
      u.status || "active",
      u.activePlanName || "Free",
      u.activePlan?.leadCredits ?? u.leadCredits ?? 0,
      u.propertyStats?.total || 0,
      u.customerLeadStats?.got || 0,
      u.customerLeadStats?.bought || 0,
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

  const load = useCallback(() => {
    fetchAdminMetrics(token).then(setMetrics);
    fetchAdminUsers(token).then((res) => setUsers(res.items || []));
    fetchAdminPayments(token).then((res) => setPayments(res.items || []));
    fetchAdminPropertyApplications(token, { status: "pending", limit: 30 }).then((res) => setPending(res.items || []));
    fetchAdminLeads(token, { limit: 50 }).then((res) => setLeads(res.items || [])).catch(() => setLeads([]));
    fetchAdminCustomerRequests(token, { limit: 50 }).then((res) => setCustomerRequests(res.items || [])).catch(() => setCustomerRequests([]));
    fetchAdminLeadUnlocks(token, { limit: 50 }).then((res) => setLeadUnlocks(res.items || [])).catch(() => setLeadUnlocks([]));
    fetchAdminLeadPrice(token).then((res) => setLeadPrice(Number(res.value || 200))).catch(() => setLeadPrice(200));
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (selectedUser) {
      import("../services/api/propertyApi").then(({ fetchProperties }) => {
        fetchProperties({ ownerId: selectedUser._id, status: "all" }, token)
          .then((res) => setUserProperties(res.items || []))
          .catch(() => setUserProperties([]));
      });
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

  const moderate = async (id, status) => {
    try {
      await updatePropertyStatus(token, id, status);
      toast.success(`Property ${status}`);
      load();
    } catch {
      toast.error("Failed moderation action");
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

  return (
    <div className="mx-auto max-w-7xl flex flex-col md:flex-row min-h-[80vh] gap-6 px-4 py-8 md:px-8">
      {/* Sidebar */}
      <aside className="w-full md:w-64 shrink-0 bg-white rounded-2xl border border-clay/60 p-4 shadow-sm h-fit">
        <h1 className="mb-6 text-xl font-bold inline-flex items-center gap-2 px-2 text-ink">
          <ClipboardDocumentCheckIcon className="h-6 w-6 text-sage" /> Admin Panel
        </h1>
        <nav className="flex flex-row overflow-x-auto md:flex-col gap-1.5 font-semibold text-sm pb-2 md:pb-0 hide-scrollbar">
          {[
            { id: "overview", label: "Overview", icon: ChartBarIcon },
            { id: "users", label: "Users", icon: UsersIcon },
            { id: "properties", label: "Properties", icon: HomeModernIcon },
            { id: "leads", label: "Requests & Leads", icon: ChatBubbleLeftRightIcon },
            { id: "payments", label: "Payments", icon: BanknotesIcon },
            { id: "settings", label: "Settings", icon: Cog6ToothIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 whitespace-nowrap px-4 py-2.5 rounded-xl transition-all ${
                activeTab === tab.id ? "bg-ink text-white" : "text-ink/75 hover:bg-clay/30 hover:text-ink"
              }`}
            >
              <tab.icon className={`h-5 w-5 shrink-0 ${activeTab === tab.id ? "text-sage" : "text-ink/60"}`} />
              {tab.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 space-y-6">
        {activeTab === "overview" && (
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(metrics).map(([k, v]) => (
              <article key={k} className="content-card p-4 text-center border border-clay/40 bg-white/60">
                <p className="text-sm text-ink/65 capitalize">{k.replace(/([A-Z])/g, ' $1').trim()}</p>
                <p className="mt-1 text-3xl font-extrabold text-ink">{v}</p>
              </article>
            ))}
          </section>
        )}

        {activeTab === "settings" && (
          <div className="space-y-6">
            <section className="rounded-2xl border border-clay/70 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold">Lead Unlock Pricing Control</h2>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <input
                  type="number"
                  min="0"
                  className="soft-input w-44 rounded-lg px-3 py-2 text-sm border-2 border-clay"
                  value={leadPrice}
                  onChange={(e) => setLeadPrice(e.target.value)}
                />
                <button onClick={saveLeadPrice} className="rounded-lg bg-ink px-6 py-2 text-sm font-semibold text-stone">
                  Save Price
                </button>
                <span className="text-sm text-ink/70">Default is Rs. 200 per lead lock.</span>
              </div>
            </section>
            <PropertyPostingForm heading="Post Live Property (Admin)" onSuccess={load} />
          </div>
        )}

        {activeTab === "users" && (
          <article className="glass-panel rounded-2xl border border-white/70 bg-white/60 p-6 relative">
            <div className="mb-4 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold inline-flex items-center gap-2"><UsersIcon className="h-5 w-5 text-sage" />Registered Users ({metrics.users || users.length})</h2>
                <button onClick={exportToExcel} className="rounded-lg bg-green-600 px-3 py-1.5 text-xs text-white hover:bg-green-700 shadow-soft">
                  📥 Export CSV
                </button>
              </div>
              <div className="flex gap-2 w-full">
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
              <table className="min-w-full text-left text-sm">
                <thead className="whitespace-nowrap">
                  <tr className="border-b border-clay">
                    <th className="py-2">Name / Email</th>
                    <th className="py-2">Role</th>
                    <th className="py-2">Status</th>
                    <th className="py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u._id} className="border-b border-clay/60 align-top hover:bg-white/50 transition">
                      <td className="py-2">
                        <p className="font-semibold">{u.name}</p>
                        <p className="text-xs text-ink/65">{u.email}</p>
                      </td>
                      <td className="py-2 capitalize">{u.role}</td>
                      <td className="py-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${u.status === "deactivated" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                          {u.status || "active"}
                        </span>
                      </td>
                      <td className="py-2 text-right">
                        <button onClick={() => setSelectedUser(u)} className="rounded-md border border-clay bg-white px-3 py-1 text-xs hover:bg-stone">
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
          <article className="glass-panel rounded-2xl border border-white/70 bg-white/60 p-6 shadow-sm">
            <h2 className="text-lg font-bold">Platform Payments</h2>
            <div className="mt-3 overflow-x-auto text-sm">
              <table className="min-w-full text-left">
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
          <section className="glass-panel rounded-2xl border border-white/70 bg-white/60 p-6">
            <h2 className="text-lg font-bold">Pending Property Approval Queue</h2>
            <p className="mt-1 text-sm text-ink/70">
              Every property posted by owner/agent/broker/builder appears here first. Only after admin approval it goes live on Home page.
            </p>
            <div className="mt-3 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="whitespace-nowrap">
                  <tr className="border-b border-clay">
                    <th className="py-2">Image</th>
                    <th className="py-2">Property</th>
                    <th className="py-2">City</th>
                    <th className="py-2">Posted By</th>
                    <th className="py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pending.map((p) => (
                    <tr key={p._id} className="border-b border-clay/60 align-middle">
                      <td className="py-2">
                         <img 
                          src={p.images?.[0] || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=120&q=80"} 
                          alt="Property" 
                          className="h-10 w-10 rounded-md object-cover border border-clay" 
                         />
                      </td>
                      <td className="py-2 font-medium">{p.title}</td>
                      <td className="py-2 text-ink/70">{p.location?.city}</td>
                      <td className="py-2 text-ink/70">{p.ownerId?.name || "Unknown"} ({p.ownerType || p.ownerId?.role || "user"})</td>
                      <td className="py-2 text-right space-x-2">
                        <button onClick={() => moderate(p._id, "approved")} className="rounded-md bg-sage px-3 py-1 text-xs font-semibold text-white hover:opacity-90">Approve</button>
                        <button onClick={() => moderate(p._id, "rejected")} className="rounded-md bg-ink px-3 py-1 text-xs font-semibold text-white hover:opacity-90">Reject</button>
                        <button onClick={() => navigate(`/edit-property/${p._id}`)} className="rounded-md border border-clay bg-white px-3 py-1 text-xs font-semibold hover:bg-stone">Edit</button>
                      </td>
                    </tr>
                  ))}
                  {pending.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-ink/50">No pending properties</td></tr>}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === "leads" && (
          <div className="space-y-6">
            <section className="glass-panel rounded-2xl border border-white/70 bg-white/60 p-6">
              <h2 className="text-lg font-bold">Customer Call / Inquiry Requests</h2>
              <p className="mt-1 text-sm text-ink/70">All customer requests are stored here for admin tracking and audit.</p>
              <div className="mt-3 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
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
              <article className="glass-panel rounded-2xl border border-white/70 bg-white/60 p-6">
                <h2 className="text-lg font-bold">Customer Property Requests</h2>
                <div className="mt-3 overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
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

              <article className="glass-panel rounded-2xl border border-white/70 bg-white/60 p-6">
                <h2 className="text-lg font-bold">Lead Unlock Purchase Records</h2>
                <div className="mt-3 overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
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
      </main>

      {/* View User Modal Overlay */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-clay/60">
            <div className="flex justify-between items-center p-5 border-b border-clay bg-stone">
              <h3 className="font-bold text-lg">User Details</h3>
              <button onClick={() => setSelectedUser(null)} className="text-ink/50 hover:text-ink text-2xl leading-none">&times;</button>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xl font-extrabold">{selectedUser.name}</p>
                  <p className="text-sm text-ink/70">{selectedUser.email}</p>
                  <p className="text-sm text-ink/70">{selectedUser.phone || "No phone provided"}</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-wide text-sage">{selectedUser.role}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${selectedUser.status === "deactivated" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                  {selectedUser.status || "active"}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm border-t border-clay pt-4">
                <div className="bg-stone p-3 rounded-xl border border-clay/50">
                  <p className="text-xs text-ink/60 mb-1">Active Plan</p>
                  <p className="font-semibold">{selectedUser.activePlanName || "Free Plan"}</p>
                  <p className="text-[10px] text-ink/60 mt-0.5">{selectedUser.activePlan?.expiresAt ? `Valid till ${new Date(selectedUser.activePlan.expiresAt).toLocaleDateString("en-IN")}` : "No expiry"}</p>
                </div>
                <div className="bg-stone p-3 rounded-xl border border-clay/50">
                  <p className="text-xs text-ink/60 mb-1">Properties (Total: {selectedUser.propertyStats?.total || 0})</p>
                  <p className="text-xs font-semibold text-sage">Approved: {selectedUser.propertyStats?.approved || 0}</p>
                  <p className="text-xs font-semibold text-amber-600 mt-0.5">Pending: {selectedUser.propertyStats?.pending || 0}</p>
                </div>
              </div>

              {["agent", "broker"].includes(selectedUser.role) && (
                <div className="bg-stone p-3 rounded-xl border border-clay/50 text-sm">
                  <p className="text-xs text-ink/60 mb-1">Agent Lead Pipeline</p>
                  <div className="flex justify-between">
                    <p>Total Matches Sent: <span className="font-bold">{selectedUser.customerLeadStats?.got || 0}</span></p>
                    <p>Total Leads Unlocked: <span className="font-bold text-sage">{selectedUser.customerLeadStats?.bought || 0}</span></p>
                  </div>
                </div>
              )}

              <div className="mt-4">
                <p className="text-xs font-bold text-ink/60 uppercase tracking-tight mb-2">Properties Posted by {selectedUser.name}</p>
                {userProperties.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1 thin-scrollbar">
                    {userProperties.map(p => (
                      <div key={p._id} className="flex items-center justify-between p-3 bg-stone rounded-xl border border-clay/40">
                        <div>
                          <p className="text-xs font-bold truncate max-w-[180px]">{p.title}</p>
                          <p className="text-[10px] text-ink/60">{p.location?.city} — {p.status}</p>
                        </div>
                        <button onClick={() => { setSelectedUser(null); navigate(`/edit-property/${p._id}`); }} className="text-[10px] font-bold text-ink/80 border border-clay px-2 py-1 rounded-md hover:bg-clay/20">
                          Edit Detail
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-ink/50 italic py-2">This user hasn't posted any properties yet.</p>
                )}
              </div>
            </div>
            
            <div className="bg-stone p-5 border-t border-clay flex justify-between items-center gap-4">
              <p className="text-xs text-ink/60 flex-1">
                {selectedUser.status === "deactivated" 
                  ? "User is currently restricted from logging in and accessing the platform."
                  : "If this user is cheating or misbehaving, you can deactivate their account."}
              </p>
              <button 
                onClick={() => onToggleUserStatus(selectedUser)}
                className={`px-4 py-2 rounded-lg text-sm font-bold shadow transition ${selectedUser.status === "deactivated" ? "bg-sage text-white hover:opacity-90" : "bg-red-600 text-white hover:bg-red-700"}`}
              >
                {selectedUser.status === "deactivated" ? "Reactivate User" : "Deactivate User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
