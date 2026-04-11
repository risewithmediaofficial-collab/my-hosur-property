import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import useAuth from "../hooks/useAuth";
import { fetchPlans } from "../services/api/planApi";
import { createPaymentIntent, fetchMyPayments, verifyPayment } from "../services/api/paymentApi";
import { loadExternalScript } from "../utils/loadExternalScript";
import { currency } from "../utils/format";

const fallbackPlans = [
  {
    name: "Starter",
    subtitle: "For Casual Searchers",
    price: 0,
    billingLabel: "",
    ctaLabel: "Get Started",
    recommended: false,
    features: ["AI property recommendations", "Save up to 5 properties", "Basic market insights", "Standard support"],
  },
  {
    name: "Premium",
    subtitle: "Most Popular Choice",
    price: 999,
    billingLabel: "/month",
    ctaLabel: "Go Premium",
    recommended: true,
    features: [
      "Everything in Starter",
      "Unlimited property saves",
      "Priority AI matching",
      "Neighborhood crime & safety data",
      "Early access to new listings",
      "Direct verified seller contact",
    ],
  },
  {
    name: "Elite",
    subtitle: "For Serious Investors",
    price: 2499,
    billingLabel: "/month",
    ctaLabel: "Contact Sales",
    recommended: false,
    features: [
      "Everything in Premium",
      "Investment yield projections",
      "Dedicated property manager",
      "Unlimited virtual tours",
      "Verified legal documents",
      "24/7 VIP concierge support",
    ],
  },
];

const orderByName = { Starter: 1, Premium: 2, Elite: 3 };

const normalizePlan = (plan) => {
  const fallback = fallbackPlans.find((item) => item.name.toLowerCase() === String(plan.name || "").toLowerCase());
  return {
    ...fallback,
    ...plan,
    subtitle: plan.subtitle || fallback?.subtitle || "Premium Plan",
    billingLabel: plan.billingLabel ?? fallback?.billingLabel ?? "/month",
    ctaLabel: plan.ctaLabel || fallback?.ctaLabel || "Buy Plan",
    features: plan.features?.length ? plan.features : fallback?.features || [],
    recommended: typeof plan.recommended === "boolean" ? plan.recommended : Boolean(fallback?.recommended),
  };
};

const PlansPage = () => {
  const { token, user, refreshProfile } = useAuth();
  const [plans, setPlans] = useState([]);
  const [buyingPlanId, setBuyingPlanId] = useState("");
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    fetchPlans()
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
  }, []);

  useEffect(() => {
    fetchMyPayments(token).then((res) => setPayments(res.items || [])).catch(() => setPayments([]));
  }, [token]);

  const activePlanId = useMemo(() => String(user?.activePlan?.planId || ""), [user?.activePlan?.planId]);
  const purchasedPlanIds = useMemo(
    () =>
      new Set(
        (payments || [])
          .filter((p) => p.status === "paid" && p.planId?._id)
          .map((p) => String(p.planId._id))
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

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 md:px-8">
      <section className="glass-panel rounded-3xl border border-white/70 bg-gradient-to-br from-white/80 to-[#f1f7ff] p-6 md:p-10">
        <h1 className="text-3xl font-extrabold md:text-4xl">Choose Your Plan</h1>
        <p className="mt-2 text-sm text-ink/75 md:text-base">All plans are available for all logged-in users. Upgrade anytime from this page.</p>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {plans.map((plan) => {
          const isRecommended = Boolean(plan.recommended);
          const isActive = activePlanId && String(plan._id) === activePlanId;
          const isPurchased = plan?._id && purchasedPlanIds.has(String(plan._id));
          
          const isExhausted = isActive && (user?.activePlan?.listingsUsed >= (user?.activePlan?.listingLimit || 0));
          const isExpired = isActive && user?.activePlan?.expiresAt && new Date() > new Date(user.activePlan.expiresAt);
          const needsRenewal = isActive && (isExhausted || isExpired);

          return (
            <article
              key={plan._id || plan.name}
              className={`relative flex h-full flex-col rounded-[2rem] border p-6 shadow-soft md:p-8 ${
                isRecommended ? "border-accent bg-gradient-to-b from-[#9ed4f0] to-[#7dbfe4] text-ink" : "glass-panel border-white/70 bg-white/85 text-ink"
              }`}
            >
              {isRecommended && (
                <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink px-8 py-2 text-xs font-bold uppercase tracking-[0.12em] text-white">
                  Recommended
                </span>
              )}

              <div className="text-center">
                <h2 className="text-4xl font-extrabold md:text-5xl">{plan.name}</h2>
                <p className="mt-2 text-lg font-semibold text-ink/75">{plan.subtitle}</p>
                <div className="mt-6">
                  <span className="text-5xl font-extrabold md:text-6xl">{plan.price > 0 ? currency(plan.price) : "Free"}</span>
                  {!!plan.billingLabel && <span className="ml-2 text-2xl font-semibold text-ink/75">{plan.billingLabel}</span>}
                </div>
              </div>

              <div className="mt-8 grid gap-4">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3 text-xl md:text-2xl">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full text-base font-bold bg-white/70 text-[#2e6f9e]">?</span>
                    <span className="text-base md:text-lg">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl bg-white/70 p-4 text-sm text-ink/80">
                <p>Posting Credits: {plan.listingLimit || 0} listings</p>
                <p>Customer Requests: {plan.contactUnlocks || 0} per cycle</p>
                <p>Lead Credits: {plan.leadCredits || 0}</p>
                <p>Validity: {plan.durationDays || 0} days</p>
                {isActive && (
                   <p className="mt-2 text-xs font-bold text-[#2e6f9e]">
                     Used: {user.activePlan.listingsUsed || 0} / {user.activePlan.listingLimit}
                   </p>
                )}
              </div>

              <button
                onClick={() => onBuy(plan)}
                disabled={Boolean(buyingPlanId) || (isActive && !needsRenewal)}
                className="uiverse-btn mt-8 w-full rounded-3xl bg-ink px-6 py-4 text-lg font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-70"
              >
                {buyingPlanId === plan._id 
                  ? "Processing..." 
                  : needsRenewal 
                    ? "Renew / Upgrade" 
                    : isActive 
                      ? "Current Plan" 
                      : (plan.ctaLabel || "Buy Now")}
              </button>
            </article>
          );
        })}
      </section>
    </main>
  );
};

export default PlansPage;
