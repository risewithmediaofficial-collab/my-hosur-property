const DashboardSidebar = ({ title, subtitle, description, navItems = [], stats = [], children }) => {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col bg-transparent md:flex-row">
      <aside className="sticky top-20 z-10 hidden h-[calc(100vh-5rem)] w-[21rem] shrink-0 overflow-y-auto px-4 pb-6 pt-4 md:flex md:flex-col">
        <div className="dashboard-shell flex h-full flex-col gap-6 p-6">
          <div>
            <p className="dashboard-kicker">{subtitle}</p>
            <h1 className="dashboard-display mt-3 text-[2.15rem] font-semibold leading-[1.02] text-slate-900">{title}</h1>
            {description ? <p className="dashboard-muted mt-3 text-sm leading-6">{description}</p> : null}
          </div>

          <div className="flex-1 border-t border-slate-200 pt-4">
            <p className="pb-3 text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">Dashboard sections</p>
            <nav className="space-y-1.5">
              {navItems.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => item.onClick?.(item.key)}
                  className={`flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
                    item.active
                      ? "border-slate-900 bg-slate-50 text-slate-950 shadow-[0_12px_22px_rgba(17,17,17,0.05)]"
                      : "border-transparent bg-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-900"
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

          <div className="border-t border-slate-100 pt-4">
            <p className="text-center text-xs tracking-[0.16em] text-slate-400">MyHosurProperty 2026</p>
          </div>
        </div>
      </aside>

      <div className="sticky top-[4.5rem] z-20 w-full shrink-0 border-b border-slate-200 bg-white px-4 py-3 md:hidden">
        <div className="mb-3 rounded-[24px] border border-slate-200 bg-white px-4 py-4 shadow-sm">
          <p className="dashboard-kicker">{subtitle}</p>
          <h1 className="dashboard-display mt-2 text-[1.9rem] font-semibold leading-none text-slate-900">{title}</h1>
          {description ? <p className="dashboard-muted mt-2 text-sm leading-6">{description}</p> : null}
        </div>
        <div className="hide-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
          {navItems.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => item.onClick?.(item.key)}
              className={`flex-shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition ${
                item.active
                  ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
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

      <main className="min-w-0 flex-1 overflow-visible md:min-h-0 md:overflow-auto">
        <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8 xl:px-8">
          <section className="space-y-6">{children}</section>
        </div>
      </main>
    </div>
  );
};

export default DashboardSidebar;
