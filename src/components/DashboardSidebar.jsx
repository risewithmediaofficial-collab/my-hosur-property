const DashboardSidebar = ({ title, subtitle, description, navItems = [], children }) => {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-transparent">
      <aside className="sticky top-20 z-10 hidden h-[calc(100vh-5rem)] w-80 shrink-0 overflow-y-auto px-4 pb-6 pt-4 md:flex md:flex-col">
        <div className="dashboard-shell flex h-full flex-col gap-6 p-6">
          <div>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.26em] text-slate-500">{subtitle}</p>
            <h1 className="text-2xl font-extrabold leading-tight text-slate-900">{title}</h1>
            {description ? <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p> : null}
          </div>

          <div className="dashboard-subpanel flex-1 p-3">
            <p className="px-2 pb-2 text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">Dashboard sections</p>
            <nav className="space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => item.onClick?.(item.key)}
                  className={`flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                    item.active ? "bg-[#b98a53] text-white shadow-sm" : "text-slate-600 hover:bg-[#fff8ef] hover:text-[#8b6b3f] hover:shadow-sm"
                  }`}
                >
                  <span className="flex min-w-0 flex-1 items-center gap-3">
                    {item.icon ? <span className="flex-shrink-0 text-base">{item.icon}</span> : null}
                    <span className="min-w-0 truncate">{item.label}</span>
                  </span>
                  {item.badge ? (
                    <span className={`ml-2 rounded-full px-2 py-0.5 text-[10px] font-bold ${item.active ? "bg-white/15 text-white" : "bg-[#f5e8d4] text-[#8b6b3f]"}`}>
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              ))}
            </nav>
          </div>

          <div className="border-t border-slate-100 pt-4">
            <p className="text-center text-xs text-slate-400">MyHosurProperty 2026</p>
          </div>
        </div>
      </aside>

      <div className="w-full border-b border-slate-200 bg-white px-4 py-3 md:hidden">
        <div className="mb-3 rounded-[24px] border border-[#f0e0c9] bg-white px-4 py-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-slate-500">{subtitle}</p>
          <h1 className="mt-1 text-xl font-extrabold text-slate-900">{title}</h1>
          {description ? <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p> : null}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {navItems.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => item.onClick?.(item.key)}
              className={`flex-shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition ${
                item.active ? "bg-[#b98a53] text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-[#fff8ef] hover:text-[#8b6b3f]"
              }`}
            >
              <span className="flex items-center gap-1.5 whitespace-nowrap">
                {item.icon ? <span>{item.icon}</span> : null}
                {item.label}
                {item.badge ? <span className="rounded-full bg-white/15 px-1.5 py-0.5 text-[9px] font-bold">{item.badge}</span> : null}
              </span>
            </button>
          ))}
        </div>
      </div>

      <main className="min-w-0 flex-1 overflow-auto">
        <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8 xl:px-8">
          <section className="space-y-6">{children}</section>
        </div>
      </main>
    </div>
  );
};

export default DashboardSidebar;
