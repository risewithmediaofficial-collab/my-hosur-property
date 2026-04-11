import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import PropertyCard from "../components/PropertyCard";
import useAuth from "../hooks/useAuth";
import { fetchMyProperties } from "../services/api/propertyApi";
import { fetchMyLeads, updateLeadApproval, unlockInboxLead } from "../services/api/leadApi";
import { fetchMyPayments } from "../services/api/paymentApi";
import { fetchSavedProperties } from "../services/api/userApi";
import { buyLeadPackIntent, verifyLeadPackPayment } from "../services/api/customerRequestApi";
import { loadExternalScript } from "../utils/loadExternalScript";
import toast from "react-hot-toast";

const SELLER_ROLES = ["seller", "agent", "broker", "builder", "admin"];

const UserDashboardPage = () => {
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();
  const [myProperties, setMyProperties] = useState([]);
  const [incomingLeads, setIncomingLeads] = useState([]);
  const [customerLeadCredits, setCustomerLeadCredits] = useState(0);
  const [saved, setSaved] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const canPostProperty = useMemo(() => 
    SELLER_ROLES.includes(user?.role) || Boolean(user?.canPostProperty), 
    [user?.role, user?.canPostProperty]
  );

  const loadDashboard = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [props, leadsRes, pay, savedProps] = await Promise.all([
        canPostProperty ? fetchMyProperties(token) : Promise.resolve({ items: [] }),
        fetchMyLeads(token),
        fetchMyPayments(token),
        fetchSavedProperties(token)
      ]);
      setMyProperties(props.items || []);
      setIncomingLeads(leadsRes.items || []);
      setCustomerLeadCredits(leadsRes.customerLeadCredits || 0);
      setPayments(pay.items || []);
      setSaved(savedProps.items || []);
    } catch (e) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [token, canPostProperty]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleLeadAction = async (id, status) => {
    try {
      await updateLeadApproval(token, id, status);
      toast.success(`Request ${status}`);
      loadDashboard();
    } catch (e) {
      toast.error("Action failed");
    }
  };

  const onUnlockLead = async (id) => {
    try {
      if (customerLeadCredits <= 0) {
        toast.error("No lead credits available. Buy a pack (300rs for 5).");
        return;
      }
      await unlockInboxLead(token, id);
      toast.success("Lead unlocked!");
      loadDashboard();
    } catch (e) {
      toast.error(e.response?.data?.message || "Unlock failed");
    }
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
      loadDashboard();
    } catch (e) {
      toast.error(e.response?.data?.message || e.message || "Purchase failed");
    }
  };

  const pendingLeads = incomingLeads.filter((l) => l.status === "pending");

  if (loading && !incomingLeads.length) {
    return <div className="flex h-64 items-center justify-center font-bold text-ink/40">Loading Dashboard...</div>;
  }

  return (
    <main className="mx-auto max-w-7xl space-y-10 px-4 py-8 md:px-8">
      {/* Header Section */}
      <section className="glass-panel flex flex-col justify-between gap-6 rounded-[2.5rem] border border-white/70 bg-gradient-to-br from-white/80 to-[#f1f7ff] p-8 shadow-soft md:flex-row md:items-center md:p-12">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-3 rounded-full bg-sage/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-sage">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sage opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-sage"></span>
            </span>
            Profile Dashboard
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">Welcome, {user?.name}</h1>
          <div className="flex flex-wrap gap-4 text-sm font-semibold text-ink/70">
             <p className="flex items-center gap-2">Member since: {new Date(user?.createdAt).toLocaleDateString("en-IN")}</p>
             <p className="flex items-center gap-2 px-3 py-1 bg-white rounded-full border border-clay/50">Plan: {user?.activePlan?.planId?.name || "Standard"}</p>
             <div className="flex items-center gap-2 px-3 py-1 bg-sage/10 text-sage rounded-full border border-sage/20">
                <span>Lead Credits: <b>{customerLeadCredits}</b></span>
                <button onClick={onBuyPack} className="text-[10px] underline font-bold uppercase ml-2 hover:text-ink transition-colors">Buy 5 (Rs.300)</button>
             </div>
          </div>
        </div>
        <button onClick={logout} className="neo-btn self-start rounded-2xl px-10 py-4 text-sm font-bold text-red-500 shadow-md transition-all hover:bg-stone">
          Sign Out
        </button>
      </section>
      
      {/* Monetization Top-up Card */}
      <section className="rounded-3xl bg-gradient-to-br from-ink to-ink/90 p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
         <div className="absolute top-0 right-0 w-32 h-32 bg-sage/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
         <div className="space-y-2 relative z-10">
            <h2 className="text-2xl font-extrabold flex items-center gap-3">
                <span className="text-3xl">🚀</span> Fast-track Your Property Deals
            </h2>
            <p className="text-stone/60 text-sm max-w-md">Unlock unlimited access to buyer contact details. Purchase lead credits to reveal phone numbers and email addresses of interested customers.</p>
         </div>
         <div className="flex flex-col items-center gap-3 relative z-10 w-full md:w-auto">
            <div className="text-center px-6 py-3 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm w-full md:w-auto">
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-60">Pack Special</p>
                <p className="text-2xl font-black">5 Credits</p>
            </div>
            <button 
                onClick={onBuyPack}
                className="w-full md:w-[240px] rounded-2xl bg-sage px-8 py-4 text-sm font-black text-white shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
            >
                Get 5 Credits @ Rs.300
            </button>
         </div>
      </section>

      {/* Pending Contact Requests */}
      {pendingLeads.length > 0 && (
         <section className="rounded-2xl border-2 border-sage/30 bg-white p-6 shadow-soft animate-fade-in">
           <h2 className="text-xl font-bold text-ink">Action Required: Contact Requests</h2>
           <p className="mt-1 text-sm text-ink/70">Buyers want to view your mobile number. Approve below to grant access.</p>
           <div className="mt-4 space-y-3">
             {pendingLeads.map((l) => (
                <div key={l._id} className="flex flex-wrap items-center justify-between gap-4 p-4 bg-sage/5 rounded-xl border border-sage/10 hover:bg-sage/10 transition-colors">
                  <div className="flex-1">
                    <p className={`font-bold text-ink ${!l.isUnlockedByOwner ? 'blur-sm select-none grayscale' : ''}`}>
                        {l.contactInfo?.name || "Buyer"} requested your contact
                    </p>
                    <p className="text-sm text-ink/70">Property: {l.propertyId?.title}</p>
                    <div className={`mt-1 text-xs text-ink/60 transition-all ${!l.isUnlockedByOwner ? 'blur-sm select-none grayscale opacity-40' : ''}`}>
                        {l.contactInfo?.phone} | {l.contactInfo?.email}
                    </div>
                    {!l.isUnlockedByOwner && (
                        <button onClick={() => onUnlockLead(l._id)} className="mt-1 text-[10px] font-bold text-sage underline hover:text-ink">
                            Unlock Contact (1 Credit)
                        </button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleLeadAction(l._id, "approved")}
                      className="rounded-md bg-sage px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:opacity-90 active:scale-95 transition-all"
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => handleLeadAction(l._id, "rejected")}
                      className="rounded-md bg-ink px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:opacity-90 active:scale-95 transition-all"
                    >
                      Reject
                    </button>
                  </div>
                </div>
             ))}
           </div>
         </section>
      )}

      {/* Property Listings (For Sellers/Agents) */}
      {canPostProperty && (
        <section className="rounded-2xl border border-clay/70 bg-white p-6 shadow-soft">
          <div className="flex items-center justify-between gap-4 mb-6">
             <h2 className="text-xl font-bold">Your Property Listings</h2>
             <button onClick={() => navigate("/post-property")} className="rounded-xl bg-ink px-6 py-2.5 text-sm font-bold text-stone shadow-sm hover:opacity-90 transition-opacity">Post New</button>
          </div>
          {myProperties.length === 0 ? (
            <div className="py-12 text-center text-ink/50 bg-stone/20 rounded-2xl border border-dashed border-clay">No properties posted yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-clay text-ink/60 font-semibold uppercase tracking-wider">
                    <th className="py-2">Image</th>
                    <th className="py-2">Listing</th>
                    <th className="py-2">City</th>
                    <th className="py-2">Status</th>
                    <th className="py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-clay/40">
                  {myProperties.map((p) => (
                    <tr key={p._id} className="align-middle hover:bg-stone/20 transition-colors">
                      <td className="py-4">
                         <img 
                          src={p.images?.[0] || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=120&q=80"} 
                          alt="Property" 
                          className="h-10 w-10 rounded-md object-cover border border-clay shadow-sm" 
                         />
                      </td>
                      <td className="py-4 font-medium text-ink">{p.title}</td>
                      <td className="py-4 text-ink/70">{p.location?.city}</td>
                      <td className="py-4 text-ink/70">
                         <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight ${p.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                           {p.status}
                         </span>
                      </td>
                      <td className="py-4 text-right">
                         <button 
                          onClick={() => navigate(`/edit-property/${p._id}`)} 
                          className="rounded-md border border-clay bg-white px-3 py-1 text-xs font-semibold text-ink/70 hover:bg-stone transition-all shadow-sm"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* History Section */}
      <div className="grid gap-8 lg:grid-cols-2">
        <section className="rounded-2xl border border-clay/70 bg-white p-6 shadow-soft">
          <h2 className="mb-4 text-xl font-bold">Contact History</h2>
          <p className="mb-4 text-sm text-ink/60 italic">First 5 leads are free to view. Beyond that, use credits to unlock.</p>
          <div className="max-h-96 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
             {incomingLeads.filter(l => l.status !== "pending").length === 0 ? (
               <p className="py-8 text-center text-ink/40 italic">No history available</p>
             ) : (
               incomingLeads.filter(l => l.status !== "pending").map(l => (
                <div key={l._id} className="group flex flex-col p-4 bg-white rounded-xl border border-clay/50 shadow-sm hover:shadow-md transition-all">
                   <div className="flex items-center justify-between mb-2">
                      <div>
                         <p className={`font-bold text-ink ${!l.isUnlockedByOwner ? 'blur-[3px] select-none grayscale' : ''}`}>
                            {l.contactInfo?.name || "Buyer"}
                         </p>
                         <p className="text-[10px] text-ink/50">Property: {l.propertyId?.title}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-widest ${l.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                         {l.status}
                      </span>
                   </div>
                   {!l.isUnlockedByOwner ? (
                       <button onClick={() => onUnlockLead(l._id)} className="text-[10px] font-bold text-sage underline text-left hover:text-ink">
                           Unlock 1 Lead (1 Credit)
                       </button>
                   ) : (
                       <div className="text-[11px] text-ink/60 font-medium">
                           {l.contactInfo?.phone} | {l.contactInfo?.email}
                       </div>
                   )}
                </div>
               ))
             )}
          </div>
        </section>

        <section className="rounded-2xl border border-clay/70 bg-white p-6 shadow-soft">
          <h2 className="text-xl font-bold mb-4">Payment History</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-ink/60 font-semibold uppercase text-[10px] tracking-wider">
                <tr className="border-b border-clay">
                  <th className="py-2">Item/Plan</th>
                  <th className="py-2">Amount</th>
                  <th className="py-2">Status</th>
                  <th className="py-2 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-clay/40">
                {payments.map((p) => (
                  <tr key={p._id} className="hover:bg-stone/20 transition-colors">
                    <td className="py-3 font-medium text-ink">{p.planId?.name || "Lead Pack Credits"}</td>
                    <td className="py-3 text-ink/80 text-xs font-bold font-mono">Rs. {p.amount}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${p.status === 'paid' ? 'bg-green-50 text-green-600' : 'bg-stone text-ink/50'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 text-right font-mono text-[9px] text-ink/40">{p.transactionId?.slice(-8)}</td>
                  </tr>
                ))}
                {payments.length === 0 && <tr><td colSpan={4} className="py-8 text-center text-ink/40">No transactions recorded</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Wishlist */}
      <section className="animate-fade-in">
        <h2 className="mb-6 text-2xl font-extrabold text-ink inline-flex items-center gap-3">
           Wishlist / Saved Properties
           <span className="px-3 py-1 bg-ink text-white text-xs rounded-full">{saved.length}</span>
        </h2>
        {saved.length === 0 ? (
          <div className="py-16 text-center glass-panel rounded-[2rem] border border-dashed border-clay">
             <p className="text-ink/50 font-medium">You haven't saved any properties yet.</p>
             <button onClick={() => navigate("/")} className="mt-4 text-sage font-bold hover:underline">Explore Listings</button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {saved.map((item) => <PropertyCard key={item._id} item={item} isSaved={true} />)}
          </div>
        )}
      </section>
    </main>
  );
};

export default UserDashboardPage;
