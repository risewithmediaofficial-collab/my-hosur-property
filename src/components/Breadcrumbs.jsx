import { ChevronLeftIcon, ChevronRightIcon } from "./AppIcons";
import { Link } from "react-router-dom";

const Breadcrumbs = ({ items = [], className = "", tone = "light", compactOnMobile = false }) => {
  if (!items.length) return null;
  const backIndex = items.length > 3 ? 1 : 0;

  return (
    <nav aria-label="Breadcrumb" className={`breadcrumbs ${compactOnMobile ? "breadcrumbs-compact" : ""} ${tone === "dark" ? "breadcrumbs-dark" : ""} ${className}`}>
      <ol className="breadcrumbs-list">
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1;
          const isBack = compactOnMobile && index === backIndex && !isCurrent;
          const isParent = index === items.length - 2 && !isBack;
          const hideOnMobile = compactOnMobile && !isCurrent && !isBack && !isParent;

          return (
            <li key={`${item.label}-${index}`} className={`breadcrumbs-item ${isCurrent ? "breadcrumbs-current" : ""} ${isBack ? "breadcrumbs-back" : ""} ${isParent ? "breadcrumbs-parent" : ""} ${hideOnMobile ? "breadcrumbs-mobile-hidden" : ""}`}>
              {index > 0 ? <ChevronRightIcon className="breadcrumbs-separator h-3.5 w-3.5" aria-hidden="true" /> : null}
              {isCurrent || !item.to ? (
                <span aria-current={isCurrent ? "page" : undefined} className="breadcrumbs-label">
                  {item.label}
                </span>
              ) : (
                <Link to={item.to} className="breadcrumbs-link" title={item.label}>
                  {isBack ? <ChevronLeftIcon className="breadcrumbs-back-icon" aria-hidden="true" /> : null}
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
