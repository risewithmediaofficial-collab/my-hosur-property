import BrandLogo from "./BrandLogo";

const DashboardSidebar = ({
  title,
  subtitle,
  description,
  navItems = [],
  stats = [],
  children,
  rootClassName = "",
  asideClassName = "",
  mainClassName = "",
  contentClassName = "",
}) => {
  return (
    <div className={`flex min-h-[calc(100vh-4rem)] flex-col overflow-x-hidden bg-transparent md:min-h-0 md:flex-row ${rootClassName}`}>
      <aside className={`sticky top-20 z-10 hidden h-[calc(100vh-5rem)] w-[21rem] shrink-0 overflow-y-auto px-4 pb-6 pt-4 md:flex md:min-h-0 md:flex-col ${asideClassName}`}>
        <div className="dashboard-shell flex h-full min-h-0 flex-col gap-6 p-6">
          <div>
            <p className="dashboard-kicker">{subtitle}</p>
            <h1 className="dashboard-display mt-3 text-[2.15rem] font-semibold leading-[1.02] text-slate-900">{title}</h1>
            {description ? <p className="dashboard-muted mt-3 text-sm leading-6">{description}</p> : null}
          </div>

          <div className="flex min-h-0 flex-1 flex-col pt-4 shadow-[inset_0_1px_0_rgba(0,66,162,0.07)]">
            <p className="pb-3 text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">Dashboard sections</p>
            <nav className="min-h-0 flex-1 space-y-1.5 overflow-y-auto pr-1 pb-2">
              {navItems.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => item.onClick?.(item.key)}
                  className={`flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                    item.active
                      ? "bg-slate-50 text-slate-950 shadow-[0_12px_22px_rgba(0,66,162,0.06),inset_0_0_0_1px_rgba(0,66,162,0.1)]"
                      : "bg-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <span className="flex min-w-0 flex-1 items-center gap-3">
                    {item.icon ? <span className="flex-shrink-0 text-base">{item.icon}</span> : null}
                    <span className="min-w-0 truncate">{item.label}</span>
                  </span>
                  {item.badge ? (
                    <span className={`ml-2 rounded-full px-2.5 py-1 text-[10px] font-bold ${item.active ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"}`}>
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              ))}
            </nav>
          </div>

          <div className="pt-4 shadow-[inset_0_1px_0_rgba(0,66,162,0.06)]">
            <div className="flex justify-center">
              <BrandLogo className="h-auto w-[150px]" />
            </div>
            <p className="mt-2 text-center text-xs tracking-[0.16em] text-slate-400">2026</p>
          </div>
        </div>
      </aside>

      <div className="sticky top-[4.5rem] z-20 w-full shrink-0 overflow-x-hidden bg-white px-3 py-3 shadow-[0_12px_28px_rgba(0,66,162,0.08)] md:hidden">
        <div className="mb-3 rounded-[24px] bg-white px-4 py-4 shadow-[inset_0_0_0_1px_rgba(0,66,162,0.07)]">
          <p className="dashboard-kicker">{subtitle}</p>
          <h1 className="dashboard-display mt-2 break-words text-[1.9rem] font-semibold leading-tight text-slate-900">{title}</h1>
          {description ? <p className="dashboard-muted mt-2 text-sm leading-6">{description}</p> : null}
        </div>
        <div className="hide-scrollbar flex gap-2 overflow-x-auto px-0.5 pb-2">
          {navItems.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => item.onClick?.(item.key)}
              className={`flex-shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition ${
                item.active
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white text-slate-600 shadow-[inset_0_0_0_1px_rgba(0,66,162,0.08)] hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <span className="flex items-center gap-1.5 whitespace-nowrap">
                {item.icon ? <span>{item.icon}</span> : null}
                {item.label}
                {item.badge ? <span className="rounded-full bg-black/10 px-1.5 py-0.5 text-[9px] font-bold">{item.badge}</span> : null}
              </span>
            </button>
          ))}
        </div>
      </div>

      <main className={`min-w-0 flex-1 overflow-x-hidden overflow-y-visible md:h-full md:min-h-0 md:overflow-y-auto ${mainClassName}`}>
        <div className="mx-auto min-h-full max-w-6xl px-3 py-4 md:px-6 md:py-8 xl:px-8">
          <section className={`space-y-6 ${contentClassName}`}>{children}</section>
        </div>
      </main>
    </div>
  );
};

export default DashboardSidebar;
