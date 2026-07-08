import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  BoltIcon,
  BookmarkIcon,
  ClipboardDocumentListIcon,
  HomeModernIcon,
  Squares2X2Icon,
  TicketIcon,
  UserGroupIcon,
} from "../components/AppIcons";
import useAuth from "../hooks/useAuth";
import { fetchMyProperties, promoteProperty } from "../services/api/propertyApi";
import { fetchMyLeads, unlockInboxLead, updateLeadApproval, updateLeadStatus } from "../services/api/leadApi";
import {
  buyLeadPackIntent,
  fetchCustomerRequestsForAgents,
  sendMatchNotification,
  unlockCustomerLeadIntent,
  verifyCustomerLeadUnlock,
  verifyLeadPackPayment,
} from "../services/api/customerRequestApi";
import { loadExternalScript } from "../utils/loadExternalScript";
import DashboardSidebar from "../components/DashboardSidebar";
import Loader from "../components/Loader";
import PropertyCard from "../components/PropertyCard";
import { PROPERTY_PLACEHOLDER_IMAGE } from "../constants/propertyMedia";
import { fetchSavedProperties, toggleSavedProperty } from "../services/api/userApi";
import { getPropertyImageAlt } from "../utils/seo";

const fmt = (value) =>
  new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const StatusBadge = ({ status }) => {
  const styles = {
    approved: "bg-green-100 text-green-700",
    pending: "bg-amber-100 text-amber-700",
    rejected: "bg-red-100 text-red-700",
    expired: "bg-slate-200 text-slate-700",
  };

  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${styles[status] || "bg-slate-100 text-slate-600"}`}>
      {status}
    </span>
  );
};

const AgentDashboardPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { token, user } = useAuth();
  const isBroker = ["agent", "broker"].includes(user?.role);

  const [properties, setProperties] = useState([]);
  const [leads, setLeads] = useState([]);
  const [customerRequests, setCustomerRequests] = useState([]);
  const [customerLeadCredits, setCustomerLeadCredits] = useState(0);
  const [saved, setSaved] = useState([]);
  const [leadUnlockPrice] = useState(200);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(searchParams.get("tab") || "overview");

  const loadAll = useCallback(async () => {
    try {
      const results = await Promise.allSettled([
        fetchMyProperties(token),
        fetchMyLeads(token),
        fetchSavedProperties(token),
        isBroker ? fetchCustomerRequestsForAgents(token) : Promise.resolve({ items: [], customerLeadCredits: 0 }),
      ]);

      if (results[0].status === "fulfilled") setProperties(results[0].value.items || []);
      if (results[1].status === "fulfilled") {
        setLeads(results[1].value.items || []);
        setCustomerLeadCredits(results[1].value.customerLeadCredits || 0);
      }
      if (results[2].status === "fulfilled") setSaved(results[2].value.items || []);
      if (results[3].status === "fulfilled") {
        setCustomerRequests(results[3].value.items || []);
        if (results[3].value.customerLeadCredits !== undefined) {
          setCustomerLeadCredits(results[3].value.customerLeadCredits);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [isBroker, token]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const onPromote = async (id) => {
    try {
      await promoteProperty(token, id);
      toast.success("Listing boosted");
      loadAll();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to boost");
    }
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
  };

  const onSendMatch = async (id) => {
    try {
      await sendMatchNotification(token, id);
      toast.success("Match notification sent");
      loadAll();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to notify");
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

  const onUnlockCustomerRequest = async (id) => {
    try {
      const response = await unlockCustomerLeadIntent(token, id);
      if (response.isUnlocked) {
        toast.success("Lead unlocked using credits!");
        loadAll();
        return;
      }

      if (response.razorpay?.orderId) {
        const paymentResponse = await openRazorpayCheckout(response, "Unlock Lead");
        await verifyCustomerLeadUnlock(token, {
          unlockId: response.unlockId,
          razorpayOrderId: paymentResponse.razorpay_order_id,
          razorpayPaymentId: paymentResponse.razorpay_payment_id,
          razorpaySignature: paymentResponse.razorpay_signature,
        });
        toast.success("Lead unlocked successfully");
        loadAll();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Lead unlock failed");
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
    } catch (error) {
      toast.error(error.response?.data?.message || "Unlock failed");
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
      toast.success("5 lead credits added to your account!");
      loadAll();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Purchase failed");
    }
  };

  const onToggleSaved = async (propertyId) => {
    try {
      await toggleSavedProperty(token, { propertyId });
      const savedResponse = await fetchSavedProperties(token);
      setSaved(savedResponse.items || []);
      toast.success("Saved properties updated");
    } catch {
      toast.error("Unable to update saved properties");
    }
  };

  const tabs = [
    { key: "overview", label: "Overview", icon: <Squares2X2Icon className="h-4 w-4" /> },
    { key: "listings", label: "Listings", icon: <HomeModernIcon className="h-4 w-4" /> },
    { key: "leads", label: "Leads", icon: <UserGroupIcon className="h-4 w-4" /> },
    { key: "saved", label: "Saved", icon: <BookmarkIcon className="h-4 w-4" /> },
    ...(isBroker ? [{ key: "requests", label: "Requests", icon: <ClipboardDocumentListIcon className="h-4 w-4" /> }] : []),
  ];
  const sidebarStats = [
    { label: "Total Listings", value: properties.length, icon: <HomeModernIcon className="h-4 w-4" /> },
    { label: "Active Leads", value: leads.length, icon: <UserGroupIcon className="h-4 w-4" /> },
    { label: "Lead Credits", value: customerLeadCredits, icon: <TicketIcon className="h-4 w-4" /> },
    { label: "Saved", value: saved.length, icon: <BookmarkIcon className="h-4 w-4" /> },
  ];

  useEffect(() => {
    const nextTab = searchParams.get("tab");
    if (nextTab && tabs.some((item) => item.key === nextTab) && nextTab !== tab) {
      setTab(nextTab);
    }
  }, [searchParams, tab, tabs]);

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
          <Loader text="Loading dashboard..." />
        </div>
      </main>
    );
  }

  return (
    <DashboardSidebar
      title={user?.name || "Agent"}
      subtitle="Agent / Developer Panel"
      description="Manage your listings, leads, and customer requirements from a cleaner, easier-to-access workspace."
      stats={sidebarStats}
      navItems={tabs.map((item) => ({
        ...item,
        active: tab === item.key,
        badge: item.key === "requests" && customerRequests.length ? customerRequests.length : undefined,
        onClick: setTab,
      }))}
    >
      {tab === "overview" && (
        <div className="space-y-6">
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { label: "Total Listings", value: properties.length, icon: <HomeModernIcon className="h-5 w-5" /> },
              { label: "Active Leads", value: leads.length, icon: <UserGroupIcon className="h-5 w-5" /> },
              { label: "Lead Credits", value: customerLeadCredits, icon: <TicketIcon className="h-5 w-5" /> },
            ].map(({ label, value, icon }) => (
              <div key={label} className="dashboard-stat p-5 text-slate-900">
                <div className="flex items-center gap-3 text-slate-700">
                  <div className="rounded-full bg-slate-100 p-2.5">
                    {icon}
                  </div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">{label}</p>
                </div>
                <p className="mt-5 text-4xl font-extrabold text-slate-900">{value}</p>
              </div>
            ))}
          </section>

          <section className="dashboard-shell p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="dashboard-display text-2xl font-semibold text-slate-900">Lead Credits & Unlocks</h2>
                <p className="dashboard-muted mt-2 text-sm">
                  Unlock customer inquiries and property leads with one simple credit pack.
                </p>
              </div>
              <button onClick={onBuyPack} className="dashboard-primary px-5 py-3 text-sm">
                <TicketIcon className="h-4 w-4" />
                Buy 5 Credits @ Rs.300
              </button>
            </div>
          </section>
        </div>
      )}

      {tab === "listings" && (
        <section className="dashboard-shell p-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="dashboard-display text-2xl font-semibold text-slate-900">Manage Listings</h2>
              <p className="dashboard-muted text-sm">Edit, boost, and review the properties you currently publish.</p>
            </div>
            <button onClick={() => navigate("/post-property")} className="dashboard-primary px-4 py-2 text-sm">
              <ClipboardDocumentListIcon className="h-4 w-4" />
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
                {properties.map((property) => {
                  const isExpired = property.expiresAt && new Date(property.expiresAt) <= new Date();
                  return (
                  <tr key={property._id}>
                    <td>
                      <img
                        src={property.images?.[0] || PROPERTY_PLACEHOLDER_IMAGE}
                        alt={getPropertyImageAlt(property)}
                        className="h-12 w-12 rounded-xl border border-slate-200 object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    </td>
                    <td className="font-medium text-slate-900">{property.title}</td>
                    <td>{property.location?.city}</td>
                    <td>
                      {isExpired ? <StatusBadge status="expired" /> : <StatusBadge status={property.status} />}
                    </td>
                    <td>Rs.{(property.price || 0).toLocaleString("en-IN")}</td>
                    <td className="space-x-2 text-right">
                      <button onClick={() => onPromote(property._id)} className="dashboard-primary px-3 py-2 text-xs">
                        <BoltIcon className="h-4 w-4" />
                        Boost
                      </button>
                      <button onClick={() => navigate(`/edit-property/${property._id}`)} className="dashboard-secondary px-3 py-2 text-xs">
                        Edit
                      </button>
                    </td>
                  </tr>
                  );
                })}
                {properties.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      No listings yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === "leads" && (
        <section className="dashboard-shell p-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="dashboard-display text-2xl font-semibold text-slate-900">Property Inquiries</h2>
              <p className="dashboard-muted text-sm">View incoming buyer leads and unlock contact data as needed.</p>
            </div>
            <div className="dashboard-subpanel px-4 py-3 text-sm font-semibold text-slate-900">Credits: {customerLeadCredits}</div>
          </div>
          <div className="overflow-x-auto">
            <table className="dashboard-table min-w-full text-left text-sm">
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Contact</th>
                  <th>Intent</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead._id}>
                    <td>
                      <p className="font-semibold text-slate-900">{lead.propertyId?.title || "-"}</p>
                      <p className="text-xs text-slate-500">{fmt(lead.createdAt)}</p>
                    </td>
                    <td>
                      <div className={!lead.isUnlockedByOwner ? "blur-sm grayscale opacity-40" : ""}>
                        <p className="font-bold text-slate-900">{lead.contactInfo?.name}</p>
                        <p className="text-xs text-slate-600">{lead.contactInfo?.phone}</p>
                        <p className="text-xs text-slate-600">{lead.contactInfo?.email}</p>
                      </div>
                      {!lead.isUnlockedByOwner && (
                        <button onClick={() => onUnlockInboxLead(lead._id)} className="mt-2 text-[11px] font-semibold text-slate-700 underline">
                          Unlock Contact
                        </button>
                      )}
                    </td>
                    <td>
                      <p className="inline-flex rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold uppercase text-slate-600">
                        {lead.intentType}
                      </p>
                      {lead.contactInfo?.message ? <p className="mt-1 text-xs italic text-slate-500">&quot;{lead.contactInfo.message}&quot;</p> : null}
                    </td>
                    <td>
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase ${
                          lead.status === "approved"
                            ? "bg-emerald-100 text-emerald-700"
                            : lead.status === "pending"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {lead.status}
                      </span>
                    </td>
                    <td className="space-y-2 text-right">
                      {lead.status === "pending" && (
                        <div className="flex flex-wrap justify-end gap-2">
                          <button onClick={() => onLeadAction(lead._id, "approved")} className="dashboard-primary px-3 py-2 text-xs">
                            Approve
                          </button>
                          <button onClick={() => onLeadAction(lead._id, "rejected")} className="dashboard-secondary px-3 py-2 text-xs">
                            Reject
                          </button>
                        </div>
                      )}
                      {!lead.isUnlockedByOwner && (
                        <button onClick={() => onUnlockInboxLead(lead._id)} className="dashboard-secondary px-3 py-2 text-[11px]">
                          Unlock Lead
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {leads.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500">
                      No inquiries received yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === "saved" && (
        <section className="dashboard-shell p-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="dashboard-display text-2xl font-semibold text-slate-900">Saved Properties</h2>
              <p className="dashboard-muted text-sm">Keep your shortlisted homes close while managing leads and listings.</p>
            </div>
            <button onClick={() => navigate("/listings")} className="dashboard-secondary px-4 py-2 text-sm">
              Explore Listings
            </button>
          </div>
          {saved.length === 0 ? (
            <div className="dashboard-empty p-12 text-center">You haven&apos;t saved any properties yet.</div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {saved.map((item) => (
                <PropertyCard key={item._id} item={item} isSaved={true} onSave={onToggleSaved} />
              ))}
            </div>
          )}
        </section>
      )}

      {tab === "requests" && isBroker && (
        <section className="space-y-4">
          {customerRequests.map((request) => (
            <div key={request._id} className="dashboard-shell p-6 transition hover:shadow-lg">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
                    <span className="rounded-full bg-slate-100 px-2 py-1">{request.propertyType}</span>
                    <span>
                      {request.location?.area}, {request.location?.city}
                    </span>
                  </div>
                  <h2 className="dashboard-display text-2xl font-semibold text-slate-900">Customer Requirement</h2>
                  <p className="dashboard-muted text-sm">
                    Budget: Rs.{(request.budgetMin || 0).toLocaleString()} - Rs.{(request.budgetMax || 0).toLocaleString()}
                  </p>
                  {request.additionalRequirements ? <p className="text-sm italic text-slate-500">{request.additionalRequirements}</p> : null}
                </div>
                <div className="min-w-[180px] space-y-2">
                  <button onClick={() => onSendMatch(request._id)} className="dashboard-secondary w-full px-4 py-3 text-sm">
                    Send Match
                  </button>
                  {!request.isContactUnlocked && (
                    <button onClick={() => onUnlockCustomerRequest(request._id)} className="dashboard-primary w-full px-4 py-3 text-sm">
                      {customerLeadCredits > 0 ? "Unlock (1 Credit)" : `Unlock Rs.${leadUnlockPrice}`}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {customerRequests.length === 0 && <div className="dashboard-empty p-10 text-center">No customer requirements found.</div>}
        </section>
      )}
    </DashboardSidebar>
  );
};

export default AgentDashboardPage;
