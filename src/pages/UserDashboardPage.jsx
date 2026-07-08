import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowLeftOnRectangleIcon,
  BookmarkIcon,
  ClipboardDocumentListIcon,
  CreditCardIcon,
  HomeModernIcon,
  Squares2X2Icon,
  TicketIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
} from "../components/AppIcons";
import PropertyCard from "../components/PropertyCard";
import DashboardSidebar from "../components/DashboardSidebar";
import Loader from "../components/Loader";
import useAuth from "../hooks/useAuth";
import { fetchMyProperties } from "../services/api/propertyApi";
import { fetchMyLeads, unlockInboxLead, updateLeadApproval } from "../services/api/leadApi";
import { fetchMyPayments } from "../services/api/paymentApi";
import { fetchSavedProperties, toggleSavedProperty } from "../services/api/userApi";
import { buyLeadPackIntent, verifyLeadPackPayment } from "../services/api/customerRequestApi";
import { loadExternalScript } from "../utils/loadExternalScript";
import { PROPERTY_PLACEHOLDER_IMAGE } from "../constants/propertyMedia";
import { getPropertyImageAlt } from "../utils/seo";
import { getInquiryHistory } from "../utils/inquiryHistory";

const SELLER_ROLES = ["seller", "agent", "broker", "builder", "admin"];

const UserDashboardPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, token, logout } = useAuth();
  const [myProperties, setMyProperties] = useState([]);
  const [incomingLeads, setIncomingLeads] = useState([]);
  const [customerLeadCredits, setCustomerLeadCredits] = useState(0);
  const [saved, setSaved] = useState([]);
  const [payments, setPayments] = useState([]);
  const [tab, setTab] = useState(searchParams.get("tab") || "overview");
  const [loading, setLoading] = useState(true);

  const canPostProperty = useMemo(
    () => SELLER_ROLES.includes(user?.role) || Boolean(user?.canPostProperty),
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
        fetchSavedProperties(token),
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
  }, [canPostProperty, token]);

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
    } catch (error) {
      toast.error(error.response?.data?.message || "Unlock failed");
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

      const razorpay = new window.Razorpay(options);
      razorpay.open();
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
      toast.success("5 lead credits added to your account!");
      loadDashboard();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Purchase failed");
    }
  };

  const onToggleSaved = async (propertyId) => {
    try {
      await toggleSavedProperty(token, { propertyId });
      const savedProps = await fetchSavedProperties(token);
      setSaved(savedProps.items || []);
      toast.success("Saved properties updated");
    } catch {
      toast.error("Unable to update saved properties");
    }
  };

  const VALID_TABS = ["overview", "listings", "leads", "inquiries", "payments", "saved"];

  const pendingLeads = incomingLeads.filter((lead) => lead.status === "pending");
  const inquiryHistory = useMemo(() => getInquiryHistory(user?._id), [user?._id, myProperties.length, incomingLeads.length]);
  const sidebarStats = [
    { label: "Properties", value: myProperties.length, icon: <HomeModernIcon className="h-4 w-4" /> },
    { label: "Lead Credits", value: customerLeadCredits, icon: <TicketIcon className="h-4 w-4" /> },
    { label: "Saved", value: saved.length, icon: <BookmarkIcon className="h-4 w-4" /> },
  ];
  const navItems = [
    { key: "overview", label: "Overview", icon: <Squares2X2Icon className="h-4 w-4" /> },
    { key: "listings", label: "My Listings", icon: <HomeModernIcon className="h-4 w-4" /> },
    { key: "leads", label: "Leads", icon: <UserGroupIcon className="h-4 w-4" /> },
    { key: "inquiries", label: "My Inquiries", icon: <ChatBubbleLeftRightIcon className="h-4 w-4" /> },
    { key: "payments", label: "Payments", icon: <CreditCardIcon className="h-4 w-4" /> },
    { key: "saved", label: "Saved", icon: <BookmarkIcon className="h-4 w-4" /> },
  ].map((item) => ({
    ...item,
    active: tab === item.key,
    onClick: setTab,
  }));

  // Sync URL -> tab state (only when URL param changes externally)
  useEffect(() => {
    const nextTab = searchParams.get("tab");
    if (nextTab && VALID_TABS.includes(nextTab) && nextTab !== tab) {
      setTab(nextTab);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Sync tab state -> URL
  useEffect(() => {
    const current = searchParams.get("tab") || "overview";
    if (tab !== current) {
      setSearchParams(tab === "overview" ? {} : { tab }, { replace: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

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
      description="View all your property activity, leads, payments, and saved listings from one clear workspace."
      stats={sidebarStats}
      navItems={navItems}
      onLogout={logout}
    >
      {tab === "overview" && (
        <div className="space-y-6">
          <section className="dashboard-shell p-6 md:p-7">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="dashboard-kicker">Welcome back</p>
                <h2 className="dashboard-display mt-3 text-4xl font-semibold text-slate-900">Hi, {user?.name}</h2>
                <p className="dashboard-muted mt-2 text-sm">
                  Your dashboard gives you quick access to listings, buyer leads, payments, and saved homes.
                </p>
              </div>
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <div className="dashboard-stat p-5">
              <p className="text-sm text-slate-500">Member since</p>
              <p className="mt-2 text-xl font-bold text-slate-900">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN") : "Recently joined"}
              </p>
            </div>
            <div className="dashboard-stat p-5">
              <p className="text-sm text-slate-500">Active plan</p>
              <p className="mt-2 text-xl font-bold text-slate-900">{user?.activePlan?.planId?.name || "Standard"}</p>
            </div>
            <div className="dashboard-stat p-5">
              <p className="text-sm text-slate-500">Lead credits</p>
              <p className="mt-2 text-xl font-bold text-slate-900">{customerLeadCredits}</p>
              <button onClick={onBuyPack} className="dashboard-primary mt-3 px-4 py-2 text-xs">
                <TicketIcon className="h-4 w-4" />
                Buy 5 Credits
              </button>
            </div>
            <div className="dashboard-stat p-5">
              <p className="text-sm text-slate-500">My inquiries</p>
              <p className="mt-2 text-xl font-bold text-slate-900">{inquiryHistory.length}</p>
              <button onClick={() => setTab("inquiries")} className="dashboard-secondary mt-3 px-4 py-2 text-xs">
                View history
              </button>
            </div>
          </section>

          {pendingLeads.length > 0 && (
            <section className="dashboard-panel p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="dashboard-display text-2xl font-semibold text-slate-900">Action required</h3>
                  <p className="dashboard-muted text-sm">You have pending buyer requests waiting for your approval.</p>
                </div>
                <span className="dashboard-chip">{pendingLeads.length} pending</span>
              </div>
              <div className="mt-6 space-y-3">
                {pendingLeads.map((lead) => (
                  <div key={lead._id} className="dashboard-subpanel p-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="font-bold text-slate-900">{lead.contactInfo?.name || "Buyer"}</p>
                        <p className="dashboard-muted text-sm">Property: {lead.propertyId?.title}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleLeadAction(lead._id, "approved")} className="dashboard-primary px-4 py-2 text-xs">
                          Approve
                        </button>
                        <button onClick={() => handleLeadAction(lead._id, "rejected")} className="dashboard-secondary px-4 py-2 text-xs">
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
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="dashboard-display text-2xl font-semibold text-slate-900">Your Property Listings</h2>
              <p className="dashboard-muted text-sm">All active and draft listings are shown here.</p>
            </div>
            <button onClick={() => navigate("/post-property")} className="dashboard-primary px-5 py-2.5 text-sm">
              <ClipboardDocumentListIcon className="h-4 w-4" />
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
                  {myProperties.map((property) => {
                    const isExpired = property.expiresAt && new Date(property.expiresAt) <= new Date();
                    return (
                    <tr key={property._id}>
                      <td>
                        <img
                          src={property.images?.[0] || PROPERTY_PLACEHOLDER_IMAGE}
                          alt={getPropertyImageAlt(property)}
                          className="h-10 w-10 rounded-xl border border-slate-200 object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                      </td>
                      <td className="font-medium text-slate-900">{property.title}</td>
                      <td>{property.location?.city}</td>
                      <td>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isExpired ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}>
                          {isExpired ? "expired" : property.status}
                        </span>
                      </td>
                      <td className="text-right">
                        <button onClick={() => navigate(`/edit-property/${property._id}`)} className="dashboard-secondary px-3 py-2 text-xs">
                          Edit
                        </button>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {tab === "leads" && (
        <section className="dashboard-shell p-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="dashboard-display text-2xl font-semibold text-slate-900">Leads</h2>
              <p className="dashboard-muted text-sm">Review incoming leads and unlock contact information.</p>
            </div>
            <button onClick={onBuyPack} className="dashboard-primary px-5 py-2.5 text-sm">
              <TicketIcon className="h-4 w-4" />
              Buy Credits
            </button>
          </div>
          <div className="space-y-4">
            {incomingLeads
              .filter((lead) => lead.status === "pending")
              .map((lead) => (
                <div key={lead._id} className="dashboard-subpanel p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{lead.contactInfo?.name || "Buyer"}</p>
                      <p className="dashboard-muted text-sm">Property: {lead.propertyId?.title}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleLeadAction(lead._id, "approved")} className="dashboard-primary px-4 py-2 text-xs">
                        Approve
                      </button>
                      <button onClick={() => handleLeadAction(lead._id, "rejected")} className="dashboard-secondary px-4 py-2 text-xs">
                        Reject
                      </button>
                    </div>
                  </div>
                  <div className={`mt-4 rounded-2xl p-4 ${!lead.isUnlockedByOwner ? "bg-white/80 blur-sm grayscale opacity-60" : "bg-white"}`}>
                    <p className="text-sm text-slate-600">
                      {lead.contactInfo?.phone} | {lead.contactInfo?.email}
                    </p>
                    {!lead.isUnlockedByOwner && (
                      <button onClick={() => onUnlockLead(lead._id)} className="mt-2 text-xs font-semibold text-slate-700 underline">
                        Unlock Contact
                      </button>
                    )}
                  </div>
                </div>
              ))}
            {incomingLeads.filter((lead) => lead.status === "pending").length === 0 && (
              <div className="dashboard-empty p-10 text-center">No pending leads found.</div>
            )}
          </div>
        </section>
      )}

      {tab === "inquiries" && (
        <section className="dashboard-shell p-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="dashboard-display text-2xl font-semibold text-slate-900">My Property Inquiries</h2>
              <p className="dashboard-muted text-sm">Track the messages you sent to property owners and the current approval status.</p>
            </div>
          </div>
          {inquiryHistory.length === 0 ? (
            <div className="dashboard-empty p-12 text-center">No property inquiries yet. Open a property and send a message to the owner.</div>
          ) : (
            <div className="space-y-4">
              {inquiryHistory.map((item) => (
                <div key={item.id} className="dashboard-subpanel p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-900">{item.propertyTitle}</p>
                      <p className="dashboard-muted text-sm">{item.propertyLocation || "Hosur property inquiry"}</p>
                      <p className="mt-1 text-xs text-slate-500">Owner: {item.ownerName} • {new Date(item.createdAt).toLocaleString("en-IN")}</p>
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

      {tab === "payments" && (
        <section className="dashboard-shell p-6">
          <h2 className="dashboard-display mb-4 text-2xl font-semibold text-slate-900">Payment History</h2>
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
                {payments.map((payment) => (
                  <tr key={payment._id}>
                    <td className="text-slate-900">{payment.planId?.name || "Lead Pack Credits"}</td>
                    <td>Rs. {payment.amount}</td>
                    <td>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          payment.status === "paid" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {payment.status}
                      </span>
                    </td>
                    <td>{new Date(payment.createdAt).toLocaleDateString("en-IN")}</td>
                  </tr>
                ))}
                {payments.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-slate-500">
                      No payments yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === "saved" && (
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="dashboard-display text-2xl font-semibold text-slate-900">Saved Properties</h2>
              <p className="dashboard-muted text-sm">Review the homes you've bookmarked.</p>
            </div>
            <button onClick={() => navigate("/listings")} className="dashboard-secondary px-4 py-2 text-sm">
              <Squares2X2Icon className="h-4 w-4" />
              Explore Listings
            </button>
          </div>
          {saved.length === 0 ? (
            <div className="dashboard-empty p-12 text-center">You haven&apos;t saved any properties yet.</div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {saved.map((item) => (
                <PropertyCard key={item._id} item={item} isSaved={true} onSave={onToggleSaved} />
              ))}
            </div>
          )}
        </section>
      )}
    </DashboardSidebar>
  );
};

export default UserDashboardPage;
