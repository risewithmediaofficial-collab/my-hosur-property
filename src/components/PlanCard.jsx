import { currency } from "../utils/format";

const PlanCard = ({ plan, onSelect, active }) => (
  <article className={`rounded-2xl border p-5 ${active ? "border-sage bg-sage/5" : "border-clay bg-white"}`}>
    <h3 className="text-lg font-bold">{plan.name}</h3>
    <p className="mt-2 text-2xl font-extrabold text-sage">{currency(plan.price)}</p>
    <p className="mt-2 text-sm text-ink/70">{plan.listingLimit} listings, {plan.durationDays} days</p>
    <button onClick={() => onSelect(plan)} className="mt-4 w-full rounded-lg bg-ink py-2 text-sm font-semibold text-stone">
      {active ? "Selected" : "Select Plan"}
    </button>
  </article>
);

export default PlanCard;
