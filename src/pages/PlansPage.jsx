import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { CheckCircleIcon, ShieldCheckIcon } from "../components/AppIcons";
import useAuth from "../hooks/useAuth";
import { fetchPlans } from "../services/api/planApi";
import { createPaymentIntent, fetchMyPayments, verifyPayment } from "../services/api/paymentApi";
import { loadExternalScript } from "../utils/loadExternalScript";
import { currency } from "../utils/format";
import useScrollAnimation from "../hooks/useScrollAnimation";

const fallbackPlans = [
  {
    name: "Starter",
    subtitle: "For casual searchers",
    price: 0,
    billingLabel: "",
    ctaLabel: "Get started",
    recommended: false,
    features: ["AI property recommendations", "Save up to 5 properties", "Basic market insights", "Standard support"],
  },
  {
    name: "Premium",
    subtitle: "Most popular choice",
    price: 999,
    billingLabel: "/month",
    ctaLabel: "Go premium",
    recommended: true,
    features: [
      "Everything in Starter",
      "Unlimited property saves",
      "Priority AI matching",
      "Neighborhood safety context",
      "Early access to new listings",
      "Direct verified seller contact",
    ],
  },
  {
    name: "Elite",
    subtitle: "For serious investors",
    price: 2499,
    billingLabel: "/month",
    ctaLabel: "Contact sales",
    recommended: false,
    features: [
      "Everything in Premium",
      "Investment yield projections",
      "Dedicated property manager",
      "Unlimited virtual tours",
      "Verified legal documents",
      "24/7 support",
    ],
  },
];

const orderByName = { Starter: 1, Premium: 2, Elite: 3 };

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
  const { token, user, refreshProfile } = useAuth();
  const [plans, setPlans] = useState([]);
  const [buyingPlanId, setBuyingPlanId] = useState("");
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    fetchPlans({ targetRole: user?.role })
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

  const openRazorpayCheckout = async (intent, planName) => {
    const loaded = await loadExternalScript("https://checkout.razorpay.com/v1/checkout.js");
    if (!loaded || !window.Razorpay) throw new Error("Unable to load Razorpay checkout");

    return new Promise((resolve, reject) => {
      const options = {
        key: intent.razorpay.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: intent.razorpay.amount,
        currency: intent.razorpay.currency,
        name: "MyHosurProperty",
        description: planName,
        order_id: intent.razorpay.orderId,
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

  const onBuy = async (plan) => {
    if (!plan?._id) {
      toast.error("Plan is not available in database. Run backend seed first.");
      return;
    }

    try {
      setBuyingPlanId(plan._id);
      const intent = await createPaymentIntent(token, { planId: plan._id });

      if (intent.razorpay?.orderId) {
        const paymentResponse = await openRazorpayCheckout(intent, plan.name);
        await verifyPayment(token, {
          paymentId: intent.payment._id,
          razorpayOrderId: paymentResponse.razorpay_order_id,
          razorpayPaymentId: paymentResponse.razorpay_payment_id,
          razorpaySignature: paymentResponse.razorpay_signature,
        });
      } else {
        await verifyPayment(token, { paymentId: intent.payment._id, success: true });
      }

      await refreshProfile();
      const refreshedPayments = await fetchMyPayments(token);
      setPayments(refreshedPayments.items || []);
      toast.success(`${plan.name} plan activated`);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Payment failed");
    } finally {
      setBuyingPlanId("");
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
    </main>
  );
};

export default PlansPage;
