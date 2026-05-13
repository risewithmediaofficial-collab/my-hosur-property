import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import PropertyCard from "../components/PropertyCard";
import DashboardSidebar from "../components/DashboardSidebar";
import Loader from "../components/Loader";
import useAuth from "../hooks/useAuth";
import { fetchMyProperties } from "../services/api/propertyApi";
import { fetchMyLeads, updateLeadApproval, unlockInboxLead } from "../services/api/leadApi";
import { fetchMyPayments } from "../services/api/paymentApi";
import { fetchSavedProperties } from "../services/api/userApi";
import { buyLeadPackIntent, verifyLeadPackPayment } from "../services/api/customerRequestApi";
import { loadExternalScript } from "../utils/loadExternalScript";
import { PROPERTY_PLACEHOLDER_IMAGE } from "../constants/propertyMedia";
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
  const [tab, setTab] = useState("overview");
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
    } catch {
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
    } catch {
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

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 pt-6 md:pl-80">
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
          <Loader text="Loading your dashboard..." />
        </div>
      </main>
    );
  }

  return (
    <DashboardSidebar
      title={user?.name || "Dashboard"}
      subtitle="My Dashboard"
      description="View all your property activity, leads, payments and saved listings from one clear and mobile-friendly workspace."
      stats={[
        { label: "Properties", value: myProperties.length, icon: "🏠" },
        { label: "Lead Credits", value: customerLeadCredits, icon: "🎟️" },
        { label: "Saved", value: saved.length, icon: "💾" },
      ]}
      navItems={[
        { key: "overview", label: "Overview", icon: "📊" },
        { key: "listings", label: "My Listings", icon: "🏠" },
        { key: "leads", label: "Leads", icon: "👥" },
        { key: "payments", label: "Payments", icon: "💳" },
        { key: "saved", label: "Saved", icon: "⭐" },
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
                <p className="dashboard-kicker text-[#8b6b3f]">Welcome back</p>
                <h2 className="mt-3 text-3xl font-extrabold text-slate-900">Hi, {user?.name}</h2>
                <p className="mt-2 text-sm text-slate-600">Your dashboard gives you quick access to listings, buyer leads, payments and saved homes.</p>
              </div>
              <button onClick={logout} className="dashboard-danger px-6 py-3 text-sm">
                Sign Out
              </button>
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <div className="dashboard-stat p-5">
              <p className="text-sm text-slate-500">Member since</p>
              <p className="mt-2 text-xl font-bold text-slate-900">{new Date(user?.createdAt).toLocaleDateString("en-IN")}</p>
            </div>
            <div className="dashboard-stat p-5">
              <p className="text-sm text-slate-500">Active plan</p>
              <p className="mt-2 text-xl font-bold text-slate-900">{user?.activePlan?.planId?.name || "Standard"}</p>
            </div>
            <div className="dashboard-stat p-5">
              <p className="text-sm text-slate-500">Lead credits</p>
              <p className="mt-2 text-xl font-bold text-slate-900">{customerLeadCredits}</p>
              <button onClick={onBuyPack} className="dashboard-primary mt-3 px-4 py-2 text-xs">
                Buy 5 Credits
              </button>
            </div>
          </section>

          {pendingLeads.length > 0 && (
            <section className="dashboard-panel p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Action required</h3>
                  <p className="text-sm text-slate-600">You have pending buyer requests waiting for your approval.</p>
                </div>
                <span className="rounded-full bg-[#fff8ef] px-4 py-2 text-sm font-semibold text-[#8b6b3f]">{pendingLeads.length} pending</span>
              </div>
              <div className="mt-6 space-y-3">
                {pendingLeads.map((l) => (
                  <div key={l._id} className="dashboard-subpanel p-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="font-bold text-slate-900">{l.contactInfo?.name || "Buyer"}</p>
                        <p className="text-sm text-slate-600">Property: {l.propertyId?.title}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleLeadAction(l._id, "approved")} className="dashboard-primary px-4 py-2 text-xs">
                          Approve
                        </button>
                        <button onClick={() => handleLeadAction(l._id, "rejected")} className="dashboard-secondary px-4 py-2 text-xs">
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {tab === "listings" && (
        <section className="dashboard-shell p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Your Property Listings</h2>
              <p className="text-sm text-slate-600">All active and draft listings are shown here.</p>
            </div>
            <button onClick={() => navigate("/post-property")} className="dashboard-primary px-5 py-2.5 text-sm">
              Post New
            </button>
          </div>
          {myProperties.length === 0 ? (
            <div className="dashboard-empty p-10 text-center">No properties posted yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="dashboard-table min-w-full text-left text-sm">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Listing</th>
                    <th>City</th>
                    <th>Status</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {myProperties.map((p) => (
                    <tr key={p._id}>
                      <td><img src={p.images?.[0] || PROPERTY_PLACEHOLDER_IMAGE} alt="Property" className="h-10 w-10 rounded-xl object-cover border border-slate-200" /></td>
                      <td className="font-medium text-slate-900">{p.title}</td>
                      <td>{p.location?.city}</td>
                      <td><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{p.status}</span></td>
                      <td className="text-right"><button onClick={() => navigate(`/edit-property/${p._id}`)} className="dashboard-secondary px-3 py-2 text-xs">Edit</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {tab === "leads" && (
        <section className="dashboard-shell p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Leads</h2>
              <p className="text-sm text-slate-600">Review incoming leads and unlock contact information.</p>
            </div>
            <button onClick={onBuyPack} className="dashboard-primary px-5 py-2.5 text-sm">
              Buy Credits
            </button>
          </div>
          <div className="space-y-4">
            {incomingLeads.filter((l) => l.status === "pending").map((l) => (
              <div key={l._id} className="dashboard-subpanel p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{l.contactInfo?.name || "Buyer"}</p>
                    <p className="text-sm text-slate-600">Property: {l.propertyId?.title}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleLeadAction(l._id, "approved")} className="dashboard-primary px-4 py-2 text-xs">Approve</button>
                    <button onClick={() => handleLeadAction(l._id, "rejected")} className="dashboard-secondary px-4 py-2 text-xs">Reject</button>
                  </div>
                </div>
                <div className={`mt-4 rounded-2xl p-4 ${!l.isUnlockedByOwner ? "bg-white/80 blur-sm grayscale opacity-60" : "bg-white"}`}>
                  <p className="text-sm text-slate-600">{l.contactInfo?.phone} | {l.contactInfo?.email}</p>
                  {!l.isUnlockedByOwner && <button onClick={() => onUnlockLead(l._id)} className="mt-2 text-xs font-semibold text-[#8b6b3f] underline">Unlock Contact</button>}
                </div>
              </div>
            ))}
            {incomingLeads.filter((l) => l.status === "pending").length === 0 && <div className="dashboard-empty p-10 text-center">No pending leads found.</div>}
          </div>
        </section>
      )}

      {tab === "payments" && (
        <section className="dashboard-shell p-6">
          <h2 className="mb-4 text-xl font-bold text-slate-900">Payment History</h2>
          <div className="overflow-x-auto">
            <table className="dashboard-table min-w-full text-left text-sm">
              <thead>
                <tr>
                  <th>Plan</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p._id}>
                    <td className="text-slate-900">{p.planId?.name || "Lead Pack Credits"}</td>
                    <td>Rs. {p.amount}</td>
                    <td><span className={`rounded-full px-3 py-1 text-xs font-semibold ${p.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{p.status}</span></td>
                    <td>{new Date(p.createdAt).toLocaleDateString("en-IN")}</td>
                  </tr>
                ))}
                {payments.length === 0 && <tr><td colSpan={4} className="py-10 text-center text-slate-500">No payments yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === "saved" && (
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Saved Properties</h2>
              <p className="text-sm text-slate-600">Review the homes you've bookmarked.</p>
            </div>
            <button onClick={() => navigate("/")} className="dashboard-secondary px-4 py-2 text-sm">
              Explore Listings
            </button>
          </div>
          {saved.length === 0 ? (
            <div className="dashboard-empty p-12 text-center">You haven't saved any properties yet.</div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {saved.map((item) => <PropertyCard key={item._id} item={item} isSaved={true} />)}
            </div>
          )}
        </section>
      )}
    </DashboardSidebar>
  );
};

export default UserDashboardPage;
