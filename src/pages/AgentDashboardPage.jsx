import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useAuth from "../hooks/useAuth";
import { fetchMyProperties, promoteProperty } from "../services/api/propertyApi";
import { fetchMyLeads, updateLeadStatus, updateLeadApproval, unlockInboxLead } from "../services/api/leadApi";
import { 
  fetchCustomerRequestsForAgents, 
  sendMatchNotification, 
  unlockCustomerLeadIntent, 
  verifyCustomerLeadUnlock,
  buyLeadPackIntent,
  verifyLeadPackPayment
} from "../services/api/customerRequestApi";
import { loadExternalScript } from "../utils/loadExternalScript";
import DashboardSidebar from "../components/DashboardSidebar";
import Loader from "../components/Loader";
import { PROPERTY_PLACEHOLDER_IMAGE } from "../constants/propertyMedia";

const fmt = (d) => new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const AgentDashboardPage = () => {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const isBroker = ["agent", "broker"].includes(user?.role);

  const [properties, setProperties] = useState([]);
  const [leads, setLeads] = useState([]);
  const [customerRequests, setCustomerRequests] = useState([]);
  const [customerLeadCredits, setCustomerLeadCredits] = useState(0);
  const [leadUnlockPrice] = useState(200);
  const [loading, setLoading] = useState(true);

  const [tab, setTab] = useState("overview");

  const loadAll = useCallback(async () => {
    try {
      const results = await Promise.allSettled([
        fetchMyProperties(token),
        fetchMyLeads(token),
        isBroker ? fetchCustomerRequestsForAgents(token) : Promise.resolve({ items: [], customerLeadCredits: 0 }),
      ]);
      if (results[0].status === "fulfilled") setProperties(results[0].value.items || []);
      if (results[1].status === "fulfilled") {
        setLeads(results[1].value.items || []);
        setCustomerLeadCredits(results[1].value.customerLeadCredits || 0);
      }
      if (results[2].status === "fulfilled") {
        setCustomerRequests(results[2].value.items || []);
        // Credits might come from either leads or customer requests api, they should be the same
        if (results[2].value.customerLeadCredits !== undefined) {
             setCustomerLeadCredits(results[2].value.customerLeadCredits);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [token, isBroker]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const onPromote = async (id) => {
    try { await promoteProperty(token, id); toast.success("Listing boosted"); loadAll(); }
    catch (e) { toast.error(e.response?.data?.message || "Unable to boost"); }
  };

  const onLeadAction = async (id, status) => {
    try {
      if (status === "approved" || status === "rejected") {
        await updateLeadApproval(token, id, status);
      } else {
        await updateLeadStatus(token, id, status);
      }
      toast.success(`Request ${status}`);
      loadAll();
    } catch {
      toast.error("Unable to update request");
    }
  }

  const onSendMatch = async (id) => {
    try { await sendMatchNotification(token, id); toast.success("Match notification sent"); loadAll(); }
    catch (e) { toast.error(e.response?.data?.message || "Unable to notify"); }
  };

  const openRazorpayCheckout = async (intent, planName) => {
    const loaded = await loadExternalScript("https://checkout.razorpay.com/v1/checkout.js");
    if (!loaded || !window.Razorpay) throw new Error("Unable to load Razorpay checkout");

    return new Promise((resolve, reject) => {
      const options = {
        key: intent.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: intent.amount,
        currency: intent.currency || "INR",
        name: "MyHosurProperty",
        description: planName,
        order_id: intent.orderId || intent.razorpay?.orderId,
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.phone || "",
        },
        handler: (response) => resolve(response),
        modal: {
          ondismiss: () => reject(new Error("Payment cancelled")),
        },
      };

      const rz = new window.Razorpay(options);
      rz.open();
    });
  };

  const onUnlockCustomerRequest = async (id) => {
    try {
      const res = await unlockCustomerLeadIntent(token, id);
      if (res.isUnlocked) {
        toast.success("Lead unlocked using credits!");
        loadAll();
        return;
      }
      if (res.razorpay?.orderId) {
        const paymentResponse = await openRazorpayCheckout(res, "Unlock Lead");
        await verifyCustomerLeadUnlock(token, {
          unlockId: res.unlockId,
          razorpayOrderId: paymentResponse.razorpay_order_id,
          razorpayPaymentId: paymentResponse.razorpay_payment_id,
          razorpaySignature: paymentResponse.razorpay_signature,
        });
        toast.success(`Lead unlocked successfully`);
        loadAll();
      }
    } catch (e) {
      toast.error(e.response?.data?.message || e.message || "Lead unlock failed");
    }
  };

  const onUnlockInboxLead = async (id) => {
    try {
      if (customerLeadCredits <= 0) {
        toast.error("No credits available. Buy a lead pack (300rs for 5).");
        return;
      }
      await unlockInboxLead(token, id);
      toast.success("Lead unlocked using 1 credit!");
      loadAll();
    } catch (e) {
      toast.error(e.response?.data?.message || "Unlock failed");
    }
  };

  const onBuyPack = async () => {
    try {
      const intent = await buyLeadPackIntent(token);
      const paymentResponse = await openRazorpayCheckout(intent, "Lead Pack (5 Credits)");
      await verifyLeadPackPayment(token, {
        razorpayOrderId: paymentResponse.razorpay_order_id,
        razorpayPaymentId: paymentResponse.razorpay_payment_id,
        razorpaySignature: paymentResponse.razorpay_signature,
      });
      toast.success("5 Lead credits added to your account!");
      loadAll();
    } catch (e) {
      toast.error(e.response?.data?.message || e.message || "Purchase failed");
    }
  };

  const tabs = [
    { key: "overview", label: "Overview", icon: "📊" },
    { key: "listings", label: "Listings", icon: "🏠" },
    { key: "leads", label: "Leads", icon: "👥" },
    ...(isBroker ? [{ key: "requests", label: "Requests", icon: "📋" }] : []),
  ];

  if (loading) return (
    <main className="min-h-screen bg-slate-50 pt-6 md:pl-80">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <Loader text="Loading dashboard..." />
      </div>
    </main>
  );

  return (
    <DashboardSidebar
      title={user?.name || "Agent"}
      subtitle="Agent / Broker Panel"
      description="Manage your listings, leads, and customer requirements from a cleaner, easier-to-access workspace."
      stats={[
        { label: "Total Listings", value: properties.length, icon: "🏠" },
        { label: "Active Leads", value: leads.length, icon: "👥" },
        { label: "Lead Credits", value: customerLeadCredits, icon: "🎟️" },
      ]}
      navItems={tabs.map((item) => ({
        key: item.key,
        label: item.label,
        icon: item.icon,
        active: tab === item.key,
        badge: item.key === "requests" && customerRequests.length ? customerRequests.length : undefined,
        onClick: setTab,
      }))}
    >
      {tab === "overview" && (
        <div className="space-y-6">
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { label: "Total Listings", value: properties.length, icon: "🏠", color: "from-blue-500 to-blue-700" },
              { label: "Active Leads", value: leads.length, icon: "👥", color: "from-emerald-500 to-emerald-700" },
              { label: "Lead Credits", value: customerLeadCredits, icon: "🎟️", color: "from-sage to-[#27ae60]" },
            ].map(({ label, value, icon }) => (
              <div key={label} className="dashboard-shell border border-slate-200 bg-white p-5 text-slate-900">
                <p className="text-2xl">{icon}</p>
                <p className="mt-4 text-4xl font-extrabold text-slate-900">{value}</p>
                <p className="mt-2 text-sm text-slate-600">{label}</p>
              </div>
            ))}
          </section>

          <section className="dashboard-shell p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Lead Credits & Unlocks</h2>
                <p className="mt-2 text-sm text-slate-600">Unlock customer inquiries and property leads with a single credit pack.</p>
              </div>
              <button onClick={onBuyPack} className="dashboard-primary px-5 py-3 text-sm">
                Buy 5 Credits @ Rs.300
              </button>
            </div>
          </section>
        </div>
      )}

      {tab === "listings" && (
        <section className="dashboard-shell p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Manage Listings</h2>
              <p className="text-sm text-slate-600">Edit, boost, and review the properties you currently publish.</p>
            </div>
            <button onClick={() => navigate("/post-property")} className="dashboard-primary px-4 py-2 text-sm">
              Post New Listing
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="dashboard-table min-w-full text-left text-sm">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Title</th>
                  <th>City</th>
                  <th>Status</th>
                  <th>Price</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {properties.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <img src={p.images?.[0] || PROPERTY_PLACEHOLDER_IMAGE} alt="Property" className="h-12 w-12 rounded-xl object-cover border border-slate-200" />
                    </td>
                    <td className="font-medium text-slate-900">{p.title}</td>
                    <td>{p.location?.city}</td>
                    <td><StatusBadge status={p.status} /></td>
                    <td>Rs.{(p.price || 0).toLocaleString("en-IN")}</td>
                    <td className="space-x-2 text-right">
                      <button onClick={() => onPromote(p._id)} className="dashboard-primary px-3 py-2 text-xs">
                        Boost
                      </button>
                      <button onClick={() => navigate(`/edit-property/${p._id}`)} className="dashboard-secondary px-3 py-2 text-xs">
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
                {properties.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">No listings yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === "leads" && (
        <section className="dashboard-shell p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Property Inquiries</h2>
              <p className="text-sm text-slate-600">View incoming buyer leads and unlock contact data as needed.</p>
            </div>
            <div className="dashboard-subpanel px-4 py-3 text-sm font-semibold text-slate-900">
              Credits: {customerLeadCredits}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="dashboard-table min-w-full text-left text-sm">
              <thead>
                <tr className="text-ink/60">
                  <th className="py-3 pr-4 font-semibold">Property</th>
                  <th className="py-3 pr-4 font-semibold">Contact</th>
                  <th className="py-3 pr-4 font-semibold">Intent</th>
                  <th className="py-3 pr-4 font-semibold">Status</th>
                  <th className="py-3 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-clay/20">
                {leads.map((l) => (
                  <tr key={l._id} className="hover:bg-slate-50 transition-colors align-middle">
                    <td className="py-4 pr-4">
                      <p className="font-semibold text-ink">{l.propertyId?.title || "—"}</p>
                      <p className="text-xs text-ink/50">{fmt(l.createdAt)}</p>
                    </td>
                    <td className="py-4 pr-4">
                      <div className={`${!l.isUnlockedByOwner ? "blur-sm grayscale opacity-40" : ""}`}>
                        <p className="font-bold text-ink">{l.contactInfo?.name}</p>
                        <p className="text-xs text-ink/70">{l.contactInfo?.phone}</p>
                        <p className="text-xs text-ink/70">{l.contactInfo?.email}</p>
                      </div>
                      {!l.isUnlockedByOwner && (
                        <button onClick={() => onUnlockInboxLead(l._id)} className="mt-2 text-[11px] font-semibold text-[#8b6b3f] underline hover:text-[#6f5331]">
                          Unlock Contact
                        </button>
                      )}
                    </td>
                    <td className="py-4 pr-4">
                      <p className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold uppercase text-ink/70">{l.intentType}</p>
                      {l.contactInfo?.message && <p className="mt-1 text-xs text-ink/50 italic">"{l.contactInfo.message}"</p>}
                    </td>
                    <td className="py-4 pr-4">
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase ${l.status === "approved" ? "bg-emerald-100 text-emerald-700" : l.status === "pending" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="py-4 text-right space-y-2">
                      {l.status === "pending" && (
                        <div className="flex flex-wrap justify-end gap-2">
                          <button onClick={() => onLeadAction(l._id, "approved")} className="rounded-2xl bg-sage px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-600 transition">
                            Approve
                          </button>
                          <button onClick={() => onLeadAction(l._id, "rejected")} className="rounded-2xl bg-ink px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-700">
                            Reject
                          </button>
                        </div>
                      )}
                      {!l.isUnlockedByOwner && (
                        <button onClick={() => onUnlockInboxLead(l._id)} className="rounded-2xl border border-clay/30 bg-slate-50 px-3 py-2 text-[11px] font-semibold text-ink hover:bg-slate-100 transition">
                          Unlock Lead
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {leads.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500">No inquiries received yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === "requests" && isBroker && (
        <section className="space-y-4">
          {customerRequests.map((item) => (
            <div key={item._id} className="dashboard-shell p-6 transition hover:shadow-lg">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2 text-sm text-ink/70">
                    <span className="rounded-full bg-slate-100 px-2 py-1">{item.propertyType}</span>
                    <span>{item.location?.area}, {item.location?.city}</span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Customer Requirement</h2>
                  <p className="text-sm text-slate-600">Budget: Rs.{(item.budgetMin || 0).toLocaleString()} - Rs.{(item.budgetMax || 0).toLocaleString()}</p>
                  {item.additionalRequirements && <p className="text-sm italic text-slate-500">{item.additionalRequirements}</p>}
                </div>
                <div className="space-y-2 min-w-[180px]">
                  <button onClick={() => onSendMatch(item._id)} className="dashboard-secondary w-full px-4 py-3 text-sm">
                    Send Match
                  </button>
                  {!item.isContactUnlocked && (
                    <button onClick={() => onUnlockCustomerRequest(item._id)} className="dashboard-primary w-full px-4 py-3 text-sm">
                      {customerLeadCredits > 0 ? "Unlock (1 Credit)" : `Unlock Rs.${leadUnlockPrice}`}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {customerRequests.length === 0 && (
            <div className="dashboard-empty p-10 text-center">No customer requirements found.</div>
          )}
        </section>
      )}
    </DashboardSidebar>
  );
};

const StatusBadge = ({ status }) => {
  const map = { approved: "bg-green-100 text-green-700", pending: "bg-amber-100 text-amber-700", rejected: "bg-red-100 text-red-700" };
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${map[status] || "bg-stone text-ink/60"}`}>{status}</span>;
};

export default AgentDashboardPage;
