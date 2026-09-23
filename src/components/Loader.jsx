const Loader = ({ text = "Loading...", size = 48 }) => (
  <div className="min-h-[320px] grid place-items-center py-16 px-4 text-neutral-800 bg-transparent">
    <div className="flex flex-col items-center gap-4">
      <svg
        style={{ width: `${size}px`, height: `${size}px` }}
        viewBox="25 25 50 50"
        role="status"
        aria-label={text}
        className="animate-spin text-blue-600"
      >
        <circle
          cx="50"
          cy="50"
          r="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray="90, 150"
        />
      </svg>
      <div className="mt-2 text-sm text-slate-700 tracking-wider uppercase font-bold">
        {text}
      </div>
    </div>
  </div>
);

export default Loader;
