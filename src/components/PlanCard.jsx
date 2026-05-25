import { currency } from "../utils/format";

const PlanCard = ({ plan, onSelect, active }) => (
  <article
    className={`rounded-xl border p-6 shadow-card transition ${
      active ? "border-orange bg-navy text-white" : "border-slate-200 bg-white text-navy"
    }`}
  >
    <h3 className="text-lg font-bold">{plan.name}</h3>
    <p className={`mt-2 text-2xl font-extrabold ${active ? "text-orange" : "text-navy"}`}>{currency(plan.price)}</p>
    <p className={`mt-2 text-sm ${active ? "text-white" : "text-slate-600"}`}>
      {plan.listingLimit} listings, {plan.durationDays} days
    </p>
    <button
      type="button"
      onClick={() => onSelect(plan)}
      className={`mt-4 w-full rounded-lg py-3 text-sm font-bold transition ${
        active ? "bg-orange text-white hover:bg-orange-hover" : "bg-orange text-white hover:bg-orange-hover"
      }`}
    >
      {active ? "Selected" : "Select Plan"}
    </button>
  </article>
);

export default PlanCard;
