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
  onLogout,
  hideLogo = false,
}) => {
  return (
    <div className={`flex min-h-[calc(100vh-4rem)] flex-col overflow-x-hidden bg-transparent md:min-h-0 md:flex-row ${rootClassName}`}>
      {/* ── Desktop Sidebar ── */}
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

          {!hideLogo && (
            <div className="pt-4 shadow-[inset_0_1px_0_rgba(0,66,162,0.06)]">
              <div className="flex justify-center">
                <BrandLogo className="h-auto w-[180px]" />
              </div>
              <p className="mt-2 text-center text-xs tracking-[0.16em] text-slate-400">2026</p>
            </div>
          )}
        </div>
      </aside>

      {/* ── Mobile Top Bar ── */}
      <div className="md:hidden w-full shrink-0">
        <div className="sticky top-[44px] z-20 w-full bg-white/95 backdrop-blur-md shadow-sm">
          {/* Profile + Logout row */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-3 py-1">
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy text-white text-[11px] font-bold">
                {title?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-800 truncate">{title}</p>
                <p className="text-[9px] text-slate-400 leading-none">{subtitle}</p>
              </div>
            </div>
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="shrink-0 rounded-lg border border-slate-200 px-2 py-0.5 text-[10px] font-semibold text-red-600 transition hover:bg-red-50"
              >
                Logout
              </button>
            )}
          </div>

          {/* Horizontal scrollable tab row */}
          <div className="overflow-x-auto scrollbar-none">
            <nav className="flex min-w-max items-center gap-1 px-3 py-1.5">
              {navItems.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => item.onClick?.(item.key)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition whitespace-nowrap ${
                    item.active
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                  }`}
                >
                  {item.icon ? <span className="flex-shrink-0">{item.icon}</span> : null}
                  <span>{item.label}</span>
                  {item.badge ? (
                    <span className="rounded-full bg-black/15 px-1.5 py-0.5 text-[9px] font-bold">{item.badge}</span>
                  ) : null}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <main className={`min-w-0 flex-1 overflow-x-hidden overflow-y-visible md:h-full md:min-h-0 md:overflow-y-auto ${mainClassName}`}>
        <div className="mx-auto min-h-full max-w-6xl px-3 py-4 md:px-6 md:py-8 xl:px-8">
          <section className={`space-y-6 ${contentClassName}`}>{children}</section>
        </div>
      </main>
    </div>
  );
};

export default DashboardSidebar;
