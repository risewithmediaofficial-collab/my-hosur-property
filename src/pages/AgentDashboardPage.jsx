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

const fmt = (d) => new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const AgentDashboardPage = () => {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const isBroker = ["agent", "broker"].includes(user?.role);

  const [properties, setProperties] = useState([]);
  const [leads, setLeads] = useState([]);
  const [customerRequests, setCustomerRequests] = useState([]);
  const [customerLeadCredits, setCustomerLeadCredits] = useState(0);
  const [leadUnlockPrice, setLeadUnlockPrice] = useState(200);
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
    <main className="mx-auto max-w-7xl px-4 py-12 md:px-8">
      <div className="flex h-64 items-center justify-center gap-3 text-ink/60">
        Loading dashboard...
      </div>
    </main>
  );

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 md:px-8">
      <header className="rounded-2xl bg-gradient-to-r from-ink via-ink/90 to-ink/80 p-6 text-white shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium opacity-75">Agent / Broker Panel</p>
            <h1 className="text-2xl font-extrabold">{user?.name}</h1>
            <p className="mt-1 text-sm opacity-60 capitalize">{user?.role} Dashboard</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <AgentStatPill label="Listings" value={properties.length} icon="🏠" />
            <AgentStatPill label="Leads" value={leads.length} icon="👥" />
            <div className="rounded-xl bg-sage/20 border border-sage/20 px-4 py-2 text-center backdrop-blur">
                <p className="text-[10px] font-bold uppercase opacity-70">Lead Credits</p>
                <p className="text-xl font-extrabold text-sage">{customerLeadCredits}</p>
                <button onClick={onBuyPack} className="mt-1 text-[9px] font-bold underline hover:text-white transition-colors">Buy 5 (Rs.300)</button>
            </div>
          </div>
        </div>
      </header>

      <nav className="flex flex-wrap gap-1 rounded-xl border border-clay/60 bg-white p-1 shadow-soft">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 min-w-[80px] rounded-lg py-2 text-sm font-semibold transition-all ${tab === t.key ? "bg-ink text-white shadow" : "text-ink/60 hover:text-ink"}`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </nav>

      {tab === "overview" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: "Total Listings", value: properties.length, icon: "🏠", color: "from-blue-500 to-blue-700" },
            { label: "Active Leads", value: leads.length, icon: "👥", color: "from-emerald-500 to-emerald-700" },
            { label: "Lead Credits", value: customerLeadCredits, icon: "🎫", color: "from-sage to-[#27ae60]" },
          ].map(({ label, value, icon, color }) => (
            <div key={label} className={`rounded-2xl bg-gradient-to-br ${color} p-5 text-white shadow`}>
              <p className="text-2xl">{icon}</p>
              <p className="mt-2 text-3xl font-extrabold">{value}</p>
              <p className="mt-0.5 text-sm opacity-80">{label}</p>
            </div>
          ))}

          {/* New Top-up Card */}
          <div className="rounded-2xl border-2 border-dashed border-sage/50 bg-sage/5 p-5 flex flex-col justify-between hover:bg-sage/10 transition-colors group">
             <div>
                <h3 className="font-bold text-ink flex items-center gap-2">
                    <span className="text-xl">⚡</span> Get More Credits
                </h3>
                <p className="mt-1 text-xs text-ink/60">Unlock blurred leads & customer requirements instantly.</p>
             </div>
             <button 
                onClick={onBuyPack} 
                className="mt-4 w-full rounded-xl bg-sage py-2.5 text-xs font-extrabold text-white shadow-soft group-hover:scale-[1.02] transition-transform"
             >
                Pay Rs.300 for 5 Credits
             </button>
          </div>
        </div>
      )}

      {tab === "listings" && (
        <section className="rounded-2xl border border-clay/70 bg-white p-6 shadow-soft">
          <h2 className="mb-4 text-lg font-bold">Manage Listings</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-clay text-ink/60">
                  <th className="py-2 pr-4 font-semibold">Image</th>
                  <th className="py-2 pr-4 font-semibold">Title</th>
                  <th className="py-2 pr-4 font-semibold">City</th>
                  <th className="py-2 pr-4 font-semibold">Status</th>
                  <th className="py-2 pr-4 font-semibold">Price</th>
                  <th className="py-2 pr-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {properties.map((p) => (
                  <tr key={p._id} className="border-b border-clay/60 align-middle hover:bg-stone/30 transition-colors">
                    <td className="py-2">
                       <img 
                        src={p.images?.[0] || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=120&q=80"} 
                        alt="Property" 
                        className="h-10 w-10 rounded-md object-cover border border-clay" 
                       />
                    </td>
                    <td className="py-2.5 pr-4 font-medium">{p.title}</td>
                    <td className="py-2.5 pr-4 text-ink/70">{p.location?.city}</td>
                    <td className="py-2.5 pr-4"><StatusBadge status={p.status} /></td>
                    <td className="py-2.5 pr-4">Rs.{(p.price || 0).toLocaleString("en-IN")}</td>
                    <td className="py-2.5 text-right space-x-2">
                      <button onClick={() => onPromote(p._id)} className="rounded-md bg-sage px-3 py-1 text-xs font-semibold text-white hover:opacity-90 transition-opacity">
                        ⚡ Boost
                      </button>
                      <button 
                        onClick={() => navigate(`/edit-property/${p._id}`)} 
                        className="rounded-md border border-clay bg-white px-3 py-1 text-xs font-semibold text-ink/70 hover:bg-stone transition-all"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
                {properties.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-ink/50">No listings yet</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === "leads" && (
        <section className="rounded-2xl border border-clay/70 bg-white p-6 shadow-soft">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-clay pb-4">
             <div className="space-y-1">
                <h2 className="text-xl font-bold">Property Inquiries (Inbox)</h2>
                <p className="text-xs text-ink/50 italic italic">First 5 property leads are free. Beyond that, purchase lead credits to read contact details.</p>
             </div>
             <div className="flex items-center gap-3">
                <div className="text-right">
                    <p className="text-[10px] font-bold text-ink/50 uppercase">Credits</p>
                    <p className="text-lg font-extrabold text-sage">{customerLeadCredits}</p>
                </div>
                <button onClick={onBuyPack} className="rounded-xl bg-sage px-4 py-2 text-xs font-bold text-white shadow-soft">Buy 5 (Rs.300)</button>
             </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="text-ink/60">
                  <th className="py-2 pr-4 font-bold">Property</th>
                  <th className="py-2 pr-4 font-bold">Contact Info</th>
                  <th className="py-2 pr-4 font-bold">Intent</th>
                  <th className="py-2 pr-4 font-bold">Status</th>
                  <th className="py-2 text-right font-bold">Action</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((l) => (
                  <tr key={l._id} className="border-b border-clay/60 hover:bg-stone/30 transition-colors align-middle">
                    <td className="py-4 pr-4">
                        <p className="font-bold text-ink">{l.propertyId?.title || "—"}</p>
                        <p className="text-[10px] text-ink/50">{fmt(l.createdAt)}</p>
                    </td>
                    <td className="py-4 pr-4">
                      <div className={`transition-all ${!l.isUnlockedByOwner ? 'blur-[4px] select-none pointer-events-none opacity-40' : ''}`}>
                          <p className="font-bold">{l.contactInfo?.name}</p>
                          <p className="text-xs text-ink/70">{l.contactInfo?.phone}</p>
                          <p className="text-xs text-ink/50">{l.contactInfo?.email}</p>
                      </div>
                      {!l.isUnlockedByOwner && (
                         <button onClick={() => onUnlockInboxLead(l._id)} className="mt-1 text-[10px] font-bold text-sage underline hover:text-green-700">Unlock (1 Credit)</button>
                      )}
                    </td>
                    <td className="py-4 pr-4">
                      <span className="px-2 py-0.5 rounded bg-stone text-[10px] font-bold uppercase">{l.intentType}</span>
                      {l.contactInfo?.message && <p className="mt-1 text-[10px] text-ink/50 italic max-w-[150px] truncate">"{l.contactInfo.message}"</p>}
                    </td>
                    <td className="py-4 pr-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${l.status === 'approved' ? 'bg-green-100 text-green-700' : l.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                       <div className="flex justify-end gap-1.5 flex-col items-end">
                            {l.status === "pending" && (
                                <div className="flex gap-1.5">
                                    <button onClick={() => onLeadAction(l._id, "approved")} className="rounded-md bg-sage px-3 py-1 text-xs font-bold text-white shadow-sm hover:opacity-90">Approve</button>
                                    <button onClick={() => onLeadAction(l._id, "rejected")} className="rounded-md bg-ink px-3 py-1 text-xs font-bold text-white shadow-sm hover:opacity-90">Reject</button>
                                </div>
                            )}
                            {!l.isUnlockedByOwner && (
                                <button onClick={() => onUnlockInboxLead(l._id)} className="rounded-md bg-stone border border-clay px-3 py-1 text-[10px] font-bold text-ink hover:bg-clay/20 transition-all">
                                    Unlock Rs.300/5 pkg
                                </button>
                            )}
                       </div>
                    </td>
                  </tr>
                ))}
                {leads.length === 0 && <tr><td colSpan={5} className="py-12 text-center text-ink/50 border-t border-dashed border-clay">No inquiries received yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === "requests" && isBroker && (
        <section className="rounded-2xl border border-clay/70 bg-white p-6 shadow-soft">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div className="space-y-1">
                <h2 className="text-xl font-bold">Customer Requirements</h2>
                <p className="text-xs text-ink/50 italic italic">Marketplace leads: Unlock contact details using credits.</p>
            </div>
            <div className="flex items-center gap-3">
                <div className="text-right">
                    <p className="text-[10px] font-bold text-ink/50 uppercase">Credits</p>
                    <p className="text-lg font-extrabold text-sage">{customerLeadCredits}</p>
                </div>
                <button onClick={onBuyPack} className="rounded-xl bg-sage px-4 py-2 text-xs font-bold text-white shadow-soft">Buy 5 (Rs.300)</button>
            </div>
          </div>
          <div className="space-y-4">
            {customerRequests.map((item) => (
              <div key={item._id} className="group relative rounded-2xl border border-clay/60 bg-white p-5 hover:border-sage/40 hover:shadow-soft transition-all overflow-hidden">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-2 flex-1 min-w-[240px]">
                    <div className="flex items-center gap-2">
                        <span className="rounded-full bg-stone px-2 py-0.5 text-[10px] font-bold text-ink/70">{item.propertyType}</span>
                        <h3 className="font-bold text-ink">{item.location?.area}, {item.location?.city}</h3>
                    </div>
                    <p className="text-sm font-semibold text-sage">Budget: Rs.{(item.budgetMin || 0).toLocaleString()} - Rs.{(item.budgetMax || 0).toLocaleString()}</p>
                    
                    <div className={`mt-3 grid grid-cols-2 gap-4 transition-all ${!item.isContactUnlocked ? 'blur-[5px] select-none pointer-events-none grayscale opacity-40' : ''}`}>
                       <div className="space-y-0.5">
                           <p className="text-[10px] font-bold text-ink/40 uppercase">Customer Name</p>
                           <p className="text-sm font-bold">{item.customerName}</p>
                       </div>
                       <div className="space-y-0.5">
                           <p className="text-[10px] font-bold text-ink/40 uppercase">Phone / Email</p>
                           <p className="text-sm font-bold">{item.contactDetails?.phone || "N/A"}</p>
                       </div>
                    </div>

                    {item.additionalRequirements && <p className="mt-3 text-xs text-ink/50 italic leading-relaxed">"{item.additionalRequirements}"</p>}
                  </div>
                  
                  <div className="flex flex-col gap-2 min-w-[140px]">
                    <button onClick={() => onSendMatch(item._id)} className="rounded-xl border border-clay py-2 text-xs font-bold hover:bg-stone shadow-sm">
                      Send Property Match
                    </button>
                    {!item.isContactUnlocked && (
                      <button onClick={() => onUnlockCustomerRequest(item._id)} className="rounded-xl bg-ink py-2 text-xs font-bold text-stone shadow-md hover:bg-slate-800">
                         {customerLeadCredits > 0 ? `Unlock (1 Credit)` : `Unlock Rs.${leadUnlockPrice}`}
                      </button>
                    )}
                  </div>
                </div>
                {/* Visual Lock Overlay for Blurred items */}
                {!item.isContactUnlocked && (
                    <div className="absolute right-4 bottom-4 opacity-10">
                        <svg className="h-12 w-12 text-ink" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L8 5h3v9h2V5h3L12 1zM11 16h2v2h-2v-2zM11 20h2v2h-2v-2z"/></svg> 
                    </div>
                )}
              </div>
            ))}
            {customerRequests.length === 0 && (
               <div className="py-20 text-center glass-panel rounded-3xl border border-dashed border-clay">
                  <p className="text-ink/40 font-medium">No customer requirements found in this area.</p>
               </div>
            )}
          </div>
        </section>
      )}
    </main>
  );
};

const AgentStatPill = ({ label, value, icon }) => (
  <div className="rounded-xl bg-white/10 px-4 py-2 text-center backdrop-blur">
    <p className="text-lg">{icon}</p>
    <p className="text-xl font-extrabold">{value}</p>
    <p className="text-[10px] font-medium opacity-70">{label}</p>
  </div>
);

const StatusBadge = ({ status }) => {
  const map = { approved: "bg-green-100 text-green-700", pending: "bg-amber-100 text-amber-700", rejected: "bg-red-100 text-red-700" };
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${map[status] || "bg-stone text-ink/60"}`}>{status}</span>;
};

export default AgentDashboardPage;
