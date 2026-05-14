import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";

const Breadcrumbs = ({ items = [], className = "" }) => {
  if (!items.length) return null;

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="inline-flex items-center gap-2">
              {index > 0 ? <ChevronRightIcon className="h-3.5 w-3.5 text-slate-400" /> : null}
              {isCurrent || !item.to ? (
                <span aria-current={isCurrent ? "page" : undefined} className="text-slate-700">
                  {item.label}
                </span>
              ) : (
                <Link to={item.to} className="transition hover:text-slate-900">
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
