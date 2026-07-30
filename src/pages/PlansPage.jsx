import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { CheckCircleIcon, ShieldCheckIcon } from "../components/AppIcons";
import useAuth from "../hooks/useAuth";
import { fetchPlans } from "../services/api/planApi";
import { fetchMyPayments } from "../services/api/paymentApi";
import { loadExternalScript } from "../utils/loadExternalScript";
import { currency } from "../utils/format";
import useScrollAnimation from "../hooks/useScrollAnimation";
import QrPaymentModal from "../components/QrPaymentModal";

const fallbackPlans = [
  {
    name: "Free / 1st Time User",
    subtitle: "3 Free Postings for 1st Time Users",
    price: 0,
    billingLabel: "Free",
    ctaLabel: "Start Free",
    recommended: false,
    listingLimit: 3,
    contactUnlocks: 30,
    leadCredits: 0,
    durationDays: 90,
    features: [
      "3 Free Property Postings for 1st time users",
      "Posts valid for 90 days",
      "1 Contact Request per day limit",
      "Standard Search Visibility",
    ],
  },
  {
    name: "Pro Agent Plan",
    subtitle: "Most Popular Choice for Agents",
    price: 2999,
    billingLabel: "/month",
    ctaLabel: "Choose Pro Plan",
    recommended: true,
    listingLimit: 6,
    contactUnlocks: 25,
    leadCredits: 20,
    durationDays: 30,
    features: [
      "6 Active Property Listings",
      "25 Customer Contact Requests",
      "20 Verified Lead Credits",
      "Featured Property Highlights",
      "Priority Agent Support",
    ],
  },
  {
    name: "Premium Agent Plan",
    subtitle: "For established agencies & top brokers",
    price: 4999,
    billingLabel: "/month",
    ctaLabel: "Choose Premium Plan",
    recommended: false,
    listingLimit: 12,
    contactUnlocks: 35,
    leadCredits: 30,
    durationDays: 30,
    features: [
      "12 Active Property Listings",
      "35 Customer Contact Requests",
      "30 Verified Lead Credits",
      "Top Search Placement & Priority Boost",
      "Dedicated Relationship Support",
    ],
  },
  {
    name: "Database Pack: ₹2,500",
    subtitle: "Hosur Buyer & Investor Contacts Pack",
    price: 2500,
    billingLabel: "/package",
    ctaLabel: "Purchase Database Pack",
    recommended: false,
    category: "database_access",
    features: [
      "Verified Hosur Buyer & Investor Contacts",
      "Direct Buyer Phone & Email Access",
      "Location & Budget Preference Data",
    ],
  },
  {
    name: "Database Pack: ₹5,000",
    subtitle: "Complete Hosur Real Estate Contacts Pack",
    price: 5000,
    billingLabel: "/package",
    ctaLabel: "Purchase Database Pack",
    recommended: true,
    category: "database_access",
    features: [
      "Complete Hosur Real Estate Contact Database",
      "Separate Buyer, Seller & Investor Lists",
      "Full Contact Info & Requirement Details",
      "Priority Updates & Direct Download Access",
    ],
  },
];

const orderByName = {
  "Free / 1st Time User": 1,
  "Pro Agent Plan": 2,
  "Premium Agent Plan": 3,
};

const normalizePlan = (plan) => {
  const fallback = fallbackPlans.find((item) => item.name.toLowerCase() === String(plan.name || "").toLowerCase());
  return {
    ...fallback,
    ...plan,
    subtitle: plan.subtitle || fallback?.subtitle || "Professional plan",
    billingLabel: plan.billingLabel ?? fallback?.billingLabel ?? "/month",
    ctaLabel: plan.ctaLabel || fallback?.ctaLabel || "Buy plan",
    features: plan.features?.length ? plan.features : fallback?.features || [],
    recommended: typeof plan.recommended === "boolean" ? plan.recommended : Boolean(fallback?.recommended),
  };
};

