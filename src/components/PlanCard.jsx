import { currency } from "../utils/format";

const PlanCard = ({ plan, onSelect, active }) => (
  <article className={`rounded-[24px] border p-5 shadow-sm ${active ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-900"}`}>
    <h3 className="text-lg font-bold">{plan.name}</h3>
    <p className={`mt-2 text-2xl font-extrabold ${active ? "text-white" : "text-slate-900"}`}>{currency(plan.price)}</p>
    <p className={`mt-2 text-sm ${active ? "text-slate-300" : "text-slate-600"}`}>{plan.listingLimit} listings, {plan.durationDays} days</p>
    <button
      type="button"
      onClick={() => onSelect(plan)}
      className={`mt-4 w-full rounded-2xl py-3 text-sm font-semibold transition ${active ? "bg-white text-slate-900" : "bg-slate-900 text-white hover:bg-black"}`}
    >
      {active ? "Selected" : "Select Plan"}
    </button>
  </article>
);

export default PlanCard;
