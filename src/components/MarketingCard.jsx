const MarketingCard = ({ children, className = "", hover = true, as: Component = "div", ...props }) => (
  <Component
    className={`marketing-card rounded-xl border border-slate-200 bg-white p-5 shadow-card sm:p-6 ${
      hover ? "transition duration-300 hover:-translate-y-1 hover:border-orange" : ""
    } ${className}`}
    {...props}
  >
    {children}
  </Component>
);

export const IconCircle = ({ children, className = "" }) => (
  <div className={`flex h-12 w-12 items-center justify-center rounded-full border-2 border-navy bg-transparent text-navy sm:h-14 sm:w-14 ${className}`}>
    {children}
  </div>
);

export default MarketingCard;