const PlansPage = () => {
  useScrollAnimation();
  const navigate = useNavigate();
  const { token, user, refreshProfile } = useAuth();
  const [plans, setPlans] = useState([]);
  const [buyingPlanId, setBuyingPlanId] = useState("");
  const [payments, setPayments] = useState([]);
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  useEffect(() => {
    fetchPlans(user?.role ? { targetRole: user.role } : {})
      .then((res) => {
        const fetched = (res.items || []).map(normalizePlan);
        if (!fetched.length) {
          setPlans(fallbackPlans);
          return;
        }
        const sorted = [...fetched].sort((a, b) => {
          const oa = orderByName[a.name] || 99;
          const ob = orderByName[b.name] || 99;
          return oa - ob || Number(a.price || 0) - Number(b.price || 0);
        });
        setPlans(sorted);
      })
      .catch(() => setPlans(fallbackPlans));
  }, [user?.role]);

  useEffect(() => {
    if (!token) return;
    fetchMyPayments(token)
      .then((res) => setPayments(res.items || []))
      .catch(() => setPayments([]));
  }, [token]);

  const activePlanId = useMemo(() => String(user?.activePlan?.planId || ""), [user?.activePlan?.planId]);
  const purchasedPlanIds = useMemo(
    () =>
      new Set(
        (payments || [])
          .filter((payment) => payment.status === "paid" && payment.planId?._id)
          .map((payment) => String(payment.planId._id))
      ),
    [payments]
  );

  const onBuy = async (plan) => {
    if (!token || !user) {
      toast.error("Please login or create an account to choose or purchase a plan");
      navigate("/auth?redirect=/plans");
      return;
    }

    if (!plan?._id) {
      toast.error("Plan is not available in database. Please contact support.");
      return;
    }

  };


  const regularPlans = plans.filter((plan) => plan.category !== "database_access");
  const dbPacks = plans.filter((plan) => plan.category === "database_access");

  const renderPlanCard = (plan) => {
    const isRecommended = Boolean(plan.recommended);
    const isActive = activePlanId && String(plan._id) === activePlanId;
    const isPurchased = plan?._id && purchasedPlanIds.has(String(plan._id));
    const isExhausted = isActive && (user?.activePlan?.listingsUsed >= (user?.activePlan?.listingLimit || 0));
    const isExpired = isActive && user?.activePlan?.expiresAt && new Date() > new Date(user.activePlan.expiresAt);
    const needsRenewal = isActive && (isExhausted || isExpired);
    const isDbPack = plan.category === "database_access";

    return (
      <article
        key={plan._id || plan.name}
        className={`relative flex h-full flex-col rounded-xl border p-6 shadow-card md:p-7 gsap-card ${
          isRecommended
            ? "border-navy bg-navy text-white shadow-[0_12px_32px_rgba(0,66,162,0.2)]"
            : "border-slate-200 bg-white text-navy"
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className={`text-[11px] font-bold uppercase tracking-[0.22em] ${isRecommended ? "text-slate-400" : "text-slate-500"}`}>
              {isDbPack ? "Database package" : "Subscription plan"}
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">{plan.name}</h2>
            <p className={`mt-2 text-sm leading-6 ${isRecommended ? "text-slate-300" : "text-slate-600"}`}>{plan.subtitle}</p>
          </div>
          {isRecommended ? (
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white">
              Recommended
            </span>
          ) : null}
        </div>

        <div className="mt-8 flex items-end gap-2">
          <span className="text-5xl font-extrabold tracking-tight">{plan.price > 0 ? currency(plan.price) : "Free"}</span>
          {plan.billingLabel ? <span className={`pb-2 text-base font-semibold ${isRecommended ? "text-slate-300" : "text-slate-500"}`}>{plan.billingLabel}</span> : null}
        </div>

        <div className={`mt-6 rounded-[24px] border p-4 ${isRecommended ? "border-white/15 bg-black/10" : "border-slate-200 bg-slate-50"}`}>
          <div className={`grid gap-2 text-sm ${isRecommended ? "text-slate-300" : "text-slate-600"}`}>
            {!isDbPack ? (
              <>
                <p>Posting credits: {plan.listingLimit || 0} listings</p>
                <p>Customer requests: {plan.contactUnlocks || 0} per cycle</p>
                <p>Lead credits: {plan.leadCredits || 0}</p>
                <p>Validity: {plan.durationDays || 0} days</p>
              </>
            ) : (
              <p>Targeted contact access for direct outreach and campaign use.</p>
            )}
            {isActive ? (
              <p className={`pt-2 text-xs font-semibold ${isRecommended ? "text-slate-200" : "text-slate-500"}`}>
                Used: {user?.activePlan?.listingsUsed || 0} / {user?.activePlan?.listingLimit || 0}
              </p>
            ) : null}
          </div>
        </div>

        <ul className="mt-6 space-y-3">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-3">
              <CheckCircleIcon className={`mt-0.5 h-5 w-5 flex-shrink-0 ${isRecommended ? "text-slate-200" : "text-slate-500"}`} />
              <span className={`text-sm leading-6 ${isRecommended ? "text-slate-200" : "text-slate-600"}`}>{feature}</span>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex items-center gap-2">
          {isActive && !needsRenewal && !isDbPack ? (
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isRecommended ? "bg-white/10 text-white" : "bg-slate-100 text-slate-700"}`}>
              Current plan
            </span>
          ) : null}
          {isPurchased && !isActive ? (
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isRecommended ? "bg-white/10 text-white" : "bg-slate-100 text-slate-700"}`}>
              Previously purchased
            </span>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => onBuy(plan)}
          disabled={Boolean(buyingPlanId) || (isActive && !needsRenewal && !isDbPack)}
          className={`mt-auto rounded-lg px-5 py-3.5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${
            isRecommended
              ? "bg-white text-navy hover:bg-surface"
              : "site-button-primary"
          }`}
        >
          {buyingPlanId === plan._id
            ? "Processing..."
            : isDbPack
              ? "Purchase package"
              : needsRenewal
                ? "Renew or upgrade"
                : isActive
                  ? "Current plan"
                  : plan.ctaLabel || "Buy now"}
        </button>
      </article>
    );
  };

  return (
    <main className="page-shell w-full space-y-10 px-4 py-8 sm:px-5 md:py-12 lg:px-6">
      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] gsap-section">
        <div className="marketing-hero rounded-xl p-8 md:p-10 gsap-hero-item">
          <p className="section-tag">Pricing and access</p>
          <h1 className="mt-4 text-3xl font-bold md:text-4xl lg:text-5xl">Choose the plan that matches your property activity.</h1>
          <p className="mt-5 max-w-2xl text-base leading-8">
            Upgrade when you need more listings, more lead access, or higher contact capacity. Plans are available for all logged-in users.
          </p>
        </div>

        <div className="marketing-card p-8 md:p-10 gsap-card">
          <p className="section-tag">Membership benefits</p>
          <h2 className="mt-2 text-2xl font-bold text-navy sm:text-3xl">More visibility, stronger lead access, and simpler plan control.</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="stat-card">
              <p className="text-lg font-bold text-navy">Role-aware</p>
              <p className="mt-2 text-sm text-slate-600">Plans adapt to how each user works on the platform.</p>
            </div>
            <div className="stat-card">
              <p className="text-lg font-bold text-navy">Secure</p>
              <p className="mt-2 text-sm text-slate-600">Payments and activation follow a verified checkout flow.</p>
            </div>
            <div className="stat-card">
              <p className="text-lg font-bold text-navy">Flexible</p>
              <p className="mt-2 text-sm text-slate-600">Renew, upgrade, or buy special database packages as needed.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 gsap-section">
        {regularPlans.map(renderPlanCard)}
      </section>

      {dbPacks.length ? (
        <section className="space-y-6 gsap-section">
          <div className="marketing-card p-6 md:p-8 gsap-card">
            <p className="section-tag">Add-on packages</p>
            <h2 className="mt-2 text-2xl font-bold text-navy sm:text-3xl">Database access packages</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
              Purchase targeted contact databases for outreach workflows and direct campaign activity.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {dbPacks.map(renderPlanCard)}
          </div>
        </section>
      ) : null}

      <QrPaymentModal
        open={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        selectedPlan={selectedPlanForPayment}
        user={user}
        token={token}
        onSuccess={async () => {
          await refreshProfile();
          // We can also trigger reload or tab switch in UserDashboard if we want,
          // but from PlansPage simply updating payments is good.
        }}
      />
    </main>

  );
};

export default PlansPage;
